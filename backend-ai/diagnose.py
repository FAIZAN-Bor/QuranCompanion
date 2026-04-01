import os
import sys

# Diagnostic script
print("--- AI Backend Diagnostic ---")
print(f"Python: {sys.version}")
print(f"Current Directory: {os.getcwd()}")

# Check FFmpeg
ffmpeg_path = r"C:\Users\M. Faizan\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
if os.path.exists(ffmpeg_path):
    print(f"✅ FFmpeg path exists: {ffmpeg_path}")
else:
    print(f"❌ FFmpeg path NOT found: {ffmpeg_path}")

# Check Imports
print("\nChecking imports...")
try:
    import torch
    print(f"✅ torch: {torch.__version__} (CUDA: {torch.cuda.is_available()})")
except Exception as e:
    print(f"❌ torch failed: {e}")

try:
    import fastapi
    print(f"✅ fastapi: {fastapi.__version__}")
except Exception as e:
    print(f"❌ fastapi failed: {e}")

try:
    import transformers
    print(f"✅ transformers: {transformers.__version__}")
except Exception as e:
    print(f"❌ transformers failed: {e}")

try:
    import librosa
    print(f"✅ librosa: {librosa.__version__}")
except Exception as e:
    print(f"❌ librosa failed: {e}")

try:
    from fastdtw import fastdtw
    print("✅ fastdtw: installed")
except Exception as e:
    print(f"❌ fastdtw failed: {e}")

print("\n--- Diagnostic Complete ---")
