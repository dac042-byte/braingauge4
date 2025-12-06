# 🚀 BrainGauge - Quick Start Guide

**Get BrainGauge running in 10 minutes!**

Follow these steps exactly. No prior experience needed.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Python 3.8+** installed → Test: `python --version`
- [ ] **Node.js 16+** installed → Test: `node --version`
- [ ] **OpenAI API Key** → Get from https://platform.openai.com/
- [ ] **Phone with Expo Go** (optional, for testing on device)

**Don't have these?** Install them first:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/
- Expo Go: App Store or Google Play

---

## 📱 STEP 1: Get Your OpenAI API Key (2 minutes)

### 1.1 Go to OpenAI
Open your browser and go to: **https://platform.openai.com/**

### 1.2 Sign Up or Log In
- If you have an account: Log in
- If not: Click "Sign Up" and create an account

### 1.3 Get Your API Key
1. Click your profile icon (top right)
2. Select **"API Keys"**
3. Click **"Create new secret key"**
4. **Copy the key** (starts with `sk-...`)
5. **SAVE IT SOMEWHERE SAFE** - you won't see it again!

Example: `sk-proj-1234567890abcdefghijklmnopqrstuvwxyz`

✅ **You now have your API key!**

---

## 🐍 STEP 2: Set Up the Backend (5 minutes)

### 2.1 Open Terminal/Command Prompt
- **Mac**: Open "Terminal" app
- **Windows**: Open "Command Prompt" or "PowerShell"
- **Linux**: Open your terminal

### 2.2 Navigate to Backend Folder
```bash
cd braingauge4/backend
```

### 2.3 Create Virtual Environment
```bash
python -m venv venv
```
*This creates an isolated Python environment*

### 2.4 Activate Virtual Environment

**On Mac/Linux:**
```bash
source venv/bin/activate
```

**On Windows (Command Prompt):**
```bash
venv\Scripts\activate.bat
```

**On Windows (PowerShell):**
```bash
venv\Scripts\Activate.ps1
```

You should see `(venv)` appear in your terminal prompt!

### 2.5 Install Python Dependencies
```bash
pip install -r requirements.txt
```
*This takes 2-3 minutes. You'll see lots of packages installing.*

### 2.6 Create Environment File
```bash
cp .env.example .env
```

