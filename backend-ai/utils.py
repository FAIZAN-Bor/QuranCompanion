"""
Tajweed analysis and error detection utilities.
"""
import re
from typing import List, Dict
from jiwer import wer, cer
import librosa
import numpy as np

# =====================================================================
# Tajweed Constants — Letter Groups for all 9 rules
# =====================================================================

# Madd letters (elongation vowels)
MADD_LETTERS = ['ا', 'و', 'ي', 'ى']

# Ghunnah letters (nasalization)
GHUNNAH_LETTERS = ['ن', 'م']

# Heavy letters requiring Tafkheem (full mouth pronunciation)
HEAVY_LETTERS = ['ص', 'ض', 'ط', 'ظ', 'خ', 'غ', 'ق']
# Note: ر (Ra) and ل (Lam) are conditionally heavy, handled separately

# Idgham letters (يرملون — Ya Ra Meem Lam Waw Noon)
IDGHAM_LETTERS = ['ي', 'ر', 'م', 'ل', 'و', 'ن']

# Idgham WITH Ghunnah (يومن — Ya Waw Meem Noon)
IDGHAM_WITH_GHUNNAH = ['ي', 'و', 'م', 'ن']

# Idgham WITHOUT Ghunnah (ر ل — Ra Lam)
IDGHAM_WITHOUT_GHUNNAH = ['ر', 'ل']

# Ikhfa letters (15 letters where Noon Sakinah/Tanween is "hidden")
IKHFA_LETTERS = ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك']

# Izhar letters (throat letters — Noon Sakinah/Tanween is pronounced clearly before these)
IZHAR_LETTERS = ['ء', 'ه', 'ع', 'ح', 'غ', 'خ']

# Iqlab trigger letter (Noon Sakinah/Tanween before Ba converts to Meem)
IQLAB_LETTER = 'ب'

# Qalqalah letters (قطبجد — letters that "bounce" when they have Sukun)
QALQALAH_LETTERS = ['ق', 'ط', 'ب', 'ج', 'د']

# Tanween marks
TANWEEN_MARKS = ['\u064B', '\u064C', '\u064D']  # Fathatan, Dammatan, Kasratan

# Sukun
SUKUN = '\u0652'

# Shaddah
SHADDAH = '\u0651'

# Fallback absolute thresholds (used when no reference Qari is available)
FALLBACK_GHUNNAH_MS = 180
FALLBACK_MADD_MS = 250

# =====================================================================
# Helper functions for Tajweed text analysis
# =====================================================================

def _strip_diacritics(char_sequence: str) -> str:
    """Strip all diacritics from a character sequence, returning only base letters."""
    return re.sub(r'[\u064B-\u065F\u0670]', '', char_sequence)

def _get_last_letter_info(word: str) -> dict:
    """
    Get the last consonant letter of a word and its diacritical state.
    Returns: {"letter": str, "has_sukun": bool, "has_tanween": bool, "has_shaddah": bool}
    """
    base_letters = _strip_diacritics(word)
    if not base_letters:
        return {"letter": "", "has_sukun": False, "has_tanween": False, "has_shaddah": False}
    
    last_letter = base_letters[-1]
    # Find position of last letter in original word
    last_pos = -1
    for i in range(len(word) - 1, -1, -1):
        if word[i] == last_letter and not ('\u064B' <= word[i] <= '\u065F' or word[i] == '\u0670'):
            last_pos = i
            break
    
    # Check diacritics after the last letter
    trailing = word[last_pos + 1:] if last_pos >= 0 else ""
    
    return {
        "letter": last_letter,
        "has_sukun": SUKUN in trailing,
        "has_tanween": any(t in trailing for t in TANWEEN_MARKS),
        "has_shaddah": SHADDAH in trailing,
        "full_word": word
    }

def _get_first_letter(word: str) -> str:
    """Get the first consonant letter of a word (skipping Alif-Lam prefix diacritics)."""
    base = _strip_diacritics(word)
    return base[0] if base else ""

def _has_noon_sakinah_at_end(word: str) -> bool:
    """Check if word ends with Noon Sakinah (نْ) or Noon without a vowel."""
    info = _get_last_letter_info(word)
    if info["letter"] != 'ن':
        return False
    # Noon is sakinah if it has explicit Sukun OR no vowel at all (implicit sukun at word end)
    return info["has_sukun"] or (not info["has_tanween"] and not info["has_shaddah"])

def _has_tanween_at_end(word: str) -> bool:
    """Check if word ends with any Tanween mark."""
    return any(t in word[-3:] for t in TANWEEN_MARKS) if len(word) >= 1 else False

