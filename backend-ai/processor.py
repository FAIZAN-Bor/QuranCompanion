import torch
import librosa
import numpy as np
from fastdtw import fastdtw
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq, Wav2Vec2FeatureExtractor, Wav2Vec2Model
from scipy.spatial.distance import euclidean, cosine

# ---------------------------------------------------------------------------
# Model constants
# ---------------------------------------------------------------------------
MODEL_ID = "tarteel-ai/whisper-base-ar-quran"
W2V2_MODEL_ID = "jonatasgrosman/wav2vec2-large-xlsr-53-arabic"

# ---------------------------------------------------------------------------
# Lazy-loaded singletons
# ---------------------------------------------------------------------------
_processor = None
_model = None
_device = None

_w2v2_processor = None
_w2v2_model = None

def _get_device() -> str:
    global _device
    if _device is None:
        _device = "cuda" if torch.cuda.is_available() else "cpu"
    return _device

def get_whisper_model():
    """Lazy-load the HuggingFace processor and model."""
    global _processor, _model
    if _processor is None or _model is None:
        device = _get_device()
        print(f"Loading {MODEL_ID} on {device} ...")
        _processor = AutoProcessor.from_pretrained(MODEL_ID)
        _model = AutoModelForSpeechSeq2Seq.from_pretrained(MODEL_ID)
        _model = _model.to(device)
        _model.eval()
        print("Whisper Model loaded successfully.")
    return _processor, _model

def get_neural_audio_model():
    """Lazy-load the Wav2Vec2 model for Pronunciation Scoring."""
    global _w2v2_processor, _w2v2_model
    if _w2v2_processor is None or _w2v2_model is None:
        device = _get_device()
        print(f"Loading Wav2Vec2 ({W2V2_MODEL_ID}) on {device} for Pronunciation ...")
        _w2v2_processor = Wav2Vec2FeatureExtractor.from_pretrained(W2V2_MODEL_ID)
        _w2v2_model = Wav2Vec2Model.from_pretrained(W2V2_MODEL_ID)
        _w2v2_model = _w2v2_model.to(device)
        _w2v2_model.eval()
        print("Wav2Vec2 Model loaded successfully.")
    return _w2v2_processor, _w2v2_model



# ---------------------------------------------------------------------------
# Robust audio loader
# ---------------------------------------------------------------------------

def _load_audio_robust(audio_path: str) -> np.ndarray:
    """
    Load audio from any format (WAV, WebM, MP3, M4A …) and resample to 16 kHz mono.
    Tries librosa first, then pydub as a fallback if soundfile can't handle the format.
    """
    try:
        audio_array, _ = librosa.load(audio_path, sr=16_000, mono=True)
        if len(audio_array) > 0:
            return audio_array
        raise ValueError("Empty audio array from librosa")
    except Exception as e:
        print(f"[_load_audio_robust] librosa failed ({e}), trying pydub …")

    try:
        from pydub import AudioSegment
        import io
        audio_seg = AudioSegment.from_file(audio_path)
        audio_seg = audio_seg.set_frame_rate(16_000).set_channels(1)
        buf = io.BytesIO()
        audio_seg.export(buf, format="wav")
        buf.seek(0)
        audio_array, _ = librosa.load(buf, sr=16_000, mono=True)
        return audio_array
    except Exception as e2:
        raise RuntimeError(f"Could not load audio from {audio_path}: {e2}")


# ---------------------------------------------------------------------------
# Core transcription
# ---------------------------------------------------------------------------

def transcribe_audio(audio_path: str) -> dict:
    """
    Transcribe audio file to text using tarteel-ai/whisper-base-ar-quran.

    Note: `return_timestamps=True` is intentionally NOT used because this
    fine-tuned checkpoint does not have `no_timestamps_token_id` in its
    generation config and raises a ValueError.  Word alignment is done
    by evenly distributing words over the detected audio duration.

    Args:
        audio_path: Path to any audio file (WAV, WebM, MP3 …)

    Returns:
        dict with 'text', 'segments', 'language'
    """
    processor, model = get_whisper_model()
    device = _get_device()

    # Load & resample — works for WAV, WebM, MP3, etc.
    audio_array = _load_audio_robust(audio_path)

    # Build model inputs
    inputs = processor(
        audio_array,
        sampling_rate=16_000,
        return_tensors="pt",
    )
    input_features = inputs["input_features"].to(device)

    # Generate transcription

    with torch.no_grad():
        predicted_ids = model.generate(
            input_features
        )

    # Decode to plain text
    transcription = processor.batch_decode(
        predicted_ids, skip_special_tokens=True
    )[0].strip()

    # The Tarteel fine-tune tokenizer sometimes leaks tags like <|ar|><|transcribe|>
    import re
    transcription = re.sub(r'<\|.*?\|>', '', transcription).strip()

    # Build pseudo-segments (words distributed evenly across the audio)
    total_duration = librosa.get_duration(y=audio_array, sr=16_000)
    segments = _build_fallback_segments(transcription, total_duration)

    return {
        "text": transcription,
        "segments": segments,
        "language": "ar",
    }


