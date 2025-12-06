# BrainGauge - Technical Architecture

## System Overview

BrainGauge is a full-stack mobile application for tracking cognitive performance in athletes. It uses a client-server architecture with local-first data storage and offline capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Mobile App                   │
│                         (Expo)                               │
├─────────────────────────────────────────────────────────────┤
│  Screens          │  Components      │  Services             │
│  - WeeklyCheckIn  │  - SpeechTest   │  - API Client         │
│  - Dashboard      │  - CognitiveTest│  - Local Storage      │
│  - Insights       │  - EyeTracking  │                       │
│  - Profile        │                 │                       │
└──────────────┬────────────────────────────────────────────┬─┘
               │                                            │
               │ HTTP REST API                     AsyncStorage
               │                                            │
┌──────────────▼──────────────────────────────────────────────┐
│                    Python Backend (FastAPI)                 │
├─────────────────────────────────────────────────────────────┤
│  API Layer    │  Analysis Models  │  Services               │
│  - Endpoints  │  - Speech         │  - Whisper API          │
│  - Validation │  - Cognitive      │  - Drift Calculator     │
│               │  - Visual         │                         │
└───────────────┴──────────┬────────┴─────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   File-based Storage   │
              │   (JSON per user)      │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   OpenAI Whisper API   │
              │   (Speech-to-Text)     │
              └────────────────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: React Native 0.72
- **Runtime**: Expo SDK 49
- **Navigation**: React Navigation (Bottom Tabs)
- **Charts**: React Native Chart Kit
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Camera**: expo-camera
- **Audio**: expo-av

### Component Hierarchy

```
App
└── AppNavigator (Bottom Tabs)
    ├── WeeklyCheckIn Screen
    │   ├── SpeechTest Component
    │   ├── CognitiveTest Component
    │   └── EyeTrackingTest Component
    ├── Dashboard Screen
    │   └── LineChart Component
    ├── Insights Screen
    └── Profile Screen
```

### State Management

- **Local Component State**: React useState hooks
- **Persistent Storage**: AsyncStorage for offline data
- **Data Flow**: Unidirectional (props down, callbacks up)
- **No Redux**: Simple enough to use local state

### Key Services

#### API Service (`app/services/api.js`)
- Centralized HTTP client
- Error handling and retries
- Request/response formatting
- Timeout management (30s default, 60s for audio)

#### Storage Service (`app/services/storage.js`)
- Offline data caching
- Pending assessment queue
- Sync management
- Cache invalidation

### Assessment Flow

```
1. User starts assessment
   └── WeeklyCheckIn screen

2. Complete Speech Test
   ├── Record audio (expo-av)
   ├── Upload to backend
   ├── Backend calls Whisper API
   ├── Backend analyzes audio
   └── Returns speech metrics + drift score

3. Complete Cognitive Test
   ├── Reaction Time (10 trials)
   ├── N-back Memory (20 trials)
   ├── Submit results to backend
   └── Returns cognitive metrics + drift score

4. Complete Eye Tracking
   ├── Front camera permission
   ├── Track smooth pursuit (15s)
   ├── Collect tracking data
   ├── Submit to backend
   └── Returns visual metrics + drift score

5. Backend calculates Neuro Load Score
   └── Weighted average: 35% speech + 40% cognitive + 25% visual

6. Save complete assessment
   ├── Store in backend (JSON file)
   ├── Cache locally (AsyncStorage)
   └── Show results screen

7. Update Dashboard
   └── Refresh charts and trends
```

## Backend Architecture

### Technology Stack

- **Framework**: FastAPI
- **Server**: Uvicorn (ASGI)
- **Audio Analysis**: librosa, scipy
- **Speech-to-Text**: OpenAI Whisper API
- **Data Storage**: JSON files
- **Validation**: Pydantic models

### API Endpoints

