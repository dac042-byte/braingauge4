# 📁 BrainGauge - File Guide

**What does each file do? Use this reference!**

---

## 📚 Documentation Files (Read These First!)

### 🌟 **START_HERE.md** ← Start here!
**Best for:** Developers who just want the commands
**Contains:** Quick reference cheat sheet
**Read time:** 2 minutes

### 🎯 **QUICKSTART.md** ← Best for beginners!
**Best for:** Complete beginners
**Contains:** Step-by-step visual guide with screenshots descriptions
**Read time:** 10 minutes (includes setup)

### 📖 **README.md** ← Main documentation
**Best for:** Understanding features and architecture
**Contains:** Complete documentation, API reference, deployment guide
**Read time:** 20 minutes

### 🔧 **STARTUP_GUIDE.md** ← Detailed setup
**Best for:** Troubleshooting and detailed explanations
**Contains:** In-depth setup guide with troubleshooting
**Read time:** 15 minutes

### 🏗️ **ARCHITECTURE.md** ← For developers
**Best for:** Understanding technical implementation
**Contains:** System design, algorithms, data flow, scaling
**Read time:** 30 minutes

### 📊 **PROJECT_SUMMARY.md** ← Project overview
**Best for:** Getting a complete picture of the project
**Contains:** Deliverables, features, statistics, success criteria
**Read time:** 15 minutes

---

## 🐍 Backend Files (Python/FastAPI)

### Configuration Files

**`backend/requirements.txt`**
- Lists all Python packages needed
- Install with: `pip install -r requirements.txt`

**`backend/.env.example`**
- Template for environment variables
- Copy to `.env` and add your OpenAI API key

**`backend/.env`** (you create this)
- Your actual API key and settings
- **NEVER commit to git** (in .gitignore)

**`backend/config.py`**
- App configuration
- Speech passages for assessment
- Scoring weights (35% speech, 40% cognitive, 25% visual)

### Main Application

**`backend/app.py`** ⭐ Main backend server
- FastAPI application with 12 endpoints
- Handles all API requests
- Error handling and validation
- Run with: `python app.py`

### Analysis Models (`backend/models/`)

**`backend/models/speech_analysis.py`**
- Analyzes audio recordings
- Extracts: word count, WPM, filler words, pauses
- Uses librosa for audio processing

**`backend/models/cognitive_analysis.py`**
- Analyzes reaction time tests
- Analyzes n-back memory tests
- Calculates d-prime, accuracy, consistency

**`backend/models/visual_analysis.py`**
- Analyzes eye tracking data
- Calculates smooth pursuit gain
- Detects saccades and blinks

**`backend/models/__init__.py`**
- Makes `models/` a Python package

### Services (`backend/services/`)

**`backend/services/whisper_service.py`**
- Connects to OpenAI Whisper API
- Transcribes audio to text
- Handles API errors

**`backend/services/drift_calculator.py`**
- Calculates baseline (Week 1)
- Calculates drift scores (Week 2+)
- Generates insights and recommendations
- Manages user data storage

**`backend/services/__init__.py`**
- Makes `services/` a Python package

### Data Directories

**`backend/data/`**
- Stores user assessment data as JSON files
- One file per user: `{user_id}.json`
- Contains baseline and history

**`backend/uploads/`**
- Temporary storage for audio files
- Files deleted after processing

---

## 📱 Mobile App Files (React Native/Expo)

### Configuration Files

**`mobile-app/package.json`**
- Lists all npm packages needed
- Install with: `npm install`

**`mobile-app/app.json`**
- Expo configuration
- App name, icon, permissions
- iOS and Android settings

**`mobile-app/babel.config.js`**
- Babel transpiler configuration
- Needed for React Native

### Main Application

**`mobile-app/App.js`** ⭐ App entry point
- Renders AppNavigator
- Sets up status bar
- Root component

### Navigation (`mobile-app/app/navigation/`)

