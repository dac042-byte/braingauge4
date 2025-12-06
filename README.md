# BrainGauge - Cognitive Performance Tracker for Athletes

A mobile application that tracks cognitive changes in athletes through weekly assessments. **NOT a medical device** - purely for performance monitoring and trend awareness.

## Features

### 📊 Three Weekly Assessment Modules

1. **Speech Analysis** (20-60 seconds)
   - Record yourself reading a provided passage
   - Analyzes: words/min, filler words, pause length, speech rate
   - Generates Speech Drift Score (0-100)

2. **Cognitive Tests** (2 minutes)
   - Reaction time test (10 trials)
   - 2-back working memory test (20 trials)
   - Generates Cognitive Drift Score (0-100)

3. **Eye Movement Tracking** (15 seconds)
   - Front camera tracks smooth pursuit of moving dot
   - Measures blink rate and tracking accuracy
   - Generates Visual-Motor Drift Score (0-100)

### 📈 Scoring System

- **Week 1 = Baseline** for all metrics
- Three drift scores combine into **Neuro Load Score** (weighted average)
- Higher score = closer to baseline (better performance)
- Lower score = greater drift from baseline (may indicate fatigue/stress)

### 📱 App Screens

- **Weekly Check-In**: Complete all 3 assessments (~5 minutes)
- **Dashboard**: Line graphs, color-coded status, trend summary
- **Insights**: Identifies areas of concern with recommendations
- **Profile**: Reset baseline, export data, settings

## Tech Stack

- **Frontend**: React Native with Expo (JavaScript)
- **Backend**: Python (FastAPI)
- **Speech-to-Text**: OpenAI Whisper API
- **Audio Analysis**: librosa, scipy
- **Storage**: Local file-based storage + AsyncStorage for offline mode

## Project Structure

```
braingauge4/
├── backend/                  # Python FastAPI backend
│   ├── app.py               # Main API server
│   ├── config.py            # Configuration
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (create this)
│   ├── models/              # Analysis models
│   │   ├── speech_analysis.py
│   │   ├── cognitive_analysis.py
│   │   └── visual_analysis.py
│   ├── services/            # Business logic
│   │   ├── whisper_service.py
│   │   └── drift_calculator.py
│   ├── data/                # User data storage
│   └── uploads/             # Temporary audio files
│
└── mobile-app/              # React Native Expo app
    ├── App.js               # Main app entry
    ├── app.json             # Expo configuration
    ├── package.json         # Dependencies
    └── app/
        ├── screens/         # Main screens
        │   ├── WeeklyCheckIn.js
        │   ├── Dashboard.js
        │   ├── Insights.js
        │   └── Profile.js
        ├── components/      # Assessment components
        │   ├── SpeechTest.js
        │   ├── CognitiveTest.js
        │   └── EyeTrackingTest.js
        ├── services/        # API & storage
        │   ├── api.js
        │   └── storage.js
        ├── utils/           # Constants & helpers
        │   └── constants.js
        └── navigation/
            └── AppNavigator.js
```

## Quick Start Guide

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Expo CLI
- OpenAI API key

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your OpenAI API key
cp .env.example .env
# Edit .env and add your API key:
# OPENAI_API_KEY=sk-your-key-here

# Start the backend server
python app.py
```

The backend will start at `http://localhost:8000`

### 2. Mobile App Setup

```bash
# Navigate to mobile app directory
cd mobile-app

# Install dependencies
npm install

# Start Expo
npx expo start
```

### 3. Running the App

**Option A: iOS Simulator**
```bash
npx expo start --ios
```

**Option B: Android Emulator**
```bash
npx expo start --android
```

**Option C: Physical Device**

1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in terminal
3. **IMPORTANT**: Update the API URL for physical devices:
   - Edit `mobile-app/app/utils/constants.js`
   - Find your computer's local IP (use `ipconfig` or `ifconfig`)
   - Change `API_URL` to `http://YOUR_LOCAL_IP:8000`
   - Example: `export const API_URL = 'http://192.168.1.100:8000';`

## Configuration

### Changing Backend URL

Edit `mobile-app/app/utils/constants.js`:

```javascript
// For local development (simulator/emulator)
export const API_URL = 'http://localhost:8000';

// For physical devices (replace with your computer's IP)
export const API_URL = 'http://192.168.1.XXX:8000';
```

### Changing User ID

Edit `mobile-app/app/utils/constants.js`:

```javascript
export const USER_ID = 'athlete_001'; // Change to unique identifier
```

## Testing the App

