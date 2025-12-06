import axios from 'axios';
import { API_URL } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service
export const apiService = {
  // Get speech passages
  async getPassages() {
    try {
      const response = await api.get('/passages');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Upload audio for speech analysis
  async uploadAudio(audioUri, userId, duration) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });
      formData.append('user_id', userId);
      formData.append('duration', duration.toString());

      const response = await axios.post(`${API_URL}/audio/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for audio processing
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Submit cognitive test results
  async submitCognitive(userId, reactionTimes, nbackResponses) {
    try {
      const response = await api.post('/cognitive/submit', {
        user_id: userId,
        reaction_times: reactionTimes,
        nback_responses: nbackResponses,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Submit visual tracking data
  async submitVisual(userId, trackingData) {
    try {
      const response = await api.post('/visual/submit', {
        user_id: userId,
        tracking_data: trackingData,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Save complete assessment
  async saveAssessment(assessmentData) {
    try {
      const formData = new FormData();
      Object.keys(assessmentData).forEach(key => {
        if (typeof assessmentData[key] === 'object') {
          formData.append(key, JSON.stringify(assessmentData[key]));
        } else {
          formData.append(key, assessmentData[key].toString());
        }
      });

      const response = await axios.post(`${API_URL}/assessment/save`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get weekly score
  async getWeeklyScore(userId) {
    try {
      const response = await api.get(`/score/weekly/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get assessment history
  async getHistory(userId, limit = null) {
    try {
      const url = limit ? `/history/${userId}?limit=${limit}` : `/history/${userId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get insights
  async getInsights(userId) {
    try {
      const response = await api.get(`/insights/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Reset baseline
  async resetBaseline(userId) {
    try {
      const response = await api.post('/baseline/reset', {
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Export data
  async exportData(userId) {
    try {
      const response = await api.get(`/export/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.detail || error.response.data?.message || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Cannot connect to server. Please check your connection and ensure the backend is running.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  },
};

export default apiService;
