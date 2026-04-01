# QuranCompanion: How to Run the Project

Follow these steps in order to start the full system on your local machine and physical Android device.

## 1. Prerequisites
- **Physical Device:** Connect via USB and ensure **USB Debugging** is enabled.
- **Network:** Ensure your PC and Phone are on the **same Wi-Fi** network.
- **Python:** Ensure you have Python 3.10+ and a virtual environment (`venv`) set up in `backend-ai`.
- **Node.js:** Version 20+ installed.

## 2. Step-by-Step Execution

### Terminal 1: Node.js Backend
```powershell
cd c:\projects\quranCompanion\backend
npm install
npm run dev
```
*Wait for: `🚀 Server is running on port 5000`*

### Terminal 2: Python AI Server
```powershell
cd c:\projects\quranCompanion\backend-ai
# Activate venv if not already active
.\venv\Scripts\activate
# Install dependencies if needed
pip install -r requirements.txt fastdtw
# Run the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Wait for: `INFO: Uvicorn running on http://0.0.0.0:8000`*

### Terminal 3: ADB Connectivity (Crucial)
Run this to ensure the phone can talk to your local backend over USB efficiently:
```powershell
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8000 tcp:8000
```

### Terminal 4: React Native Mobile App
```powershell
cd c:\projects\quranCompanion\mobile
npm install
npm run android
```

## 3. Configuration Notes
- **API URL:** I have updated `mobile/src/services/apiConfig.js` to use your current IP: `192.168.100.8`.
- **If your IP changes:** Run `ipconfig` in CMD, find your IPv4, and update it in `apiConfig.js`.

## 4. Test Credentials
Use these to log in immediately:
- **Email:** `ahmed@test.com`
- **Password:** `password123`