```python
# Health & Info
GET  /                   # API status
GET  /health            # Detailed health check
GET  /passages          # Get speech passages

# Assessment Submission
POST /audio/upload      # Upload audio → speech analysis
POST /cognitive/submit  # Submit cognitive test → analysis
POST /visual/submit     # Submit eye tracking → analysis
POST /assessment/save   # Save complete weekly assessment

# Data Retrieval
GET  /score/weekly/{user_id}  # Latest score
GET  /history/{user_id}       # All assessments
GET  /insights/{user_id}      # Personalized insights
GET  /export/{user_id}        # Export all data

# Management
POST /baseline/reset    # Reset baseline (delete all)
```

### Analysis Pipeline

#### 1. Speech Analysis (`models/speech_analysis.py`)

```python
Audio File → librosa.load()
           ↓
Extract Features:
- Word count
- Words per minute
- Filler words (um, uh, like)
- Pause analysis (RMS energy thresholding)
- Speech rate variability (CV of energy)
           ↓
Return Metrics
```

#### 2. Cognitive Analysis (`models/cognitive_analysis.py`)

```python
Reaction Times → Filter outliers (>3 std)
               → Calculate statistics
               → Consistency score

N-back Responses → Calculate accuracy
                 → Hits, misses, false alarms
                 → d-prime (sensitivity index)
                 ↓
Combine → Overall Cognitive Score
```

#### 3. Visual Analysis (`models/visual_analysis.py`)

```python
Tracking Data → Calculate error (target vs gaze)
              → Detect saccades (velocity threshold)
              → Count blinks (missing data)
              → Calculate smooth pursuit gain
              ↓
Visual-Motor Score
```

### Drift Calculation (`services/drift_calculator.py`)

```python
First Assessment:
  - Becomes baseline
  - All scores = 100
  - Store baseline metrics

Subsequent Assessments:
  - Compare to baseline
  - Calculate component drifts
  - Speech: WPM, filler rate, pauses
  - Cognitive: Performance decline
  - Visual: Tracking accuracy decline
  - Combine → Neuro Load Score

Scoring:
  - 100 = Perfect match to baseline
  - 90-100 = Excellent (minimal drift)
  - 75-89 = Good (slight drift)
  - 60-74 = Fair (moderate drift)
  - <60 = Needs attention (significant drift)
```

### Data Storage Structure

```json
{
  "baseline": {
    "speech": { /* Week 1 metrics */ },
    "cognitive": { /* Week 1 metrics */ },
    "visual": { /* Week 1 metrics */ }
  },
  "history": [
    {
      "week": 1,
      "timestamp": "2024-01-01T12:00:00",
      "is_baseline": true,
      "neuro_load_score": 100,
      "speech": {
        "drift_score": 100,
        "metrics": { /* detailed metrics */ }
      },
      "cognitive": {
        "drift_score": 100,
        "cognitive_score": 85.2,
        "rt_metrics": { /* reaction time */ },
        "nback_metrics": { /* n-back */ }
      },
      "visual": {
        "drift_score": 100,
        "visual_score": 78.5,
        "tracking_metrics": { /* tracking data */ }
      }
    }
    // ... more weeks
  ]
}
```

## Offline Capabilities

### Offline-First Strategy

1. **Assessment Collection**
   - All tests run locally (no internet needed)
   - Data stored in memory during assessment

2. **Sync Attempt**
   - Try to submit to backend
   - If fails, save to AsyncStorage

3. **Background Sync**
   - Check connection on app resume
   - Auto-retry pending assessments
   - Clear queue on success

4. **Cached Data**
   - Dashboard shows last loaded data
   - Insights use cached data
   - Pull-to-refresh attempts sync

### Error Handling

```javascript
try {
  // API call
  const result = await apiService.uploadAudio(...)
  // Success path
} catch (error) {
  // Check error type
  if (error.message.includes('Cannot connect')) {
    // Offline - save locally
    await storageService.savePendingAssessment(data)
    Alert.alert('Offline Mode', 'Data saved, will sync later')
  } else {
    // Other error - retry
    Alert.alert('Error', error.message, [
      { text: 'Retry', onPress: () => retry() }
    ])
  }
}
```

## Security Considerations

### Current Implementation (Development)

- ❌ No authentication
- ❌ No encryption at rest
- ❌ No HTTPS enforcement
- ⚠️ API key in environment variable (good)
- ⚠️ User ID hardcoded (acceptable for single user)