**`mobile-app/app/navigation/AppNavigator.js`**
- Bottom tab navigation
- 4 tabs: Check-In, Dashboard, Insights, Profile
- Icon configuration

### Screens (`mobile-app/app/screens/`)

**`mobile-app/app/screens/WeeklyCheckIn.js`** ⭐
- Main assessment screen
- Orchestrates 3 assessment modules
- Shows progress (Step 1/2/3)
- Handles API calls and results

**`mobile-app/app/screens/Dashboard.js`** ⭐
- Shows Neuro Load Score
- Line chart with trends
- Component score breakdown
- Pull-to-refresh

**`mobile-app/app/screens/Insights.js`** ⭐
- Performance overview
- Component analysis with progress bars
- Personalized recommendations
- General tips

**`mobile-app/app/screens/Profile.js`** ⭐
- User profile
- Connection checker
- Export data
- Reset baseline
- About section

### Components (`mobile-app/app/components/`)

**`mobile-app/app/components/SpeechTest.js`**
- Speech assessment module
- Audio recording with expo-av
- Timer (20-60 seconds)
- Upload to backend

**`mobile-app/app/components/CognitiveTest.js`**
- Reaction time test (10 trials)
- N-back memory test (20 trials)
- Instructions and results
- Response tracking

**`mobile-app/app/components/EyeTrackingTest.js`**
- Eye tracking module
- Camera permission handling
- Smooth pursuit animation
- Simulated tracking data

### Services (`mobile-app/app/services/`)

**`mobile-app/app/services/api.js`** ⭐
- Axios HTTP client
- All 12 API endpoint functions
- Error handling
- Timeout management

**`mobile-app/app/services/storage.js`**
- AsyncStorage wrapper
- Offline data caching
- Pending assessment queue
- Sync management

### Utilities (`mobile-app/app/utils/`)

**`mobile-app/app/utils/constants.js`** ⭐ Important!
- API_URL configuration ← **Edit this for physical devices!**
- USER_ID setting
- Color scheme
- Assessment configuration
- Score thresholds

### Assets (`mobile-app/assets/`)

**`mobile-app/assets/README.md`**
- Guide for creating app icons
- Requirements for publishing
- Temporary solution for development

---

## 🔧 Configuration Files (Root)

**`.gitignore`**
- Files to exclude from git
- Prevents committing secrets (.env)
- Excludes node_modules, venv, etc.

---

## 📂 Directory Structure

```
braingauge4/
│
├── 📚 Documentation (read first!)
│   ├── START_HERE.md          ← Quick commands
│   ├── QUICKSTART.md          ← Step-by-step guide
│   ├── README.md              ← Main docs
│   ├── STARTUP_GUIDE.md       ← Detailed setup
│   ├── ARCHITECTURE.md        ← Technical details
│   ├── PROJECT_SUMMARY.md     ← Overview
│   └── FILE_GUIDE.md          ← This file!
│
├── 🐍 Backend (Python)
│   └── backend/
│       ├── app.py             ← Main server (run this!)
│       ├── config.py          ← Settings
│       ├── requirements.txt   ← Dependencies
│       ├── .env.example       ← Template
│       ├── .env               ← Your API key (create this!)
│       │
│       ├── models/            ← Analysis algorithms
│       │   ├── speech_analysis.py
│       │   ├── cognitive_analysis.py
│       │   └── visual_analysis.py
│       │
│       ├── services/          ← Business logic
│       │   ├── whisper_service.py
│       │   └── drift_calculator.py
│       │
│       ├── data/              ← User data (JSON files)
│       └── uploads/           ← Temp audio files
│
└── 📱 Mobile App (React Native)
    └── mobile-app/
        ├── App.js             ← Entry point
        ├── app.json           ← Expo config
        ├── package.json       ← Dependencies
        ├── babel.config.js    ← Babel config
        │
        └── app/
            ├── navigation/    ← Navigation
            │   └── AppNavigator.js
            │
            ├── screens/       ← 4 main screens
            │   ├── WeeklyCheckIn.js
            │   ├── Dashboard.js
            │   ├── Insights.js
            │   └── Profile.js
            │
            ├── components/    ← 3 assessment tests
            │   ├── SpeechTest.js
            │   ├── CognitiveTest.js
            │   └── EyeTrackingTest.js
            │
            ├── services/      ← API & Storage
            │   ├── api.js
            │   └── storage.js
            │
            ├── utils/         ← Configuration
            │   └── constants.js  ← EDIT THIS!
            │
            └── assets/        ← Icons (for publishing)
```