def _build_fallback_segments(text: str, total_duration: float) -> list:
    """
    Build a single pseudo-segment with words distributed evenly.
    Compatible with alignment.py's  get_word_timestamps() format.
    """
    words_list = text.split() if text else []
    if not words_list:
        return [{
            "text": "",
            "start": 0.0,
            "end": total_duration,
            "words": [],
        }]

    dur_per_word = total_duration / len(words_list)
    word_entries = [
        {
            "word": w,
            "start": round(i * dur_per_word, 3),
            "end": round((i + 1) * dur_per_word, 3),
            "probability": 0.9,
        }
        for i, w in enumerate(words_list)
    ]
    return [
        {
            "text": text,
            "start": 0.0,
            "end": total_duration,
            "words": word_entries,
        }
    ]


# ---------------------------------------------------------------------------
# MFCC & DTW utilities (unchanged logic, only librosa I/O)
# ---------------------------------------------------------------------------

def extract_mfcc(audio_path: str, n_mfcc: int = 13, sr: int = 16000) -> np.ndarray:
    """
    Extract MFCC features from audio file.

    Returns:
        MFCC feature matrix  (frames × n_mfcc)
    """
    y, sr_actual = librosa.load(audio_path, sr=sr)
    mfccs = librosa.feature.mfcc(y=y, sr=sr_actual, n_mfcc=n_mfcc)
    return mfccs.T


def compare_with_reference(user_audio_path: str, reference_audio_path: str) -> float:
    """
    Compare user audio with reference audio using DTW on Neural features.
    """
    try:
        user_y, user_sr = librosa.load(user_audio_path, sr=16000)
        ref_y, ref_sr = librosa.load(reference_audio_path, sr=16000)

        # Trim leading and trailing silence (critical for isolated Qaida characters)
        # top_db=20 means any sound 20dB below peak is considered silence
        user_y, _ = librosa.effects.trim(user_y, top_db=20)
        ref_y, _ = librosa.effects.trim(ref_y, top_db=20)

        user_emb = extract_neural_embeddings(user_y, user_sr)
        reference_emb = extract_neural_embeddings(ref_y, ref_sr)

        if len(user_emb) > 0 and len(reference_emb) > 0:
            distance, _ = fastdtw(user_emb, reference_emb, dist=cosine)
            max_len = max(len(user_emb), len(reference_emb))
            normalized_distance = distance / max_len

            # Match word-level distance scaling bounds
            similarity = max(0, min(100, 100 * (1.0 - normalized_distance) / (1.0 - 0.3)))
            return similarity
        
        return 50.0

    except Exception as e:
        print(f"Error comparing audio files: {e}")
        return 50.0


def get_audio_duration(audio_path: str) -> float:
    """Get duration of audio file in seconds."""
    y, sr = librosa.load(audio_path, sr=None)
    return librosa.get_duration(y=y, sr=sr)


def get_energy_envelope(audio_path: str, sr: int = 16000) -> np.ndarray:
    """Extract energy envelope from audio for silence/speech detection."""
    y, _ = librosa.load(audio_path, sr=sr)
    return librosa.feature.rms(y=y)[0]


def extract_audio_segment(audio_path: str, start_time: float, end_time: float, sr: int = 16000) -> tuple:
    """
    Extract a segment of audio between start_time and end_time.

    Returns:
        (audio_array, sample_rate)
    """
    y, sr_actual = librosa.load(audio_path, sr=sr)
    start_sample = max(0, int(float(start_time) * sr_actual))
    end_sample = min(len(y), int(float(end_time) * sr_actual))
    return y[start_sample:end_sample], sr_actual


