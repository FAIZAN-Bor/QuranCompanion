from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import sys

# FORCE ADD FFMPEG TO PATH
ffmpeg_path = r"C:\Users\M. Faizan\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
if os.path.exists(ffmpeg_path):
    os.environ["PATH"] += os.pathsep + ffmpeg_path
    print(f"Added FFmpeg to PATH: {ffmpeg_path}")
else:
    print(f"WARNING: FFmpeg path not found: {ffmpeg_path}")

from processor import transcribe_audio, extract_mfcc, compare_with_reference, compare_words_with_reference, get_reference_word_timestamps
from alignment import get_word_timestamps
from utils import calculate_wer, analyze_tajweed, generate_mistakes_list

app = FastAPI(
    title="Quran Recitation AI Analyzer",
    description="AI pipeline for analyzing Quran recitation quality and Tajweed rules",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Quran Recitation AI Analyzer API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze_recitation(
    audio: UploadFile = File(...),
    ground_truth: str = Form(...),
    reference_audio_url: str = Form(default=""),
    module: str = Form(default="Quran"),
    lesson_number: int = Form(default=0)
):
    """
    Analyze a Quran recitation audio file.
    
    Args:
        audio: User's recitation audio file (WAV format preferred)
        ground_truth: The correct Ayah text in Arabic
        reference_audio_url: Optional URL to reference Qari audio for comparison
    
    Returns:
        Analysis results including transcription, accuracy, and Tajweed feedback
    """
    try:
        # Read uploaded bytes first so we can detect the real format
        content = await audio.read()

        # Detect format from magic bytes
        if content[:4] == b'RIFF':
            suffix = ".wav"
        elif content[:4] == b'fLaC':
            suffix = ".flac"
        elif content[:3] == b'ID3' or content[:2] == b'\xff\xfb':
            suffix = ".mp3"
        elif content[:4] in (b'\x1aE\xdf\xa3', b'\x1aE\xdf\xa3'):  # EBML / WebM/MKV
            suffix = ".webm"
        elif b'ftypM4A' in content[:12] or b'ftypmp42' in content[:12]:
            suffix = ".m4a"
        else:
            # Fallback: try guessing from the uploaded filename
            orig_name = audio.filename or ""
            ext = os.path.splitext(orig_name)[-1].lower()
            suffix = ext if ext in (".wav", ".webm", ".mp3", ".m4a", ".ogg", ".flac") else ".webm"

        # Save uploaded audio to temp file with correct extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        try:
            import librosa
            
            # OPTIMIZATION: Stop using Whisper on Qaida 1-6!
            # Isolated sounds (Lessons 1-3) and short combinations (Lessons 4-6) are notoriously bad for STT models.
            # Using Whisper here causes false penalties and adds a massive 3-5 seconds of delay.
            if module.lower() == 'qaida' and lesson_number <= 6:
                print(f"Qaida {lesson_number} detected. Bypassing Whisper STT. Assuming Text is perfect.")
                audio_dur = librosa.get_duration(path=temp_audio_path)
                recognized_text = ground_truth
                transcription_result = {"text": ground_truth, "language": "ar"}
                wer_result = {
                    "wer": 0, 
                    "status": "✔ Excellent", 
                    "insertions": 0, 
                    "deletions": 0, 
                    "substitutions": 0,
                    "gt_normalized": ground_truth,
                    "hyp_normalized": ground_truth
                }
                
                # Build pseudo-alignment spanning the entire audio duration
                aligned_words = [{
                    "word": w,
                    "start": round(i * (audio_dur / max(1, len(ground_truth.split()))), 3),
                    "end": round((i + 1) * (audio_dur / max(1, len(ground_truth.split()))), 3),
                    "status": "ok"
                } for i, w in enumerate(ground_truth.split())]
            else:
                # Step 1: Transcribe audio using Whisper
                transcription_result = transcribe_audio(temp_audio_path)
                recognized_text = transcription_result["text"]
                word_timestamps = transcription_result.get("segments", [])
                
                # Step 2: Calculate Word Error Rate
                wer_result = calculate_wer(ground_truth, recognized_text)
                
                # Step 3: Get word-level alignment
                aligned_words = get_word_timestamps(word_timestamps, ground_truth)
            
            # Step 5: Compare with reference if available (word-by-word)
            pronunciation_score = 100.0
            word_comparison_results = []
            reference_word_timestamps = []
            
            if reference_audio_url:
                reference_path = None
                downloaded_ref_file = None

                # Check if it's an external URL
                if reference_audio_url.startswith("http://") or reference_audio_url.startswith("https://"):
                    print(f"Downloading remote reference audio: {reference_audio_url}")
                    import urllib.request
                    
                    # Detect format from URL ending (fallback to mp3)
                    ext = ".mp3"
                    if ".wav" in reference_audio_url.lower(): ext = ".wav"
                    elif ".webm" in reference_audio_url.lower(): ext = ".webm"
                    
                    temp_ref = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
                    temp_ref.close()  # Close so urlretrieve can write to it
                    try:
                        urllib.request.urlretrieve(reference_audio_url, temp_ref.name)
                        reference_path = temp_ref.name
                        downloaded_ref_file = temp_ref.name
                    except Exception as e:
                        print(f"Failed to download reference audio: {e}")
                        
                else:
                    # It's a local path
                    possible_paths = [
                        reference_audio_url,
                        reference_audio_url.lstrip('/'),
                        os.path.join('uploads', os.path.basename(reference_audio_url)),
                        reference_audio_url.replace('/', os.sep),
                        # For local development - backend uploads folder
                        os.path.join('..', 'backend', 'uploads', os.path.basename(reference_audio_url)),
                        os.path.join('..', 'backend', reference_audio_url.lstrip('/')),
                    ]
                    
                    print(f"Looking for local reference audio. URL: {reference_audio_url}")
                    print(f"Trying paths: {possible_paths}")
                    
                    for path in possible_paths:
                        if os.path.exists(path):
                            reference_path = path
                            break
                
                if reference_path:
                    print(f"Found reference audio at: {reference_path}")
                    
                    # OPTIMIZATION: Bypassing Whisper on Qari Reference audio for Qaida 1-6
                    if module.lower() == 'qaida' and lesson_number <= 6:
                        import librosa
                        ref_dur = librosa.get_duration(path=reference_path)
                        reference_word_timestamps = [{
                            "word": w,
                            "start": round(i * (ref_dur / max(1, len(ground_truth.split()))), 3),
                            "end": round((i + 1) * (ref_dur / max(1, len(ground_truth.split()))), 3),
                            "probability": 1.0
                        } for i, w in enumerate(ground_truth.split())]
                    else:
                        # Get word timestamps from reference audio using Whisper
                        reference_word_timestamps = get_reference_word_timestamps(reference_path)
                    
                    print(f"Reference has {len(reference_word_timestamps)} words")
                    
                    # Perform word-by-word comparison (HuBERT Embeddings)
                    word_comparison_results = compare_words_with_reference(
                        temp_audio_path,
                        aligned_words,
                        reference_path,
                        reference_word_timestamps
                    )
                    
                    # Calculate overall pronunciation score from word scores
                    if word_comparison_results:
                        total_similarity = sum(w.get("similarity", 0) for w in word_comparison_results)
                        pronunciation_score = total_similarity / len(word_comparison_results)
                    else:
                        print("Warning: word_comparison_results was empty (likely Whisper ignored single character).")
                        # Do not leave it at 100.0% blindly
                    
                    # Also get overall score using full audio comparison
                    overall_pronunciation = compare_with_reference(temp_audio_path, reference_path)
                    print(f"Word-level avg: {pronunciation_score:.2f}%, Full audio: {overall_pronunciation:.2f}%")
                    
                    # For isolated letters, text alignment is meaningless. Use raw audio-to-audio phonetic comparison.
                    if module.lower() == 'qaida' and lesson_number <= 3:
                        print("Qaida 1-3 detected: Overriding piece-meal score with Full Audio DTW comparison.")
                        pronunciation_score = overall_pronunciation
                else:
                    print(f"Reference audio not found. Tried: {possible_paths}")
            
            # Step 6: Analyze Tajweed rules (Now using Qari reference timestamps for Smarter Duration checks!)
            tajweed_analysis = analyze_tajweed(temp_audio_path, aligned_words, ground_truth, reference_word_timestamps)
            
            # Step 7: Generate mistakes list
            mistakes = generate_mistakes_list(
                ground_truth, 
                recognized_text, 
                wer_result,
                tajweed_analysis
            )
            
            # Calculate overall accuracy score with DYNAMIC WEIGHTING
            # Based on the module and lesson number (Qaida lessons need different weights)
            text_accuracy = max(0, 100 - wer_result["wer"])
            
            # Dynamic weighting system for Qaida lessons:
            #   Lessons 1-3 (Alphabet/Vowels/Tanween): Pure Wav2Vec2 (Whisper fails on isolated sounds)
            #   Lessons 4-6 (Shaddah/Sukoon/Madd): Pronunciation + Tajweed duration checks
            #   Lessons 7+  (Words/Joinings): Standard formula (Whisper works on real words)
            if module == "Qaida" and 1 <= lesson_number <= 3:
                # Pure pronunciation comparison — ignore Whisper text completely
                text_weight, pron_weight, tajweed_weight = 0.0, 1.0, 0.0
            elif module == "Qaida" and 4 <= lesson_number <= 6:
                # Pronunciation + Tajweed (Shaddah duration, Madd elongation, Sukoon bounce)
                text_weight, pron_weight, tajweed_weight = 0.0, 0.6, 0.4
            else:
                # Standard formula for Quran ayat and Qaida Lessons 7+
                text_weight, pron_weight, tajweed_weight = 0.5, 0.3, 0.2
            
            overall_accuracy = (
                (text_accuracy * text_weight) +
                (pronunciation_score * pron_weight) +
                (tajweed_analysis["overall_score"] * tajweed_weight)
            )
            
            print(f"Scoring: module={module}, lesson={lesson_number}, weights=({text_weight}/{pron_weight}/{tajweed_weight}), score={overall_accuracy:.2f}")
            
            print(f"DEBUG: Generating pipeline steps for {len(aligned_words)} words")
            # Construct detailed pipeline steps for frontend visualization
            pipeline_steps = {
                "step_0_inputs": {
                    "title": "Inputs to the System",
                    "audio_format": "Any (librosa resamples to 16kHz Mono)",
                    "ground_truth": ground_truth,
                    "reference_audio": reference_audio_url if reference_audio_url else "None"
                },
                "step_1_whisper": {
                    "title": "Whisper (Speech → Text)",
                    "model": "tarteel-ai/whisper-base-ar-quran",
                    "raw_output": recognized_text,
                    "language": transcription_result.get("language", "ar")
                },
                "step_2_normalization": {
                    "title": "Text Matching & Normalization",
                    "transformation": "Uthmani → Standard",
                    "ground_truth_normalized": wer_result["gt_normalized"],
                    "recognized_normalized": wer_result["hyp_normalized"]
                },
                "step_3_alignment": {
                    "title": "Forced Alignment (Text ↔ Audio)",
                    "technique": "Whisper Word Timestamps",
                    "segments": aligned_words
                },
                "step_4_segmentation": {
                    "title": "Word Segmentation",
                    "details": f"Segmented {len(aligned_words)} words based on timestamps",
                    "word_count": len(aligned_words),
                    "word_chunks": [
                        {
                            "word": w["word"],
                            "filename": f"{w['word']}.wav",
                            "time_range": f"{float(w['start']):.2f}–{float(w['end']):.2f}s",
                            "duration_ms": int(round((float(w['end']) - float(w['start'])) * 1000))
                        }
                        for w in aligned_words
                    ]
                },
                "step_5_neural_emb": {
                    "title": "Neural Embeddings (Pronunciation)",
                    "technique": "Wav2Vec2 Phonetic Embeddings + DTW",
                    "similarity_score": round(pronunciation_score, 2),
                    "has_reference": len(word_comparison_results) > 0,
                    "reference_words_count": len(reference_word_timestamps),
                    "per_word_scores": word_comparison_results if word_comparison_results else [
                        {
                            "word": w["word"],
                            "similarity": 0.0,
                            "status": "⚠ No reference audio",
                            "feedback": f"Duration: {int(round((float(w['end']) - float(w['start'])) * 1000))}ms"
                        }
                        for w in aligned_words
                    ]
                },
                "step_6_tajweed": {
                    "title": "Tajweed Rule Engine (9 Rules)",
                    "rules_checked": [
                        "Shaddah", "Ghunnah", "Madd", "Heavy Letters (Tafkheem)",
                        "Idgham", "Ikhfa", "Iqlab", "Izhar", "Qalqalah"
                    ],
                    "shaddah_score": tajweed_analysis.get("shaddah_score"),
                    "ghunnah_score": tajweed_analysis.get("ghunnah_score"),
                    "madd_score": tajweed_analysis.get("madd_score"),
                    "heavy_letter_score": tajweed_analysis.get("heavy_letter_score"),
                    "idgham_score": tajweed_analysis.get("idgham_score"),
                    "ikhfa_score": tajweed_analysis.get("ikhfa_score"),
                    "iqlab_score": tajweed_analysis.get("iqlab_score"),
                    "izhar_score": tajweed_analysis.get("izhar_score"),
                    "qalqalah_score": tajweed_analysis.get("qalqalah_score"),
                    "rule_totals": tajweed_analysis.get("rule_totals", {}),
                    "issues_found": tajweed_analysis.get("issues_found", 0),
                    "rule_checks": tajweed_analysis.get("rule_checks", []),
                    "detailed_rules": tajweed_analysis.get("detailed_rules", {}),
                },
                "step_7_scoring": {
                    "title": "Accuracy Calculation",
                    "formula": "(Text * 0.5) + (Pronunciation * 0.3) + (Tajweed * 0.2)",
                    "text_accuracy": round(text_accuracy, 2),
                    "pronunciation_accuracy": round(pronunciation_score, 2),
                    "tajweed_accuracy": round(tajweed_analysis["overall_score"], 2),
                    "final_score": round(overall_accuracy, 2)
                }
            }
            
            return {
                "pipeline_steps": pipeline_steps,
                "recognized_text": recognized_text,
                "ground_truth": ground_truth,
                "accuracy_score": round(overall_accuracy, 2),
                "word_error_rate": round(wer_result["wer"], 2),
                "pronunciation_score": round(pronunciation_score, 2),
                "mistakes": mistakes,
                "tajweed_analysis": {
                    "maddScore": tajweed_analysis["madd_score"],
                    "ghunnahScore": tajweed_analysis["ghunnah_score"],
                    "shaddahScore": tajweed_analysis["shaddah_score"],
                    "idghamScore": tajweed_analysis.get("idgham_score", 100),
                    "ikhfaScore": tajweed_analysis.get("ikhfa_score", 100),
                    "iqlabScore": tajweed_analysis.get("iqlab_score", 100),
                    "izharScore": tajweed_analysis.get("izhar_score", 100),
                    "qalqalahScore": tajweed_analysis.get("qalqalah_score", 100),
                    "overall_score": tajweed_analysis["overall_score"]
                },
                "word_timestamps": aligned_words,
                "details": {
                    "insertions": wer_result["insertions"],
                    "deletions": wer_result["deletions"],
                    "substitutions": wer_result["substitutions"],
                    "normalized_ground_truth": wer_result["gt_normalized"],
                    "normalized_recognized_text": wer_result["hyp_normalized"]
                }
            }
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_audio_path):
                try:
                    os.unlink(temp_audio_path)
                except:
                    pass
                    
            # Clean up downloaded remote reference audio temp file, if any
            if 'downloaded_ref_file' in locals() and downloaded_ref_file and os.path.exists(downloaded_ref_file):
                try:
                    os.unlink(downloaded_ref_file)
                except:
                    pass
                
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Detailed Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# trigger reload
