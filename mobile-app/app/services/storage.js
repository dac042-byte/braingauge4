import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PENDING_ASSESSMENTS: '@braingauge_pending_assessments',
  OFFLINE_MODE: '@braingauge_offline_mode',
  CACHED_HISTORY: '@braingauge_cached_history',
  CACHED_INSIGHTS: '@braingauge_cached_insights',
};

export const storageService = {
  // Save pending assessment for offline sync
  async savePendingAssessment(assessment) {
    try {
      const pending = await this.getPendingAssessments();
      pending.push({
        ...assessment,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ASSESSMENTS, JSON.stringify(pending));
      return true;
    } catch (error) {
      console.error('Error saving pending assessment:', error);
      return false;
    }
  },

  // Get all pending assessments
  async getPendingAssessments() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ASSESSMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending assessments:', error);
      return [];
    }
  },

  // Clear pending assessments after successful sync
  async clearPendingAssessments() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_ASSESSMENTS);
      return true;
    } catch (error) {
      console.error('Error clearing pending assessments:', error);
      return false;
    }
  },

  // Cache history data
  async cacheHistory(history) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_HISTORY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error caching history:', error);
      return false;
    }
  },

  // Get cached history
  async getCachedHistory() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_HISTORY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached history:', error);
      return null;
    }
  },

  // Cache insights data
  async cacheInsights(insights) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_INSIGHTS, JSON.stringify(insights));
      return true;
    } catch (error) {
      console.error('Error caching insights:', error);
      return false;
    }
  },

  // Get cached insights
  async getCachedInsights() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_INSIGHTS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached insights:', error);
      return null;
    }
  },

  // Set offline mode
  async setOfflineMode(isOffline) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(isOffline));
      return true;
    } catch (error) {
      console.error('Error setting offline mode:', error);
      return false;
    }
  },

  // Get offline mode status
  async isOfflineMode() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Error getting offline mode:', error);
      return false;
    }
  },

  // Clear all cached data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PENDING_ASSESSMENTS,
        STORAGE_KEYS.OFFLINE_MODE,
        STORAGE_KEYS.CACHED_HISTORY,
        STORAGE_KEYS.CACHED_INSIGHTS,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
};

export default storageService;
