# BrainGauge - Detailed Startup Guide

## First-Time Setup (15 minutes)

Follow these steps exactly to get BrainGauge running.

### Step 1: Install Prerequisites

**Python 3.8 or higher**
```bash
python --version  # Should show 3.8+
```

**Node.js 16 or higher**
```bash
node --version    # Should show 16+
npm --version
```

**Install Expo CLI globally** (if not already installed)
```bash
npm install -g expo-cli
```

### Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key (starts with `sk-...`)
6. **Save it somewhere safe** - you can't view it again!

### Step 3: Backend Setup

```bash
# 1. Open terminal and navigate to backend
cd backend

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows Command Prompt:
venv\Scripts\activate.bat

# On Windows PowerShell:
venv\Scripts\Activate.ps1

# You should see (venv) in your terminal prompt

# 4. Install Python dependencies (takes 2-3 minutes)
pip install -r requirements.txt

# 5. Create .env file
cp .env.example .env

# 6. Edit .env file and add your OpenAI API key
# On macOS/Linux:
nano .env

# On Windows:
notepad .env

# Add this line (replace with your actual key):
# OPENAI_API_KEY=sk-your-actual-api-key-here
# Save and close

# 7. Start the backend server
python app.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend is now running!** Keep this terminal window open.

### Step 4: Mobile App Setup

**Open a NEW terminal window** (keep backend running in the first one)

```bash
# 1. Navigate to mobile app directory
cd mobile-app

# 2. Install dependencies (takes 2-3 minutes)
npm install

# 3. Start Expo
npx expo start
```

**Expected Output:**
```
› Metro waiting on exp://192.168.1.XXX:19000
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

✅ **App is ready!** Now choose how to run it:

### Step 5: Run the App

#### Option A: iOS Simulator (Mac only)

```bash
# Press 'i' in the Expo terminal
# Or run:
npx expo start --ios
```

The iOS Simulator will launch automatically.

#### Option B: Android Emulator

1. Make sure Android Studio is installed with an emulator
2. Start an Android emulator
3. Press 'a' in the Expo terminal, or run:

```bash
npx expo start --android
```

#### Option C: Physical Device (Recommended)

**iPhone:**
1. Install "Expo Go" from App Store
2. Open Camera app
3. Point at QR code in terminal
4. Tap notification to open in Expo Go

**Android:**
1. Install "Expo Go" from Google Play
2. Open Expo Go app
3. Tap "Scan QR Code"
4. Point at QR code in terminal

**IMPORTANT for Physical Devices:**

You must update the API URL to use your computer's local IP address.

1. Find your computer's IP address:

**On Mac:**
```bash
ipconfig getifaddr en0
# Example output: 192.168.1.100
```

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
# Example: 192.168.1.100
```

**On Linux:**
```bash
hostname -I
# Example output: 192.168.1.100
```

2. Edit `mobile-app/app/utils/constants.js`:

```javascript
// Change this line:
export const API_URL = 'http://localhost:8000';

// To (replace with YOUR IP):
export const API_URL = 'http://192.168.1.100:8000';
```

3. Save the file
4. Shake your phone and tap "Reload" in Expo Go

**Note:** Your phone and computer must be on the same WiFi network!

### Step 6: Test the Complete Flow

1. **Check Connection**
   - Open the app
   - Go to "Profile" tab (bottom right)
   - Tap "Check Connection"
   - Should show "Connected"

2. **Complete First Assessment** (Baseline)
   - Go to "Check-In" tab
   - Tap "Start Assessment"
   - Complete Speech Test (read passage aloud for 20-60 seconds)
   - Complete Cognitive Tests (reaction time + memory)
   - Complete Eye Tracking (follow the dot)
   - You'll see "Baseline Established!"

3. **View Dashboard**
   - Go to "Dashboard" tab
   - See your baseline scores (all 100)
   - See chart with Week 1 data

4. **Complete Second Assessment**
   - Do another check-in
   - Scores now show drift from baseline
   - Dashboard updates with trends

5. **Check Insights**
   - Go to "Insights" tab
   - See recommendations (available after 2+ assessments)

## Daily Usage

### Starting the Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

Keep this running while using the app.

### Starting the Mobile App

```bash
cd mobile-app
npx expo start
```

Then open in simulator or scan QR code.

## Stopping the Services

**Backend:**
- Press `Ctrl+C` in the backend terminal
- Type `deactivate` to exit virtual environment

**Mobile App:**
- Press `Ctrl+C` in the Expo terminal

## Quick Troubleshooting

### "Cannot connect to server"

1. Is backend running? Check terminal for `Uvicorn running on...`
2. Did you update API_URL for physical devices?
3. Are phone and computer on same WiFi?
4. Try this in Profile → Check Connection

### "OPENAI_API_KEY not set"

1. Check `backend/.env` file exists
2. Verify it contains: `OPENAI_API_KEY=sk-...`
3. No spaces around the `=`
4. Restart the backend server

### "Module not found" (Python)

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Module not found" (Node)

```bash
cd mobile-app
rm -rf node_modules
npm install
```

### Backend shows errors

Check terminal output for specific errors. Common issues:
- Port 8000 in use: Change PORT in `.env`
- Missing packages: Run `pip install -r requirements.txt`
- Invalid API key: Check `.env` file

### App crashes during recording

1. Grant microphone permission in Settings
2. Restart the app
3. Try recording again

### Charts not showing

1. Complete at least one assessment
2. Pull down to refresh Dashboard
3. Check backend terminal for errors

## Testing Individual Features

### Test Speech Analysis

1. Go to Check-In
2. Start assessment
3. When recording starts, read the passage naturally
4. Record for at least 20 seconds
5. Check backend terminal - should see Whisper API call
6. Wait for transcription (5-10 seconds)

### Test Cognitive Tests

**Reaction Time:**
- Wait for circle to turn GREEN
- Don't tap on red (too early warning)
- Complete all 10 trials

**N-back Memory:**
- Tap when current letter matches letter 2 positions back
- Example: A → B → A (tap on second A)
- Don't stress - it's difficult by design

### Test Eye Tracking

1. Grant camera permission
2. Hold phone at arm's length
3. Keep head still
4. Move ONLY your eyes to follow the dot
5. Test runs for 15 seconds

## Data Management

### View Your Data

```bash
# Backend stores data in JSON files
cat backend/data/athlete_001.json
```

### Export Data

1. Go to Profile tab
2. Tap "Export Data"
3. Share or save the JSON

### Reset Baseline

1. Go to Profile tab
2. Tap "Reset Baseline"
3. Confirm (THIS DELETES ALL DATA)
4. Next assessment becomes new baseline

## Development Tips

### Backend Hot Reload

FastAPI automatically reloads when you edit Python files.

### Frontend Hot Reload

Expo automatically reloads when you edit JavaScript files. Or:
- Shake device → Reload
- Press 'r' in Expo terminal

### View Logs

**Backend:**
- Watch terminal running `python app.py`

**Frontend:**
- Check Expo terminal
- Or shake device → "Show Dev Menu" → "Debug Remote JS"

## Next Steps

- Read the full README.md for detailed documentation
- Check API endpoints in backend/app.py
- Customize UI colors in mobile-app/app/utils/constants.js
- Add more users by changing USER_ID

## Support

If you're stuck:
1. Check error messages in terminal
2. Review this guide again
3. Verify all prerequisites are installed
4. Check that .env file has API key
5. Ensure phone and computer on same network (physical devices)

---

**You're ready to use BrainGauge!** 🧠📊

Complete your first weekly assessment to establish your baseline, then track your cognitive performance over time.