### Production Requirements

- ✅ User authentication (JWT, OAuth)
- ✅ HTTPS/TLS encryption
- ✅ API key in secure vault
- ✅ Database with encrypted fields
- ✅ Rate limiting
- ✅ Input validation (already implemented)
- ✅ File upload size limits (already implemented)
- ✅ CORS configuration (needs tightening)

## Performance Optimizations

### Frontend

1. **Lazy Loading**: Components load only when needed
2. **Chart Optimization**: Only render last 8 weeks
3. **Image Caching**: AsyncStorage for data
4. **Debounced Updates**: Prevent rapid re-renders
5. **Memory Management**: Cleanup intervals/timeouts

### Backend

1. **Audio Cleanup**: Auto-delete uploaded files
2. **Streaming**: Large file handling
3. **Caching**: Consider Redis for user sessions
4. **Connection Pooling**: For database (when added)
5. **Async Processing**: FastAPI async endpoints

### Audio Processing

- **File Size**: Max 10MB
- **Processing Time**: 5-10s for Whisper API
- **Cleanup**: Immediate deletion after processing
- **Format**: WAV (efficient for analysis)

## Scalability Considerations

### Current Limits

- File-based storage (100s of users)
- Synchronous processing
- Single server instance
- No load balancing

### Scaling Strategy

1. **Database Migration**
   - Move from JSON to PostgreSQL/MongoDB
   - User authentication table
   - Assessments table with indexes

2. **Queue System**
   - Celery + Redis for async processing
   - Background workers for audio analysis
   - Job status tracking

3. **Cloud Deployment**
   - Docker containers
   - Kubernetes orchestration
   - Auto-scaling based on load

4. **CDN for Assets**
   - Static assets on CDN
   - Audio file storage on S3

5. **Caching Layer**
   - Redis for frequently accessed data
   - Session management
   - Rate limiting

## Testing Strategy

### Frontend Testing

```javascript
// Unit Tests (Jest)
- Component rendering
- State management
- Utility functions

// Integration Tests
- Navigation flow
- API service calls
- Storage operations

// E2E Tests (Detox)
- Complete assessment flow
- Offline mode
- Error recovery
```

### Backend Testing

```python
# Unit Tests (pytest)
- Analysis algorithms
- Drift calculations
- Data validation

# Integration Tests
- API endpoints
- File operations
- External API calls

# Load Tests (locust)
- Concurrent users
- Audio upload performance
- Database queries
```

## Deployment Architecture

### Development

```
Developer Machine
├── Backend: http://localhost:8000
└── Mobile: Expo Dev Server
    └── Physical Device: Expo Go
```

### Production

```
Cloud Platform (AWS/GCP/Azure)
├── Backend
│   ├── Docker Container
│   ├── Uvicorn workers (4x)
│   ├── HTTPS (Let's Encrypt)
│   └── PostgreSQL Database
├── Storage
│   ├── S3 for audio files
│   └── Backups
└── Mobile
    ├── iOS App Store
    └── Google Play Store
```

## Future Enhancements

### Phase 2 Features

1. **Multi-User Support**
   - User registration/login
   - Team management
   - Coach dashboards

2. **Advanced Analytics**
   - ML-based anomaly detection
   - Predictive modeling
   - Comparison to population norms

3. **Integrations**
   - Wearable devices (Apple Watch, Garmin)
   - Calendar sync
   - Training load APIs

4. **Notifications**
   - Weekly reminders
   - Performance alerts
   - Achievement badges

5. **Export Options**
   - PDF reports
   - CSV exports
   - Share with healthcare providers

### Technical Debt

- Add comprehensive test suite
- Implement proper logging
- Add monitoring (Sentry, DataDog)
- Database migration
- CI/CD pipeline
- Documentation site

---

**This architecture supports:**
- ✅ 5-minute assessments
- ✅ Offline operation
- ✅ Immediate score updates
- ✅ Visual trend tracking
- ✅ Zero-config setup (for dev)
- ✅ Cross-platform (iOS/Android)
