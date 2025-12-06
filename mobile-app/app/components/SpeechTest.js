import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPEECH_MIN_DURATION, SPEECH_MAX_DURATION } from '../utils/constants';

export default function SpeechTest({ passage, onComplete, onError }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [recording, timer]);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access to continue.');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);

      // Start timer
      const intervalId = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop at max duration
          if (newDuration >= SPEECH_MAX_DURATION) {
            stopRecording();
            return SPEECH_MAX_DURATION;
          }
          return newDuration;
        });
      }, 1000);

      setTimer(intervalId);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      clearInterval(timer);
      setTimer(null);
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Check minimum duration
      if (duration < SPEECH_MIN_DURATION) {
        Alert.alert(
          'Recording Too Short',
          `Please record for at least ${SPEECH_MIN_DURATION} seconds.`
        );
        setRecording(null);
        setDuration(0);
        return;
      }

      // Pass recording data to parent
      onComplete({
        uri,
        duration,
      });

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError('Failed to stop recording. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.passageContainer}>
        <Text style={styles.passageTitle}>Read this passage aloud:</Text>
        <Text style={styles.passageText}>{passage}</Text>
      </View>

      <View style={styles.controls}>
        <Text style={styles.instructions}>
          {isRecording
            ? 'Recording... Speak clearly and naturally'
            : 'Tap the microphone to start recording'}
        </Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(duration)}</Text>
          <Text style={styles.timerLabel}>
            {isRecording
              ? `Min: ${SPEECH_MIN_DURATION}s | Max: ${SPEECH_MAX_DURATION}s`
              : `${SPEECH_MIN_DURATION}-${SPEECH_MAX_DURATION} seconds required`}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={64}
            color={isRecording ? COLORS.danger : COLORS.surface}
          />
        </TouchableOpacity>

        <Text style={styles.hint}>
          {isRecording && duration >= SPEECH_MIN_DURATION
            ? 'Tap to stop recording'
            : isRecording
            ? `Keep reading... (${SPEECH_MIN_DURATION - duration}s minimum remaining)`
            : 'Clear, natural speech gives best results'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  passageContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 10,
  },
  passageText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  controls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    borderColor: COLORS.danger,
  },
  hint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
