// API Configuration
export const API_URL = 'http://localhost:8000'; // Change this to your backend URL

// For physical devices, use your computer's local IP:
// export const API_URL = 'http://192.168.1.XXX:8000';

// User ID (in production, this would come from authentication)
export const USER_ID = 'athlete_001';

// Colors
export const COLORS = {
  primary: '#4F46E5',
  secondary: '#818CF8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',

  // Score-based colors
  excellent: '#10B981',
  good: '#3B82F6',
  fair: '#F59E0B',
  poor: '#EF4444',
};

// Score thresholds
export const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 60,
};

// Get color based on score
export const getScoreColor = (score) => {
  if (score >= SCORE_THRESHOLDS.excellent) return COLORS.excellent;
  if (score >= SCORE_THRESHOLDS.good) return COLORS.good;
  if (score >= SCORE_THRESHOLDS.fair) return COLORS.fair;
  return COLORS.poor;
};

// Get status text based on score
export const getScoreStatus = (score) => {
  if (score >= SCORE_THRESHOLDS.excellent) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.good) return 'Good';
  if (score >= SCORE_THRESHOLDS.fair) return 'Fair';
  return 'Needs Attention';
};

// Assessment configuration
export const REACTION_TIME_TRIALS = 10;
export const NBACK_TRIALS = 20;
export const EYE_TRACKING_DURATION = 15; // seconds

// Recording configuration
export const SPEECH_MIN_DURATION = 20;
export const SPEECH_MAX_DURATION = 60;