---

## 🔑 Key Files You'll Edit

### ⚠️ **Must Edit (Required)**

1. **`backend/.env`**
   - Add your OpenAI API key
   - Create from `.env.example`

### 🔧 **May Edit (Optional)**

2. **`mobile-app/app/utils/constants.js`**
   - Change `API_URL` for physical devices
   - Change `USER_ID` for different users
   - Customize colors and thresholds

3. **`backend/config.py`**
   - Add more speech passages
   - Adjust scoring weights
   - Change port number

---

## 📝 Files You DON'T Need to Edit

✅ All screen files - fully functional
✅ All component files - complete
✅ All service files - ready to use
✅ All model files - algorithms implemented
✅ Navigation files - configured
✅ Package files - dependencies listed

**Just install dependencies and run!**

---

## 🎯 Quick Task Guide

### "I want to start the app"
→ Read: `START_HERE.md`
→ Run: `python app.py` (backend) + `npx expo start` (app)

### "I'm getting errors"
→ Read: `QUICKSTART.md` (Troubleshooting section)
→ Check: Backend terminal for error messages

### "I want to customize the app"
→ Edit: `mobile-app/app/utils/constants.js` (colors, settings)
→ Edit: `backend/config.py` (passages, weights)

### "I want to add a new user"
→ Edit: `mobile-app/app/utils/constants.js`
→ Change: `export const USER_ID = 'new_user_id';`

### "I want to understand how it works"
→ Read: `ARCHITECTURE.md` (technical details)
→ Read: `PROJECT_SUMMARY.md` (overview)

### "I want to add features"
→ Read: `ARCHITECTURE.md` (Scaling section)
→ Study: Backend `app.py` and frontend screens

### "I want to deploy to production"
→ Read: `README.md` (Production Deployment section)
→ Add: Authentication, database, HTTPS

---

## 🗂️ Generated Files (Don't Commit)

These are created when you run the app:

**Backend:**
- `backend/venv/` - Python virtual environment
- `backend/data/*.json` - User data files
- `backend/uploads/*.wav` - Temporary audio files
- `backend/__pycache__/` - Python cache

**Frontend:**
- `mobile-app/node_modules/` - npm packages
- `mobile-app/.expo/` - Expo cache
- `mobile-app/.expo-shared/` - Expo shared cache

**All in `.gitignore`** - won't be committed to git

---

## 📊 File Statistics

- **Documentation**: 7 files
- **Backend**: 10 Python files
- **Frontend**: 13 JavaScript files
- **Configuration**: 6 files
- **Total**: ~60 files
- **Total Code**: ~4,000 lines

---

## 💡 Pro Tips

1. **Always read START_HERE.md first** - saves time!
2. **Keep `.env` secret** - never commit it
3. **Edit `constants.js`** for customization
4. **Check both terminals** for errors
5. **Use pull-to-refresh** in app to reload data

---

## 🆘 Most Common Issues

**"Module not found"**
→ Install dependencies: `pip install -r requirements.txt` or `npm install`

**"Cannot connect"**
→ Update `API_URL` in `constants.js` with your IP

**"API key not set"**
→ Create `backend/.env` and add your OpenAI API key

**"Port in use"**
→ Kill process on port 8000, or change port in `.env`

---

**📚 For more help, see the full documentation in README.md**

**🚀 Ready to start? Go to START_HERE.md!**
