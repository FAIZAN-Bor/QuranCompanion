# Backend AI Setup Guide (Python FastAPI)

Since the artificial intelligence models and dependencies are extremely large (over 1GB), the `venv` (virtual environment) folder is explicitly ignored from Git to save space. 

When another developer (or your partner) pulls this repository, they **MUST** set up their own local Python environment before running the AI server. 

Here is the step-by-step guide to setting up the `backend-ai` environment from scratch.

---

## 🛠️ Step 1: Prerequisites
Before starting, ensure the following are installed on your computer:
1. **Python 3.10+**: Download from [python.org](https://www.python.org/downloads/). Make sure to check "Add Python to PATH" during installation.
2. **FFmpeg**: This is **CRITICAL** for the `librosa` library to process audio files (`.m4a`, `.mp3`). 
   - *Windows:* Install via Winget `winget install ffmpeg` or download from the official site and add it to your System Environment `PATH`.
   - *Mac:* `brew install ffmpeg`
   - *Linux:* `sudo apt install ffmpeg`

> ⚠️ **Important Note regarding FFmpeg:** 
> Inside `backend-ai/main.py` (around Line 8), the path to FFmpeg is currently hardcoded for a specific Windows machine. **You will need to update this path** to point to where FFmpeg is installed on your computer, or ensure FFmpeg is globally accessible in your PATH and remove the manual path injection.

---

## 📦 Step 2: Create a Virtual Environment
You must create a virtual environment to isolate these heavy AI packages from your computer's global Python installation.

1. Open your terminal and navigate to the AI folder:
   ```bash
   cd audio-analysis/backend-ai
   ```
2. Create the virtual environment (this will create a new folder named `venv`):
   ```bash
   python -m venv venv
   ```

---

## 🔌 Step 3: Activate the Virtual Environment
You must activate the environment **every time** you want to run or install packages for this server.

- **On Windows (Command Prompt / PowerShell):**
  ```bash
  venv\Scripts\activate
  ```
- **On Mac / Linux:**
  ```bash
  source venv/bin/activate
  ```
*(You will know it worked successfully if you see `(venv)` appear at the beginning of your terminal prompt).*

---

## ⬇️ Step 4: Install Dependencies
With the virtual environment active, install all the required AI libraries (like PyTorch, Transformers, Librosa, etc.):

```bash
pip install -r requirements.txt
```
*(Note: This step may take 5–10 minutes depending on your internet speed, as it downloads several gigabytes of machine learning frameworks).*

---

## 🚀 Step 5: Run the Server
Once everything is installed, you can start the FastAPI server:

```bash
uvicorn main:app --reload
```
The server will start running on `http://localhost:8000`. 

> **First Run Warning:** The very first time you hit the `/analyze` endpoint, the script will automatically download the `tarteel-ai/whisper-base-ar-quran` and `jonatasgrosman/wav2vec2` models directly from HuggingFace to your local cache. This will take a few minutes, but it only happens once!