**On Windows (if cp doesn't work):**
```bash
copy .env.example .env
```

### 2.7 Add Your API Key

**On Mac/Linux:**
```bash
nano .env
```

**On Windows:**
```bash
notepad .env
```

**Edit the file to look like this:**
```
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=8000
```

**Replace `sk-your-actual-api-key-here` with the key you copied in Step 1!**

Save and close:
- **nano**: Press `Ctrl+X`, then `Y`, then `Enter`
- **notepad**: Click File → Save, then close

### 2.8 Start the Backend Server
```bash
python app.py
```

**✅ SUCCESS! You should see:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**🎉 Backend is running!**

**Leave this terminal window open and running!**

---

## 📱 STEP 3: Set Up the Mobile App (3 minutes)

### 3.1 Open a NEW Terminal Window
**Don't close the backend terminal!** Open a second terminal window.

### 3.2 Navigate to Mobile App Folder
```bash
cd braingauge4/mobile-app
```

### 3.3 Install Node Dependencies
```bash
npm install
```
*This takes 2-3 minutes. You'll see lots of packages installing.*

### 3.4 Start Expo
```bash
npx expo start
```

**✅ SUCCESS! You should see:**
```
› Metro waiting on exp://192.168.1.XXX:19000
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
```

**🎉 App is ready to launch!**

---

## 🎮 STEP 4: Launch the App

Choose ONE option:

### 🅰️ OPTION A: Run on iPhone

**Requirements:** Mac computer with Xcode installed

1. Make sure iOS Simulator is installed
2. In the Expo terminal, press **`i`**
3. Simulator will open automatically
4. App will load in ~30 seconds

**Skip to Step 5!**

---

### 🅱️ OPTION B: Run on Android Emulator

**Requirements:** Android Studio with emulator

1. Start an Android emulator first
2. In the Expo terminal, press **`a`**
3. App will install and launch automatically

**Skip to Step 5!**

---

### 🅲️ OPTION C: Run on Your Phone (Recommended!)

This is the easiest option!

#### For iPhone:

1. **Install Expo Go** from App Store
2. **Open Camera app**
3. **Point camera at the QR code** in your terminal
4. **Tap the notification** that appears
5. App opens in Expo Go!

#### For Android:

1. **Install Expo Go** from Google Play
2. **Open Expo Go app**
3. **Tap "Scan QR Code"**
4. **Point camera at the QR code** in your terminal
5. App opens in Expo Go!

---

### ⚠️ IMPORTANT: If Using Your Phone

You need to update the API URL so your phone can talk to your computer!

#### 4.1 Find Your Computer's IP Address

**On Mac:**
```bash
ipconfig getifaddr en0
```
Example output: `192.168.1.100`

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter
Example: `192.168.1.100`

**On Linux:**
```bash
hostname -I
```
Example output: `192.168.1.100`

**Write down this IP address!**

#### 4.2 Update the App Configuration

1. **Stop Expo** (press `Ctrl+C` in the mobile-app terminal)

2. **Edit the constants file:**
   ```bash
   # Mac/Linux:
   nano mobile-app/app/utils/constants.js

   # Windows:
   notepad mobile-app\app\utils\constants.js
   ```

3. **Find this line:**
   ```javascript
   export const API_URL = 'http://localhost:8000';
   ```

4. **Change it to (using YOUR IP address):**
   ```javascript
   export const API_URL = 'http://192.168.1.100:8000';
   ```
   *(Replace `192.168.1.100` with the IP you found above)*

5. **Save and close**

6. **Restart Expo:**
   ```bash
   npx expo start
   ```

7. **Reload the app on your phone:**
   - Shake your device
   - Tap "Reload"

---

## 🧪 STEP 5: Test the App (5 minutes)

### 5.1 Check Connection

1. **Open the app**
2. **Tap "Profile" tab** (bottom right, person icon)
3. **Tap "Check Connection"**
4. **Should show "Connected to server successfully!"**

**✅ If it works:** Perfect! Continue to 5.2

**❌ If it fails:**
- Is the backend still running? (check first terminal)
- Did you update the API_URL? (if using phone)
- Are phone and computer on same WiFi? (if using phone)

### 5.2 Complete Your First Assessment (Baseline)

1. **Tap "Check-In" tab** (bottom left)
2. **Tap "Start Assessment"**

#### Speech Test (1 minute):
1. Read the passage displayed
2. Tap the microphone button
3. Read aloud for at least 20 seconds
4. Tap the stop button
5. Wait ~10 seconds for processing

#### Cognitive Tests (2 minutes):
1. **Reaction Time:**
   - Wait for red circle to turn GREEN
   - Tap as fast as you can
   - Do this 10 times

2. **Memory Test:**
   - Letters will flash on screen
   - Tap when current letter matches the letter from 2 steps back
   - Example: A → B → A (tap on second A)

#### Eye Tracking (15 seconds):
1. Grant camera permission
2. Hold phone at arm's length
3. Follow the green dot with your eyes only
4. Keep head still!

### 5.3 View Results

After all tests complete:
- You'll see "Baseline Established!"
- All scores will be 100
- Tap "View Dashboard"

### 5.4 Check Dashboard

1. **Go to "Dashboard" tab**
2. **See your scores:**
   - Neuro Load Score: 100
   - Component scores: Speech, Cognitive, Visual
   - Chart with Week 1 data

🎉 **Congratulations! BrainGauge is working!**

---

## 📊 STEP 6: Try a Second Assessment (Optional)

To see how drift scoring works:

1. **Go to "Check-In" tab**
2. **Complete another assessment**
3. **Perform slightly differently** (speak faster, respond slower, etc.)
4. **Check Dashboard** - scores will show drift from baseline
5. **Go to "Insights" tab** - see recommendations

---

## 🎯 What's Next?

### Daily Use:

**To start the app each day:**

1. **Terminal 1 - Backend:**
   ```bash
   cd braingauge4/backend
   source venv/bin/activate  # Windows: venv\Scripts\activate
   python app.py
   ```

2. **Terminal 2 - App:**
   ```bash
   cd braingauge4/mobile-app
   npx expo start
   ```

3. **Scan QR code** or press `i`/`a`

### Weekly Assessments:

- Complete assessment every week at the same time
- Track trends over 8+ weeks
- Check Insights for recommendations
- Export data from Profile tab

### Customize:

- **Change user ID:** Edit `mobile-app/app/utils/constants.js`
- **Add more passages:** Edit `backend/config.py`
- **Adjust colors:** Edit `mobile-app/app/utils/constants.js`

---

## 🆘 Troubleshooting

### Backend won't start

**"OPENAI_API_KEY not set"**
- Check `.env` file exists in `backend/` folder
- Make sure it contains: `OPENAI_API_KEY=sk-...`
- Restart backend: `Ctrl+C` then `python app.py`

**"Port 8000 already in use"**
```bash
# Find and kill the process using port 8000
# Mac/Linux:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
# Note the PID, then:
taskkill /PID [PID] /F
```

**"Module not found"**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

---

### App won't connect

**"Cannot connect to server"**

**If using simulator/emulator:**
- Make sure backend is running
- Check terminal for "Uvicorn running on..."
- API_URL should be `http://localhost:8000`

**If using physical device:**
- Are phone and computer on same WiFi?
- Did you update API_URL with computer's IP?
- Check IP is correct: `ipconfig getifaddr en0` (Mac)
- Try reloading app (shake phone → Reload)

**Test backend directly:**
- Open browser
- Go to: `http://localhost:8000` (or `http://YOUR_IP:8000`)
- Should see: `{"service":"BrainGauge API","status":"running"}`

---

### App crashes

**Permissions denied**
- Go to phone Settings
- Find Expo Go app
- Enable Camera and Microphone permissions
- Restart app

**"Expo Go needs to reload"**
- Just tap "Reload"
- This is normal during development

---

### Audio upload fails

**Takes too long**
- Check internet connection
- Large files (>10MB) will fail
- Make sure backend is running
- Check backend terminal for errors

**"Transcription failed"**
- Verify OpenAI API key is correct
- Check you have API credits
- Check backend terminal for specific error

---

## 📞 Still Stuck?

1. **Check both terminals for errors**
   - Backend terminal shows API errors
   - Expo terminal shows React Native errors

2. **Read the full documentation:**
   - `README.md` - Complete documentation
   - `STARTUP_GUIDE.md` - Detailed guide
   - `ARCHITECTURE.md` - Technical details

3. **Common issues:**
   - Wrong Python version: Need 3.8+
   - Wrong Node version: Need 16+
   - Forgot to activate venv
   - Wrong API_URL for physical device
   - Phone and computer on different WiFi networks

4. **Start fresh:**
   ```bash
   # Stop everything (Ctrl+C in both terminals)
   # Delete and reinstall:
   cd backend
   rm -rf venv
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   cd ../mobile-app
   rm -rf node_modules
   npm install
   ```

---

## ✅ Success Checklist

After completing all steps, you should have:

- [x] Backend running on `http://localhost:8000`
- [x] App running in Expo
- [x] Connection test passes
- [x] First assessment completed (baseline)
- [x] Dashboard shows Week 1 data
- [x] All scores visible

**🎉 You're all set! Welcome to BrainGauge!**

---

## 💡 Pro Tips

1. **Keep both terminals open** while using the app
2. **Take assessments at same time each week** for best tracking
3. **Don't stress during tests** - it's about trends, not perfection
4. **Export your data regularly** (Profile → Export Data)
5. **Check Insights after 2+ weeks** for meaningful recommendations

---

## 📚 Learn More

- **Features Overview**: Read `README.md`
- **Technical Details**: Read `ARCHITECTURE.md`
- **Complete Setup Guide**: Read `STARTUP_GUIDE.md`
- **Project Overview**: Read `PROJECT_SUMMARY.md`

---

**Need to stop the app?**

- Press `Ctrl+C` in both terminal windows
- Type `deactivate` in backend terminal to exit virtual environment

**Ready to use again?**

- Just repeat Step 6 (start backend, start app, scan QR)

---

**🧠 Track your cognitive performance weekly and optimize your athletic performance!**

Remember: This is NOT a medical device. For performance awareness only.
