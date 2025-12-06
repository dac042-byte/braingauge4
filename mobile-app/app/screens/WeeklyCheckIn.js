import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SpeechTest from '../components/SpeechTest';
import CognitiveTest from '../components/CognitiveTest';
import EyeTrackingTest from '../components/EyeTrackingTest';

import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { COLORS, USER_ID, getScoreColor } from '../utils/constants';

export default function WeeklyCheckIn({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1: speech, 2: cognitive, 3: visual, 4: complete
  const [loading, setLoading] = useState(false);
  const [passage, setPassage] = useState('');

  // Assessment results
  const [speechResult, setSpeechResult] = useState(null);
  const [cognitiveResult, setCognitiveResult] = useState(null);
  const [visualResult, setVisualResult] = useState(null);

  // Final scores
  const [neuroLoadScore, setNeuroLoadScore] = useState(null);
  const [isBaseline, setIsBaseline] = useState(false);

  useEffect(() => {
    loadPassage();
  }, []);

  const loadPassage = async () => {
    try {
      const data = await apiService.getPassages();
      if (data.passages && data.passages.length > 0) {
        // Randomly select a passage
        const randomIndex = Math.floor(Math.random() * data.passages.length);
        setPassage(data.passages[randomIndex]);
      }
    } catch (error) {
      console.error('Error loading passage:', error);
      Alert.alert('Error', 'Could not load speech passage. Using default.');
      setPassage('The quick brown fox jumps over the lazy dog. This is a test passage for speech analysis.');
    }
  };

  const handleStartAssessment = () => {
    setCurrentStep(1);
  };

  const handleSpeechComplete = async (recordingData) => {
    setLoading(true);

    try {
      const result = await apiService.uploadAudio(
        recordingData.uri,
        USER_ID,
        recordingData.duration
      );

      if (result.success) {
        setSpeechResult(result);
        setCurrentStep(2); // Move to cognitive test
      } else {
        throw new Error('Speech analysis failed');
      }
    } catch (error) {
      console.error('Speech analysis error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process speech recording. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => setCurrentStep(1),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCognitiveComplete = async (testData) => {
    setLoading(true);

    try {
      const result = await apiService.submitCognitive(
        USER_ID,
        testData.reactionTimes,
        testData.nbackResponses
      );

      if (result.success) {
        setCognitiveResult(result);
        setCurrentStep(3); // Move to visual test
      } else {
        throw new Error('Cognitive analysis failed');
      }
    } catch (error) {
      console.error('Cognitive analysis error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process cognitive test. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => setCurrentStep(2),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVisualComplete = async (trackingData) => {
    setLoading(true);

    try {
      const result = await apiService.submitVisual(
        USER_ID,
        trackingData.trackingData
      );

      if (result.success) {
        setVisualResult(result);
        // Save complete assessment
        await saveCompleteAssessment(result);
      } else {
        throw new Error('Visual analysis failed');
      }
    } catch (error) {
      console.error('Visual analysis error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process eye tracking. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => setCurrentStep(3),
          },
        ]
      );
      setLoading(false);
    }
  };

  const saveCompleteAssessment = async (visualRes) => {
    try {
      const assessmentData = {
        user_id: USER_ID,
        speech_drift: speechResult.drift_score,
        speech_metrics: speechResult.metrics,
        cognitive_drift: cognitiveResult.drift_score,
        cognitive_score: cognitiveResult.cognitive_score,
        rt_metrics: cognitiveResult.rt_metrics,
        nback_metrics: cognitiveResult.nback_metrics,
        visual_drift: visualRes.drift_score,
        visual_score: visualRes.visual_score,
        tracking_metrics: visualRes.tracking_metrics,
      };

      const result = await apiService.saveAssessment(assessmentData);

      if (result.success) {
        setNeuroLoadScore(result.neuro_load_score);
        setIsBaseline(result.is_baseline);
        setCurrentStep(4); // Show completion
      } else {
        throw new Error('Failed to save assessment');
      }
    } catch (error) {
      console.error('Save assessment error:', error);

      // Try to save offline
      const saved = await storageService.savePendingAssessment({
        speech: speechResult,
        cognitive: cognitiveResult,
        visual: visualRes,
      });

      if (saved) {
        Alert.alert(
          'Offline Mode',
          'Your assessment has been saved locally and will sync when you reconnect.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save assessment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    Alert.alert('Error', error);
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setSpeechResult(null);
    setCognitiveResult(null);
    setVisualResult(null);
    setNeuroLoadScore(null);
    setIsBaseline(false);
  };

  // Render intro screen
  if (currentStep === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.introContainer}>
          <Ionicons name="fitness" size={80} color={COLORS.primary} />
          <Text style={styles.title}>Weekly Performance Check-In</Text>
          <Text style={styles.subtitle}>
            Complete three quick assessments to track your cognitive performance
          </Text>

          <View style={styles.modulesContainer}>
            <View style={styles.moduleCard}>
              <Ionicons name="mic" size={40} color={COLORS.primary} />
              <Text style={styles.moduleName}>Speech Analysis</Text>
              <Text style={styles.moduleDuration}>~1 minute</Text>
              <Text style={styles.moduleDesc}>Read a passage aloud</Text>
            </View>

            <View style={styles.moduleCard}>
              <Ionicons name="flash" size={40} color={COLORS.primary} />
              <Text style={styles.moduleName}>Cognitive Tests</Text>
              <Text style={styles.moduleDuration}>~2 minutes</Text>
              <Text style={styles.moduleDesc}>Reaction time & memory</Text>
            </View>

            <View style={styles.moduleCard}>
              <Ionicons name="eye" size={40} color={COLORS.primary} />
              <Text style={styles.moduleName}>Eye Tracking</Text>
              <Text style={styles.moduleDuration}>~15 seconds</Text>
              <Text style={styles.moduleDesc}>Follow the moving dot</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartAssessment}>
            <Text style={styles.startButtonText}>Start Assessment</Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            This is a performance tracking tool, not a medical diagnostic device.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Loading overlay
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Processing results...</Text>
      </View>
    );
  }

  // Speech test
  if (currentStep === 1) {
    return (
      <View style={styles.testContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Step 1 of 3</Text>
          <Text style={styles.stepTitle}>Speech Analysis</Text>
        </View>
        <SpeechTest
          passage={passage}
          onComplete={handleSpeechComplete}
          onError={handleError}
        />
      </View>
    );
  }

  // Cognitive test
  if (currentStep === 2) {
    return (
      <View style={styles.testContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Step 2 of 3</Text>
          <Text style={styles.stepTitle}>Cognitive Performance</Text>
        </View>
        <CognitiveTest onComplete={handleCognitiveComplete} />
      </View>
    );
  }

  // Visual test
  if (currentStep === 3) {
    return (
      <View style={styles.testContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Step 3 of 3</Text>
          <Text style={styles.stepTitle}>Eye Tracking</Text>
        </View>
        <EyeTrackingTest onComplete={handleVisualComplete} onError={handleError} />
      </View>
    );
  }

  // Completion screen
  if (currentStep === 4) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.completeContainer}>
          <Ionicons
            name="checkmark-circle"
            size={100}
            color={getScoreColor(neuroLoadScore)}
          />
          <Text style={styles.completeTitle}>
            {isBaseline ? 'Baseline Established!' : 'Assessment Complete!'}
          </Text>

          {isBaseline ? (
            <Text style={styles.completeSubtitle}>
              This is your baseline. Future assessments will compare against this week.
            </Text>
          ) : (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Neuro Load Score</Text>
              <Text
                style={[styles.scoreValue, { color: getScoreColor(neuroLoadScore) }]}
              >
                {Math.round(neuroLoadScore)}
              </Text>
              <Text style={styles.scoreDesc}>
                Higher score indicates performance closer to your baseline
              </Text>
            </View>
          )}

          <View style={styles.componentScores}>
            <View style={styles.componentScore}>
              <Ionicons name="mic" size={24} color={COLORS.primary} />
              <Text style={styles.componentLabel}>Speech</Text>
              <Text style={styles.componentValue}>
                {Math.round(speechResult.drift_score)}
              </Text>
            </View>

            <View style={styles.componentScore}>
              <Ionicons name="flash" size={24} color={COLORS.primary} />
              <Text style={styles.componentLabel}>Cognitive</Text>
              <Text style={styles.componentValue}>
                {Math.round(cognitiveResult.drift_score)}
              </Text>
            </View>

            <View style={styles.componentScore}>
              <Ionicons name="eye" size={24} color={COLORS.primary} />
              <Text style={styles.componentLabel}>Visual</Text>
              <Text style={styles.componentValue}>
                {Math.round(visualResult.drift_score)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => {
              resetAssessment();
              navigation.navigate('Dashboard');
            }}
          >
            <Text style={styles.dashboardButtonText}>View Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetAssessment}
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  introContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  modulesContainer: {
    width: '100%',
    marginBottom: 30,
  },
  moduleCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 10,
  },
  moduleDuration: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 5,
    fontWeight: '500',
  },
  moduleDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 40,
  },
  testContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressHeader: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 15,
  },
  completeContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  scoreDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  componentScores: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  componentScore: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
  },
  componentLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  componentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 5,
  },
  dashboardButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
