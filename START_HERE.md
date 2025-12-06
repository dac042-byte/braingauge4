# 🚀 START HERE - BrainGauge Quick Commands

**New to BrainGauge? Use this cheat sheet!**

---

## 🎯 First Time Setup (Do Once)

### 1. Get OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up/login → API Keys → Create new key
3. Copy the key (starts with `sk-...`)

### 2. Setup Backend
```bash
cd backend
python -m venv venv

# Activate venv:
source venv/bin/activate          # Mac/Linux
# OR
venv\Scripts\activate             # Windows

pip install -r requirements.txt
cp .env.example .env

# Edit .env and add your API key:
nano .env                         # Mac/Linux
notepad .env                      # Windows
```

### 3. Setup Mobile App
```bash
cd mobile-app
npm install
```

---

## ⚡ Quick Start (Every Time)

**Open TWO terminal windows:**

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate          # Windows: venv\Scripts\activate
python app.py
```
✅ Leave this running!

### Terminal 2: Mobile App
```bash
cd mobile-app
npx expo start
```
📱 Scan QR code with Expo Go app

---

## 📱 Running on Phone?

**Update API URL once:**

1. Find your computer's IP:
```bash
ipconfig getifaddr en0            # Mac
ipconfig                          # Windows (look for IPv4)
hostname -I                       # Linux
```

2. Edit `mobile-app/app/utils/constants.js`:
```javascript
export const API_URL = 'http://YOUR_IP:8000';
// Example: 'http://192.168.1.100:8000'
```

3. Restart Expo and reload app

---

## 🧪 First Test

1. Open app → **Profile** tab
2. Tap **"Check Connection"**
3. Should say **"Connected"** ✅

If not connected:
- Is backend running? (check Terminal 1)
- Updated API_URL? (if using phone)
- Same WiFi? (phone & computer)

---

## 🎮 Complete First Assessment

1. **Check-In** tab → **Start Assessment**
2. **Speech**: Read passage aloud (20-60 sec)
3. **Cognitive**: Reaction time + Memory test
4. **Eye Tracking**: Follow the dot
5. **View Dashboard** → See your baseline!

---

## 🛑 Stop the App

Press `Ctrl+C` in both terminals

To exit virtual environment:
```bash
deactivate
```

---

## 📚 Full Documentation

- **Quick Start**: `QUICKSTART.md` ← You are here!
- **Complete Guide**: `README.md`
- **Step-by-Step Setup**: `STARTUP_GUIDE.md`
- **Technical Details**: `ARCHITECTURE.md`

---

## 🆘 Common Issues

### "Cannot connect to server"
```bash
# Make sure backend is running:
cd backend
source venv/bin/activate
python app.py
```

### "OPENAI_API_KEY not set"
```bash
# Check .env file exists:
cat backend/.env                  # Mac/Linux
type backend\.env                 # Windows

# Should contain:
OPENAI_API_KEY=sk-your-key-here
```

### "Port 8000 already in use"
```bash
# Kill process on port 8000:
lsof -ti:8000 | xargs kill -9     # Mac/Linux

# Windows: find PID first
netstat -ano | findstr :8000
taskkill /PID [number] /F
```

### App won't install packages
```bash
# Backend:
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend:
cd mobile-app
rm -rf node_modules
npm install
```

---

## ✅ Success Checklist

- [ ] Backend running (see "Uvicorn running on...")
- [ ] App running (see QR code)
- [ ] Connection test passes
- [ ] First assessment completed
- [ ] Dashboard shows data

---

## 💡 Daily Workflow

```bash
# 1. Start backend
cd backend && source venv/bin/activate && python app.py

# 2. In new terminal, start app
cd mobile-app && npx expo start

# 3. Scan QR code or press 'i' for iOS / 'a' for Android

# 4. Use app!

# 5. When done: Ctrl+C in both terminals
```

---

**🎉 That's it! You're ready to track your cognitive performance!**

For detailed explanations, see `QUICKSTART.md` or `README.md`

**⚠️ Remember**: This is NOT a medical device. For performance tracking only.