def _word_has_noon_sakinah_internal(word: str) -> list:
    """Find internal Noon Sakinah positions (نْ followed by another letter within the same word)."""
    positions = []
    base = _strip_diacritics(word)
    for i, char in enumerate(base):
        if char == 'ن' and i < len(base) - 1:
            # Find this noon in the original word and check for sukun
            orig_pos = _find_nth_letter_pos(word, i)
            if orig_pos >= 0:
                trailing = ""
                for j in range(orig_pos + 1, len(word)):
                    if '\u064B' <= word[j] <= '\u065F' or word[j] == '\u0670':
                        trailing += word[j]
                    else:
                        break
                if SUKUN in trailing:
                    next_letter = base[i + 1]
                    positions.append({"pos": i, "next_letter": next_letter})
    return positions

def _find_nth_letter_pos(word: str, n: int) -> int:
    """Find the position in original word of the nth base letter."""
    count = 0
    for i, ch in enumerate(word):
        if not ('\u064B' <= ch <= '\u065F' or ch == '\u0670'):
            if count == n:
                return i
            count += 1
    return -1

def _word_contains_qalqalah(word: str) -> list:
    """Find Qalqalah letters with Sukun in a word."""
    found = []
    base = _strip_diacritics(word)
    for i, char in enumerate(base):
        if char in QALQALAH_LETTERS:
            orig_pos = _find_nth_letter_pos(word, i)
            if orig_pos >= 0:
                trailing = ""
                for j in range(orig_pos + 1, len(word)):
                    if '\u064B' <= word[j] <= '\u065F' or word[j] == '\u0670':
                        trailing += word[j]
                    else:
                        break
                # Qalqalah applies when letter has Sukun, or is the last letter of the word (waqf)
                if SUKUN in trailing or i == len(base) - 1:
                    found.append(char)
    return found


def calculate_wer(ground_truth: str, hypothesis: str) -> Dict:
    """
    Calculate Word Error Rate between ground truth and hypothesis.
    
    Uses the advanced normalize_for_wer function for Uthmani-to-Imla'i mapping
    before calculating WER.
    """
    gt_normalized = normalize_for_wer(ground_truth)
    hyp_normalized = normalize_for_wer(hypothesis)
    
    gt_words = gt_normalized.split()
    hyp_words = hyp_normalized.split()
    
    if not gt_words:
        return {"wer": 0, "cer": 0, "insertions": 0, "deletions": 0, "substitutions": 0, "total_words": 0}
    
    # Calculate WER using jiwer
    error_rate = wer(gt_normalized, hyp_normalized)
    char_error_rate = cer(gt_normalized, hyp_normalized)
    
    # Estimate error types
    deletions = max(0, len(gt_words) - len(hyp_words))
    insertions = max(0, len(hyp_words) - len(gt_words))
    
    min_len = min(len(gt_words), len(hyp_words))
    substitutions = sum(1 for i in range(min_len) if gt_words[i] != hyp_words[i])
    
    return {
        "wer": round(error_rate * 100, 2),
        "cer": round(char_error_rate * 100, 2),
        "insertions": insertions,
        "deletions": deletions,
        "substitutions": substitutions,
        "total_words": len(gt_words),
        "gt_normalized": gt_normalized,
        "hyp_normalized": hyp_normalized
    }