def extract_neural_embeddings(audio_segment: np.ndarray, sr: int = 16000) -> np.ndarray:
    """
    Extract Wav2Vec2 neural embeddings from an audio segment.
    This replaces MFCC to ensure pronunciation scoring is pitch-agnostic.
    """
    if len(audio_segment) < 512:
        return np.zeros((1, 1024))  # W2V2 large hidden size
    
    processor, model = get_neural_audio_model()
    device = _get_device()
    import torch
    
    # Audio to tensor correctly shaped for Wav2Vec2
    inputs = processor(audio_segment, sampling_rate=sr, return_tensors="pt")
    input_values = inputs.input_values.to(device)
    
    with torch.no_grad():
        outputs = model(input_values, output_hidden_states=True)
        # Layer 8 is generally the sweet spot for Phonetic information vs Speaker ID
        hidden_states = outputs.hidden_states
        target_layer = min(8, len(hidden_states) - 1)
        embeddings = hidden_states[target_layer].squeeze(0).cpu().numpy()
        
    return embeddings


def compare_words_with_reference(
    user_audio_path: str,
    user_word_timestamps: list,
    reference_audio_path: str,
    reference_word_timestamps: list,
) -> list:
    """
    Compare each word between student and reference audio using HuBERT Embeddings + DTW.
    """
    word_scores = []
    num_words = min(len(user_word_timestamps), len(reference_word_timestamps))

    for i in range(num_words):
        user_word = user_word_timestamps[i]
        ref_word = reference_word_timestamps[i]

        try:
            user_segment, user_sr = extract_audio_segment(
                user_audio_path,
                user_word.get("start", 0),
                user_word.get("end", 0),
            )
            ref_segment, ref_sr = extract_audio_segment(
                reference_audio_path,
                ref_word.get("start", 0),
                ref_word.get("end", 0),
            )

            # Extract Neural Embeddings instead of MFCC
            user_emb = extract_neural_embeddings(user_segment, user_sr)
            ref_emb = extract_neural_embeddings(ref_segment, ref_sr)

            if len(user_emb) > 0 and len(ref_emb) > 0:
                # Cosine distance ignores volume/scaling, focusing purely on vector angle (phonetics)
                distance, _ = fastdtw(user_emb, ref_emb, dist=cosine)
                max_len = max(len(user_emb), len(ref_emb))
                normalized_distance = distance / max_len
                
                # Cosine distance typically ranges from 0.0 to 2.0.
                # In Wav2Vec2 Layer 8, the baseline distance between completely different phonemes is ~1.0
                # The distance between the exact same phonetic expression by different speakers is ~0.4 - 0.6.
                # Let's map normalized_distance: 0.3 => 100%, 1.0 => 0%
                
                similarity = max(0, min(100, 100 * (1.0 - normalized_distance) / (1.0 - 0.3)))
            else:
                similarity = 50.0

            word_scores.append({
                "word": user_word.get("word", ""),
                "reference_word": ref_word.get("word", ""),
                "user_start": float(user_word.get("start", 0)),
                "user_end": float(user_word.get("end", 0)),
                "ref_start": float(ref_word.get("start", 0)),
                "ref_end": float(ref_word.get("end", 0)),
                "similarity": round(float(similarity), 2),
                "status": "✔ Good" if similarity >= 75 else ("⚠ Fair" if similarity >= 50 else "❌ Needs Work"),
            })

        except Exception as e:
            print(f"Error comparing word {i}: {e}")
            word_scores.append({
                "word": user_word.get("word", ""),
                "reference_word": ref_word.get("word", "") if i < len(reference_word_timestamps) else "",
                "similarity": 50.0,
                "status": "⚠ Error",
                "error": str(e),
            })

    # Extra user words not in reference
    for i in range(num_words, len(user_word_timestamps)):
        word_scores.append({
            "word": user_word_timestamps[i].get("word", ""),
            "reference_word": "",
            "similarity": 0.0,
            "status": "❌ Extra word",
        })

    return word_scores


def get_reference_word_timestamps(reference_audio_path: str) -> list:
    """
    Transcribe reference audio to get word-level timestamps.

    Args:
        reference_audio_path: Path to reference (Qari) audio.

    Returns:
        List of word dicts with  word, start, end, confidence.
    """
    from alignment import get_word_timestamps

    result = transcribe_audio(reference_audio_path)
    segments = result.get("segments", [])
    text = result.get("text", "")

    return get_word_timestamps(segments, text)
