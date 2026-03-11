"""
Forced alignment and word timestamp utilities.
"""
import re
from typing import List, Dict, Optional

def get_word_timestamps(segments: List[dict], ground_truth: str) -> List[Dict]:
    """
    Extract word-level timestamps from Whisper segments.
    
    Args:
        segments: Whisper transcription segments with timestamps
        ground_truth: The correct Ayah text for reference
        
    Returns:
        List of word dictionaries with timing info
    """
    aligned_words = []
    
    for segment in segments:
        # Try to get word-level info if available
        words = segment.get("words", [])
        
        if words:
            for word_info in words:
                aligned_words.append({
                    "word": word_info.get("word", "").strip(),
                    "start": float(word_info.get("start", 0)),
                    "end": float(word_info.get("end", 0)),
                    "confidence": float(word_info.get("probability", 0))
                })
        else:
            # Fallback: split segment text and distribute time evenly
            segment_text = segment.get("text", "").strip()
            segment_words = segment_text.split()
            
            if segment_words:
                start_time = float(segment.get("start", 0))
                end_time = float(segment.get("end", 0))
                duration_per_word = (end_time - start_time) / len(segment_words)
                
                for i, word in enumerate(segment_words):
                    aligned_words.append({
                        "word": word,
                        "start": float(start_time + (i * duration_per_word)),
                        "end": float(start_time + ((i + 1) * duration_per_word)),
                        "confidence": 0.5  # Unknown confidence
                    })
    
    return aligned_words

def find_word_position(word: str, text: str) -> Optional[int]:
    """Find position of word in text."""
    words = text.split()
    try:
        return words.index(word)
    except ValueError:
        return None

def align_transcription_with_ground_truth(
    transcribed_words: List[str],
    ground_truth_words: List[str]
) -> List[Dict]:
    """
    Align transcribed words with ground truth using simple matching.
    
    Returns list of alignment info for each ground truth word.
    """
    alignments = []
    trans_idx = 0
    
    for gt_idx, gt_word in enumerate(ground_truth_words):
        alignment = {
            "position": gt_idx,
            "ground_truth": gt_word,
            "transcribed": None,
            "status": "missing"
        }
        
        # Look for matching word in transcription
        if trans_idx < len(transcribed_words):
            trans_word = transcribed_words[trans_idx]
            
            # Simple Arabic text normalization
            gt_normalized = normalize_arabic(gt_word)
            trans_normalized = normalize_arabic(trans_word)
            
            if gt_normalized == trans_normalized:
                alignment["transcribed"] = trans_word
                alignment["status"] = "correct"
                trans_idx += 1
            elif is_similar_arabic(gt_normalized, trans_normalized):
                alignment["transcribed"] = trans_word
                alignment["status"] = "mispronounced"
                trans_idx += 1
        
        alignments.append(alignment)
    
    return alignments

def normalize_arabic(text: str) -> str:
    """Normalize Arabic text by removing diacritics."""
    # Remove common Arabic diacritics
    diacritics = 'ًٌٍَُِّْـ'
    result = text
    for d in diacritics:
        result = result.replace(d, '')
    return result.strip()

def is_similar_arabic(word1: str, word2: str, threshold: float = 0.7) -> bool:
    """Check if two Arabic words are similar based on character overlap."""
    if not word1 or not word2:
        return False
    
    # Simple character-based similarity
    chars1 = set(word1)
    chars2 = set(word2)
    
    intersection = len(chars1 & chars2)
    union = len(chars1 | chars2)
    
    if union == 0:
        return False
    
    similarity = intersection / union
    return similarity >= threshold