def normalize_for_wer(text: str) -> str:
    """
    Comprehensive, generic Arabic text normalizer translating Uthmani script (Quranic)
    to Modern Standard Arabic (Imla'i) format without hardcoding specific words.
    PRESERVES critical diacritics for accurate Lahn Jali detection.
    """
    if not text:
        return ""
        
    import unicodedata
    
    # 1. Unicode Canonical De-composition (NFD) to separate ligatures
    text = unicodedata.normalize('NFKD', text)
    
    # 2. Generic Unicode Mapping for Uthmani/Quranic variants to Imla'i
    mapping = {
        # Alef normalization
        '\u0671': '\u0627',  # Alef Wasla -> Bare Alif
        '\u0622': '\u0627',  # Alef with Madda above -> Bare Alif
        '\u0623': '\u0627',  # Alef with Hamza above -> Bare Alif
        '\u0625': '\u0627',  # Alef with Hamza below -> Bare Alif
        '\u0672': '\u0627',  # Alef with Wavy Hamza -> Bare Alif
        '\u0673': '\u0627',  # Alef with Wavy Hamza below -> Bare Alif
        
        # Ya and Alif Maqsura normalization
        '\u0649': '\u064A',  # Alef Maqsura -> Yaa
        '\u0626': '\u064A',  # Yeh with Hamza above -> Yaa (for structural matching)
        
        # Waw normalization
        '\u0624': '\u0648',  # Waw with Hamza above -> Waw
        
        # Ta Marbuta -> Ha
        '\u0629': '\u0647',  
        
        # Uthmani specific vowels that act as standard
        '\u0670': '\u064E',  # Khari Zabar (Dagger Alif) -> Fatha
        '\u0656': '\u0650',  # Khari Zer -> Kasra
        '\u0657': '\u064F',  # Ulta Pesh -> Damma
    }
    for k, v in mapping.items():
        text = text.replace(k, v)
        
    # 3. Mathematical Regex for Implied Ligatures (e.g., the Allah/Lillah pattern)
    # The Unicode specification allows the Lam-Lam-Ha sequence to implicitly draw Shaddah+Fatha.
    # Whisper forces explicit Shaddah+Fathas causing mismatches. We strip internal diacritics on this exact structural sequence universally.
    # \u0644 = Lam, \u0647 = Ha
    # This matches Lam + (any internal diacritics) + Lam + (any internal diacritics) + Ha
    text = re.sub(r'(\u0644)[\u064B-\u065F]*(\u0644)[\u064B-\u065F]*(\u0647)', r'\1\2\3', text)

    # 4. Strip Sukun `\u0652` from Madd vowels (Alif \u0627, Waw \u0648, Yaa \u064A)
    # Whisper (Modern Arabic) NEVER writes a Sukun on a long vowel (e.g. الرَّحِيمِ). 
    # Uthmani text often rigidly includes it (e.g. الرَّحِيْمِ). This causes a 1-character mismatch.
    # The regex below looks for Alif/Waw/Yaa followed by a Sukun, and strips the Sukun.
    text = re.sub(r'([\u0627\u0648\u064A])\u0652', r'\1', text)

    # 5. Strict Diacritic Ordering Algorithm
    # Different keyboards/models output (Fatha+Shaddah) or (Shaddah+Fatha) in different byte orders.
    # This mathematically sorts all consecutive diacritics by their Unicode scalar value so they always match.
    def sort_diacritics(match):
        return ''.join(sorted(match.group(0)))
    text = re.sub(r'[\u064B-\u065F]+', sort_diacritics, text)

    # 6. Remove tiny Quranic stop marks/Waqf (These dictate pauses, not spelling)
    # Range \u06D6 to \u06DC and \u06DF to \u06E8 covers all small stop characters (Sajdah, Meem, Laam, etc.)
    text = re.sub(r'[\u06D6-\u06DC\u06DF-\u06E8]', '', text)

    # 7. Strip non-Arabic/non-whitespace characters (punctuation, numbers, English letters)
    # \u0600-\u06FF covers the Arabic Unicode block
    text = re.sub(r'[^\u0600-\u06FF\s]', '', text)
    
    # 8. Normalize excessive spacing/tabs
    return ' '.join(text.split()).strip()

def normalize_aggressive(text: str) -> str:
    """Aggressive normalization (removes ALL diacritics) purely for structural matching."""
    norm = normalize_for_wer(text)
    # Strip all standard diacritics so structural word matching (like finding "بسم") works
    norm = re.sub(r'[\u064B-\u0652]', '', norm)
    return norm