### Complete Flow Test

1. **Start Backend**: Ensure backend is running at `http://localhost:8000`
2. **Check Connection**: Go to Profile tab → Check Connection
3. **First Assessment**:
   - Go to Check-In tab
   - Complete all 3 tests
   - This establishes your baseline
4. **View Dashboard**: See your baseline scores
5. **Second Assessment**:
   - Wait or complete another assessment
   - Scores now show drift from baseline
6. **Check Insights**: View recommendations (after 2+ assessments)

### Testing Individual Components

**Speech Test:**
- Speak clearly for 20-60 seconds
- Recording uploads to Whisper API
- Check terminal for transcription

**Cognitive Tests:**
- Reaction time: Tap when circle turns green
- N-back: Tap when letter matches 2 positions back

**Eye Tracking:**
- Grant camera permission
- Follow the green dot smoothly with eyes only

## API Endpoints

### Backend Endpoints

```
GET  /                        - Health check
GET  /health                  - Detailed health status
GET  /passages                - Get speech passages

POST /audio/upload            - Upload audio, get speech metrics
POST /cognitive/submit        - Submit cognitive test results
POST /visual/submit           - Submit eye tracking data
POST /assessment/save         - Save complete assessment

GET  /score/weekly/{user_id}  - Get latest weekly score
GET  /history/{user_id}       - Get assessment history
GET  /insights/{user_id}      - Get personalized insights
GET  /export/{user_id}        - Export all data as JSON

POST /baseline/reset          - Reset baseline (delete all data)
```

## Offline Mode

The app supports offline assessments:

1. Complete assessments without internet
2. Data saves locally via AsyncStorage
3. Automatically syncs when connection restored
4. Cached data shown when server unavailable

## Data Storage

- **Backend**: JSON files in `backend/data/{user_id}.json`
- **Frontend**: AsyncStorage for caching and offline mode
- **Export**: Full JSON export available in Profile screen

## Troubleshooting

### Backend Issues

**"OPENAI_API_KEY not set"**
- Create `.env` file in `backend/` directory
- Add: `OPENAI_API_KEY=sk-your-key-here`

**"Module not found"**
```bash
pip install -r requirements.txt
```

**Port 8000 already in use**
- Change PORT in `.env` file
- Update `API_URL` in mobile app

### Mobile App Issues

**"Cannot connect to server"**
- Ensure backend is running: `python app.py`
- Check API_URL in `constants.js`
- For physical devices, use local IP address
- Both devices must be on same WiFi network

**"Camera/Microphone permission denied"**
- Grant permissions in device settings
- Restart the app

**Expo build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

**Charts not displaying**
- Check internet connection (charts library may need fonts)
- Reload app with Expo

### Common Issues

**Assessment not saving**
- Check backend terminal for errors
- Ensure user_id is set correctly
- Data saves to `backend/data/{user_id}.json`

**Scores seem incorrect**
- First assessment always shows 100 (baseline)
- Subsequent assessments show drift from baseline
- Lower scores = more drift (not necessarily bad)

## Performance Optimization

- Audio files auto-delete after processing
- Local caching reduces API calls
- Charts render last 8 weeks only
- Background processing for heavy computations

## Production Deployment

### Backend Deployment

1. Use production WSGI server (gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

2. Set up proper database (PostgreSQL, MongoDB)
3. Add authentication/authorization
4. Use environment variables for secrets
5. Set up HTTPS/SSL

### Mobile App Publishing

**iOS (App Store)**
```bash
expo build:ios
```

**Android (Google Play)**
```bash
expo build:android
```

See [Expo documentation](https://docs.expo.dev/distribution/introduction/) for detailed publishing guides.

## Important Notes

⚠️ **This is NOT a medical device**

- For performance awareness only
- Not for diagnosis or treatment
- Consult healthcare professionals for medical concerns
- Do not use for clinical decision-making

## Features Roadmap

Potential enhancements:

- [ ] User authentication
- [ ] Multi-user support
- [ ] Cloud data sync
- [ ] Advanced analytics
- [ ] PDF report generation
- [ ] Team/coach dashboards
- [ ] Integration with wearables
- [ ] Push notification reminders

## License

This project is for educational and personal use.

## Support

For issues or questions:
- Check this README
- Review code comments
- Check backend logs in terminal
- Verify API responses in network tab

## Credits

Built with:
- React Native & Expo
- FastAPI
- OpenAI Whisper
- librosa for audio analysis
- React Native Chart Kit

---

**Version**: 1.0.0
**Last Updated**: 2025