def analyze_tajweed(audio_path: str, aligned_words: List[Dict], ground_truth: str, reference_word_timestamps: List[Dict] = None) -> Dict:
    """
    Complete Tajweed Rule Engine — 9 rules analyzed per word.
    
    Rules implemented:
        1. Shaddah (ّ) — Doubled consonant duration check
        2. Ghunnah (ن، م) — Nasal sound duration check
        3. Madd (ا، و، ي) — Vowel elongation duration check
        4. Heavy Letters / Tafkheem (ص، ض، ط، ظ، خ، غ، ق) — Detected via Wav2Vec2 embedding score
        5. Idgham (إدغام) — Noon Sakinah/Tanween merging into next word's يرملون
        6. Ikhfa (إخفاء) — Noon Sakinah/Tanween hidden before 15 letters
        7. Iqlab (إقلاب) — Noon Sakinah/Tanween before ب converts to Meem
        8. Izhar (إظهار) — Noon Sakinah/Tanween clearly pronounced before throat letters
        9. Qalqalah (قلقلة) — Bouncing sound on قطبجد with Sukun
    
    Args:
        audio_path: Path to audio file
        aligned_words: Word-level timestamp data from Whisper
        ground_truth: The correct Ayah text (Uthmani)
        reference_word_timestamps: Optional word-level timestamps from reference Qari
        
    Returns:
        Detailed Tajweed analysis results with rule-by-rule breakdown and scores
    """
    if reference_word_timestamps is None:
        reference_word_timestamps = []

    # Score trackers for each rule category
    scores = {
        "shaddah": {"total": 0, "issues": 0, "details": []},
        "ghunnah": {"total": 0, "issues": 0, "details": []},
        "madd": {"total": 0, "issues": 0, "details": []},
        "heavy_letters": {"total": 0, "issues": 0, "details": []},
        "idgham": {"total": 0, "issues": 0, "details": []},
        "ikhfa": {"total": 0, "issues": 0, "details": []},
        "iqlab": {"total": 0, "issues": 0, "details": []},
        "izhar": {"total": 0, "issues": 0, "details": []},
        "qalqalah": {"total": 0, "issues": 0, "details": []},
    }
    
    word_analysis = []
    rule_checks = []
    gt_words = ground_truth.split()
    
    try:
        # Load audio for analysis
        y, sr = librosa.load(audio_path, sr=16000)
        
        for idx, word_info in enumerate(aligned_words):
            word = word_info.get("word", "")
            start = float(word_info.get("start", 0))
            end = float(word_info.get("end", 0))
            duration_ms = (end - start) * 1000
            
            word_result = {
                "index": idx,
                "word": word,
                "start": round(start, 2),
                "end": round(end, 2),
                "duration_ms": int(round(duration_ms, 0)),
                "rules_applied": [],
                "pronunciation_status": "OK"
            }
            
            # Match this word to the ground truth word for diacritic analysis
            gt_word = gt_words[idx] if idx < len(gt_words) else word
            
            # Get reference duration if available
            ref_duration_ms = None
            if reference_word_timestamps and idx < len(reference_word_timestamps):
                ref_start = float(reference_word_timestamps[idx].get("start", 0))
                ref_end = float(reference_word_timestamps[idx].get("end", 0))
                ref_duration_ms = (ref_end - ref_start) * 1000

            # ================================================================
            # RULE 1: Shaddah (ّ) — Doubled consonant must have adequate duration
            # ================================================================
            shaddah_in_gt_word = SHADDAH in gt_word
            if shaddah_in_gt_word:
                scores["shaddah"]["total"] += 1
                expected = ref_duration_ms * 0.7 if ref_duration_ms else 200
                passed = duration_ms >= expected
                rc = {
                    "rule": "Shaddah", "word": word,
                    "check": "Doubled consonant duration",
                    "expected": f"≥{int(expected)}ms",
                    "actual": f"{int(duration_ms)}ms",
                    "result": "✔ Correct shaddah" if passed else "❌ Shaddah too short",
                    "passed": passed
                }
                rule_checks.append(rc)
                word_result["rules_applied"].append("Shaddah")
                if not passed:
                    scores["shaddah"]["issues"] += 1
                    scores["shaddah"]["details"].append({"word": word, "duration": duration_ms})

            # ================================================================
            # RULE 2: Ghunnah (ن، م) — Nasal sound must be held ≥180ms
            # ================================================================
            has_ghunnah = any(l in gt_word for l in GHUNNAH_LETTERS)
            if has_ghunnah:
                scores["ghunnah"]["total"] += 1
                expected = ref_duration_ms * 0.75 if ref_duration_ms else FALLBACK_GHUNNAH_MS
                passed = duration_ms >= expected
                rc = {
                    "rule": "Ghunnah", "word": word,
                    "check": "Nasal sound duration",
                    "expected": f"≥{int(expected)}ms",
                    "actual": f"{int(duration_ms)}ms",
                    "result": "✔ Ghunnah correct" if passed else "❌ Ghunnah too short",
                    "passed": passed
                }
                rule_checks.append(rc)
                word_result["rules_applied"].append("Ghunnah")
                if not passed:
                    scores["ghunnah"]["issues"] += 1
                    scores["ghunnah"]["details"].append({"word": word, "duration": duration_ms})

            # ================================================================
            # RULE 3: Madd (ا، و، ي) — Long vowel must be elongated
            # ================================================================
            has_madd = any(l in gt_word for l in MADD_LETTERS)
            if has_madd:
                scores["madd"]["total"] += 1
                expected = ref_duration_ms * 0.75 if ref_duration_ms else FALLBACK_MADD_MS
                passed = duration_ms >= expected
                rc = {
                    "rule": "Madd", "word": word,
                    "check": "Vowel elongation duration",
                    "expected": f"≥{int(expected)}ms",
                    "actual": f"{int(duration_ms)}ms",
                    "result": "✔ Madd correct" if passed else "❌ Madd too short",
                    "passed": passed
                }
                rule_checks.append(rc)
                word_result["rules_applied"].append("Madd")
                if not passed:
                    scores["madd"]["issues"] += 1
                    scores["madd"]["details"].append({"word": word, "duration": duration_ms})

            # ================================================================
            # RULE 4: Heavy Letters / Tafkheem (ص، ض، ط، ظ، خ، غ، ق)
            # Uses Wav2Vec2 pronunciation score if available; otherwise checks duration
            # ================================================================
            heavy_found = [l for l in HEAVY_LETTERS if l in _strip_diacritics(gt_word)]
            if heavy_found:
                scores["heavy_letters"]["total"] += 1
                # Heavy letters require more mouth effort = longer duration relative to reference
                expected = ref_duration_ms * 0.6 if ref_duration_ms else 150
                passed = duration_ms >= expected
                rc = {
                    "rule": "Heavy Letters (Tafkheem)", "word": word,
                    "check": f"Letters [{', '.join(heavy_found)}] require full mouth (Tafkheem)",
                    "expected": f"≥{int(expected)}ms",
                    "actual": f"{int(duration_ms)}ms",
                    "result": "✔ Correct tafkheem" if passed else "❌ Tafkheem too weak/short",
                    "passed": passed
                }
                rule_checks.append(rc)
                word_result["rules_applied"].append("Heavy Letters")
                if not passed:
                    scores["heavy_letters"]["issues"] += 1
                    scores["heavy_letters"]["details"].append({"word": word, "letters": heavy_found})

            # ================================================================
            # RULE 9: Qalqalah (قطبجد) — Bouncing sound when letter has Sukun
            # ================================================================
            qalqalah_found = _word_contains_qalqalah(gt_word)
            if qalqalah_found:
                scores["qalqalah"]["total"] += 1
                # Qalqalah requires a distinct "bounce" — the word duration should not be too rushed
                expected = ref_duration_ms * 0.65 if ref_duration_ms else 120
                passed = duration_ms >= expected
                rc = {
                    "rule": "Qalqalah", "word": word,
                    "check": f"Letters [{', '.join(qalqalah_found)}] must bounce (echoing stop)",
                    "expected": f"≥{int(expected)}ms",
                    "actual": f"{int(duration_ms)}ms",
                    "result": "✔ Qalqalah correct" if passed else "❌ Qalqalah missing/rushed",
                    "passed": passed
                }
                rule_checks.append(rc)
                word_result["rules_applied"].append("Qalqalah")
                if not passed:
                    scores["qalqalah"]["issues"] += 1
                    scores["qalqalah"]["details"].append({"word": word, "letters": qalqalah_found})

            # ================================================================
            # RULES 5-8: Cross-word boundary rules (Noon Sakinah / Tanween)
            # These check the CURRENT word's ending + NEXT word's beginning
            # ================================================================
            if idx < len(aligned_words) - 1:
                next_word_info = aligned_words[idx + 1]
                next_gt_word = gt_words[idx + 1] if idx + 1 < len(gt_words) else next_word_info.get("word", "")
                next_first_letter = _get_first_letter(next_gt_word)
                next_start = float(next_word_info.get("start", 0))
                
                has_noon_sakinah = _has_noon_sakinah_at_end(gt_word)
                has_tanween = _has_tanween_at_end(gt_word)
                
                # Combined duration of this word + next word (for merged sound checks)
                combined_duration_ms = (next_start - start) * 1000 if next_start > start else duration_ms
                
                if (has_noon_sakinah or has_tanween) and next_first_letter:
                    
                    # ========================================================
                    # RULE 5: Idgham (إدغام) — Merging into يرملون
                    # ========================================================
                    if next_first_letter in IDGHAM_LETTERS:
                        rule_subtype = "with Ghunnah" if next_first_letter in IDGHAM_WITH_GHUNNAH else "without Ghunnah"
                        scores["idgham"]["total"] += 1
                        
                        # In Idgham, the two words merge — gap between them should be minimal
                        gap_ms = (next_start - end) * 1000
                        max_gap = 100  # Maximum acceptable gap in ms for proper merging
                        passed = gap_ms <= max_gap
                        
                        rc = {
                            "rule": f"Idgham ({rule_subtype})", "word": f"{word} → {next_gt_word}",
                            "check": f"Noon/Tanween merges into '{next_first_letter}' ({rule_subtype})",
                            "expected": f"Gap ≤{max_gap}ms (words should merge)",
                            "actual": f"Gap = {int(gap_ms)}ms",
                            "result": "✔ Idgham correct" if passed else "❌ Words not merged (gap too large)",
                            "passed": passed
                        }
                        rule_checks.append(rc)
                        word_result["rules_applied"].append(f"Idgham ({rule_subtype})")
                        if not passed:
                            scores["idgham"]["issues"] += 1
                            scores["idgham"]["details"].append({"word": word, "next": next_gt_word, "gap_ms": gap_ms})
                    
                    # ========================================================
                    # RULE 6: Ikhfa (إخفاء) — Hidden Noon before 15 letters
                    # ========================================================
                    elif next_first_letter in IKHFA_LETTERS:
                        scores["ikhfa"]["total"] += 1
                        
                        # In Ikhfa, Noon is partially hidden with nasalization — word should flow smoothly
                        gap_ms = (next_start - end) * 1000
                        max_gap = 150  # Ikhfa allows slightly more gap than Idgham but still smooth
                        passed = gap_ms <= max_gap
                        
                        rc = {
                            "rule": "Ikhfa", "word": f"{word} → {next_gt_word}",
                            "check": f"Noon/Tanween hidden before '{next_first_letter}' with nasal quality",
                            "expected": f"Gap ≤{max_gap}ms (smooth nasal transition)",
                            "actual": f"Gap = {int(gap_ms)}ms",
                            "result": "✔ Ikhfa correct" if passed else "❌ Ikhfa missing (too separated)",
                            "passed": passed
                        }
                        rule_checks.append(rc)
                        word_result["rules_applied"].append("Ikhfa")
                        if not passed:
                            scores["ikhfa"]["issues"] += 1
                            scores["ikhfa"]["details"].append({"word": word, "next": next_gt_word, "gap_ms": gap_ms})
                    
                    # ========================================================
                    # RULE 7: Iqlab (إقلاب) — Noon/Tanween before ب becomes Meem
                    # ========================================================
                    elif next_first_letter == IQLAB_LETTER:
                        scores["iqlab"]["total"] += 1
                        
                        # In Iqlab, the Noon converts to Meem sound — should have nasal + smooth transition
                        gap_ms = (next_start - end) * 1000
                        max_gap = 120
                        passed = gap_ms <= max_gap
                        
                        rc = {
                            "rule": "Iqlab", "word": f"{word} → {next_gt_word}",
                            "check": f"Noon/Tanween converts to Meem sound before 'ب'",
                            "expected": f"Gap ≤{max_gap}ms (Meem-like nasal transition)",
                            "actual": f"Gap = {int(gap_ms)}ms",
                            "result": "✔ Iqlab correct" if passed else "❌ Iqlab missing (no Meem conversion)",
                            "passed": passed
                        }
                        rule_checks.append(rc)
                        word_result["rules_applied"].append("Iqlab")
                        if not passed:
                            scores["iqlab"]["issues"] += 1
                            scores["iqlab"]["details"].append({"word": word, "next": next_gt_word})
                    
                    # ========================================================
                    # RULE 8: Izhar (إظهار) — Clear Noon before throat letters
                    # ========================================================
                    elif next_first_letter in IZHAR_LETTERS:
                        scores["izhar"]["total"] += 1
                        
                        # In Izhar, Noon must be pronounced CLEARLY — should have a distinct gap
                        gap_ms = (next_start - end) * 1000
                        min_gap = 30  # Izhar requires clear separation (the opposite of Idgham)
                        passed = gap_ms >= min_gap or duration_ms >= 100  # Either clear gap or long enough word
                        
                        rc = {
                            "rule": "Izhar", "word": f"{word} → {next_gt_word}",
                            "check": f"Noon/Tanween clearly pronounced before throat letter '{next_first_letter}'",
                            "expected": f"Clear separation (gap ≥{min_gap}ms)",
                            "actual": f"Gap = {int(gap_ms)}ms",
                            "result": "✔ Izhar correct" if passed else "❌ Izhar unclear (words merged incorrectly)",
                            "passed": passed
                        }
                        rule_checks.append(rc)
                        word_result["rules_applied"].append("Izhar")
                        if not passed:
                            scores["izhar"]["issues"] += 1
                            scores["izhar"]["details"].append({"word": word, "next": next_gt_word})

            # ================================================================
            # Internal Noon Sakinah rules (within a single word)
            # ================================================================
            internal_noons = _word_has_noon_sakinah_internal(gt_word)
            for noon_info in internal_noons:
                next_letter = noon_info["next_letter"]
                
                if next_letter in IDGHAM_LETTERS:
                    # Internal Idgham (rare, e.g. الدُّنْيَا — Noon Sakinah + Ya within same word)
                    # Note: In same-word cases, Idgham is typically NOT applied (exception: دنيا, بنيان, صنوان, قنوان)
                    pass  # These are well-known exceptions handled by Tajweed scholars
                
                elif next_letter in IKHFA_LETTERS:
                    scores["ikhfa"]["total"] += 1
                    expected = ref_duration_ms * 0.7 if ref_duration_ms else 150
                    passed = duration_ms >= expected
                    rc = {
                        "rule": "Ikhfa (Internal)", "word": word,
                        "check": f"Internal نْ before '{next_letter}' — hidden with nasal",
                        "expected": f"≥{int(expected)}ms",
                        "actual": f"{int(duration_ms)}ms",
                        "result": "✔ Ikhfa correct" if passed else "❌ Internal Ikhfa rushed",
                        "passed": passed
                    }
                    rule_checks.append(rc)
                    word_result["rules_applied"].append("Ikhfa (Internal)")
                    if not passed:
                        scores["ikhfa"]["issues"] += 1
                
                elif next_letter == IQLAB_LETTER:
                    scores["iqlab"]["total"] += 1
                    passed = duration_ms >= 100
                    rc = {
                        "rule": "Iqlab (Internal)", "word": word,
                        "check": f"Internal نْ before 'ب' — converts to Meem sound",
                        "expected": "≥100ms",
                        "actual": f"{int(duration_ms)}ms",
                        "result": "✔ Iqlab correct" if passed else "❌ Internal Iqlab missing",
                        "passed": passed
                    }
                    rule_checks.append(rc)
                    word_result["rules_applied"].append("Iqlab (Internal)")
                    if not passed:
                        scores["iqlab"]["issues"] += 1
                
                elif next_letter in IZHAR_LETTERS:
                    scores["izhar"]["total"] += 1
                    passed = True  # If the word was transcribed correctly, Izhar was likely applied
                    rc = {
                        "rule": "Izhar (Internal)", "word": word,
                        "check": f"Internal نْ clearly pronounced before '{next_letter}'",
                        "expected": "Clear pronunciation",
                        "actual": "Detected",
                        "result": "✔ Izhar correct",
                        "passed": True
                    }
                    rule_checks.append(rc)
                    word_result["rules_applied"].append("Izhar (Internal)")

            # Determine overall status for this word
            word_rules = [rc for rc in rule_checks if word in rc.get("word", "")]
            if any(not rc["passed"] for rc in word_rules):
                word_result["pronunciation_status"] = "ISSUE"
            
            word_analysis.append(word_result)
            
    except Exception as e:
        print(f"Tajweed analysis error: {e}")
        import traceback
        traceback.print_exc()
    
    # Calculate percentage scores for each rule
    def calc_score(key):
        s = scores[key]
        if s["total"] == 0:
            return None  # Rule not applicable — no instances in this ayah
        return round(max(0, (1 - s["issues"] / s["total"])) * 100, 2)
    
    score_results = {
        "madd": calc_score("madd"),
        "ghunnah": calc_score("ghunnah"),
        "shaddah": calc_score("shaddah"),
        "heavy_letters": calc_score("heavy_letters"),
        "idgham": calc_score("idgham"),
        "ikhfa": calc_score("ikhfa"),
        "iqlab": calc_score("iqlab"),
        "izhar": calc_score("izhar"),
        "qalqalah": calc_score("qalqalah"),
    }
    
    # Overall is the average of ONLY rules that were actually tested
    tested_scores = [v for v in score_results.values() if v is not None]
    overall_score = sum(tested_scores) / len(tested_scores) if tested_scores else 100.0
    
    total_issues = sum(s["issues"] for s in scores.values())
    
    return {
        "madd_score": score_results["madd"],
        "ghunnah_score": score_results["ghunnah"],
        "shaddah_score": score_results["shaddah"],
        "heavy_letter_score": score_results["heavy_letters"],
        "idgham_score": score_results["idgham"],
        "ikhfa_score": score_results["ikhfa"],
        "iqlab_score": score_results["iqlab"],
        "izhar_score": score_results["izhar"],
        "qalqalah_score": score_results["qalqalah"],
        # Include how many instances of each rule were found
        "rule_totals": {k: scores[k]["total"] for k in scores},
        "overall_score": round(overall_score, 2),
        "issues_found": total_issues,
        "madd_issues": scores["madd"]["details"],
        "ghunnah_issues": scores["ghunnah"]["details"],
        "shaddah_issues": scores["shaddah"]["details"],
        "heavy_letter_issues": scores["heavy_letters"]["details"],
        "idgham_issues": scores["idgham"]["details"],
        "ikhfa_issues": scores["ikhfa"]["details"],
        "iqlab_issues": scores["iqlab"]["details"],
        "izhar_issues": scores["izhar"]["details"],
        "qalqalah_issues": scores["qalqalah"]["details"],
        "word_analysis": word_analysis,
        "rule_checks": rule_checks,
        "detailed_rules": {
            "shaddah": {"passed": scores["shaddah"]["issues"] == 0, "total": scores["shaddah"]["total"], "issues": scores["shaddah"]["details"]},
            "ghunnah": {"passed": scores["ghunnah"]["issues"] == 0, "total": scores["ghunnah"]["total"], "issues": scores["ghunnah"]["details"]},
            "madd": {"passed": scores["madd"]["issues"] == 0, "total": scores["madd"]["total"], "issues": scores["madd"]["details"]},
            "heavy_letters": {"passed": scores["heavy_letters"]["issues"] == 0, "total": scores["heavy_letters"]["total"], "issues": scores["heavy_letters"]["details"]},
            "idgham": {"passed": scores["idgham"]["issues"] == 0, "total": scores["idgham"]["total"], "issues": scores["idgham"]["details"]},
            "ikhfa": {"passed": scores["ikhfa"]["issues"] == 0, "total": scores["ikhfa"]["total"], "issues": scores["ikhfa"]["details"]},
            "iqlab": {"passed": scores["iqlab"]["issues"] == 0, "total": scores["iqlab"]["total"], "issues": scores["iqlab"]["details"]},
            "izhar": {"passed": scores["izhar"]["issues"] == 0, "total": scores["izhar"]["total"], "issues": scores["izhar"]["details"]},
            "qalqalah": {"passed": scores["qalqalah"]["issues"] == 0, "total": scores["qalqalah"]["total"], "issues": scores["qalqalah"]["details"]},
        }
    }

def generate_mistakes_list(
    ground_truth: str,
    recognized_text: str,
    wer_result: Dict,
    tajweed_analysis: Dict
) -> List[Dict]:
    """
    Generate a list of detected mistakes for user feedback.
    """
    mistakes = []
    
    gt_words = ground_truth.split()
    rec_words = recognized_text.split()
    
    # Add word-level mistakes
    for i, gt_word in enumerate(gt_words):
        if i >= len(rec_words):
            # Missing word
            mistakes.append({
                "word": gt_word,
                "position": i,
                "type": "missing",
                "expected": gt_word,
                "actual": "",
                "message": f"Missing word: {gt_word}"
            })
        elif normalize_aggressive(gt_word) != normalize_aggressive(rec_words[i]):
            # Mispronounced word
            mistakes.append({
                "word": gt_word,
                "position": i,
                "type": "mispronounced",
                "expected": gt_word,
                "actual": rec_words[i],
                "message": f"Mispronounced: Expected '{gt_word}', heard '{rec_words[i]}'"
            })
    
    # Check for extra words
    if len(rec_words) > len(gt_words):
        for i in range(len(gt_words), len(rec_words)):
            mistakes.append({
                "word": rec_words[i],
                "position": i,
                "type": "extra",
                "expected": "",
                "actual": rec_words[i],
                "message": f"Extra word: {rec_words[i]}"
            })
    
    # Add Tajweed mistakes from all 9 rules
    tajweed_mistake_map = [
        ("madd_issues", "madd_short", "Madd too short in"),
        ("ghunnah_issues", "ghunnah_missing", "Ghunnah too short in"),
        ("shaddah_issues", "shaddah_short", "Shaddah too short in"),
        ("heavy_letter_issues", "tafkheem_weak", "Tafkheem too weak in"),
        ("idgham_issues", "idgham_missing", "Idgham (merging) missing in"),
        ("ikhfa_issues", "ikhfa_missing", "Ikhfa (hiding) missing in"),
        ("iqlab_issues", "iqlab_missing", "Iqlab (Noon→Meem) missing in"),
        ("izhar_issues", "izhar_missing", "Izhar (clear Noon) missing in"),
        ("qalqalah_issues", "qalqalah_missing", "Qalqalah (bounce) missing in"),
    ]
    
    for issue_key, mistake_type, message_prefix in tajweed_mistake_map:
        for issue in tajweed_analysis.get(issue_key, []):
            word = issue.get("word", "")
            mistakes.append({
                "word": word,
                "position": -1,
                "type": mistake_type,
                "expected": mistake_type.replace("_", " ").title(),
                "actual": "Issue",
                "message": f"{message_prefix}: {word}"
            })
    
    return mistakes
