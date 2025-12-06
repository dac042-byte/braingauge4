import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, EYE_TRACKING_DURATION } from '../utils/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function EyeTrackingTest({ onComplete, onError }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);

  // Tracking state
  const [targetPosition, setTargetPosition] = useState({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
  const [trackingData, setTrackingData] = useState([]);
  const [blinkCount, setBlinkCount] = useState(0);

  const startTime = useRef(0);
  const animationRef = useRef(null);
  const trackingInterval = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    };
  }, []);

  const startTest = () => {
    setShowInstructions(false);
    let count = 3;

    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownInterval);
        beginTracking();
      }
    }, 1000);
  };

  const beginTracking = () => {
    setIsTracking(true);
    setTrackingData([]);
    setBlinkCount(0);
    setProgress(0);
    startTime.current = Date.now();

    // Start smooth pursuit animation (circular pattern)
    animateTarget();

    // Simulate eye tracking data collection
    // In a real implementation, this would use face detection/eye tracking APIs
    trackingInterval.current = setInterval(() => {
      collectTrackingData();
    }, 100); // Collect data every 100ms

    // End test after duration
    setTimeout(() => {
      endTracking();
    }, EYE_TRACKING_DURATION * 1000);
  };

  const animateTarget = () => {
    const animate = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const duration = EYE_TRACKING_DURATION;

      if (elapsed >= duration) {
        return;
      }

      // Update progress
      setProgress((elapsed / duration) * 100);

      // Circular smooth pursuit pattern
      const centerX = SCREEN_WIDTH / 2;
      const centerY = SCREEN_HEIGHT / 2;
      const radius = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.3;
      const angle = (elapsed / duration) * Math.PI * 4; // 2 full circles

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      setTargetPosition({ x, y });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const collectTrackingData = () => {
    const elapsed = (Date.now() - startTime.current) / 1000;

    if (elapsed >= EYE_TRACKING_DURATION) {
      return;
    }

    // Simulate gaze position (in real app, would use eye tracking API)
    // Adding some noise to simulate realistic tracking
    const noise = 20;
    const gazeX = targetPosition.x + (Math.random() - 0.5) * noise;
    const gazeY = targetPosition.y + (Math.random() - 0.5) * noise;

    // Simulate occasional blinks (gaze position becomes 0,0)
    const isBlink = Math.random() < 0.05; // 5% chance of blink per sample
    if (isBlink) {
      setBlinkCount(prev => prev + 1);
    }

    const dataPoint = {
      timestamp: elapsed,
      target_x: targetPosition.x,
      target_y: targetPosition.y,
      gaze_x: isBlink ? 0 : gazeX,
      gaze_y: isBlink ? 0 : gazeY,
    };

    setTrackingData(prev => [...prev, dataPoint]);
  };

  const endTracking = () => {
    setIsTracking(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
    }

    // Pass tracking data to parent
    onComplete({
      trackingData,
      blinkCount,
      duration: EYE_TRACKING_DURATION,
    });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={64} color={COLORS.textSecondary} />
        <Text style={styles.messageText}>
          Camera access is required for eye tracking assessment.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showInstructions) {
    return (
      <View style={styles.container}>
        <View style={styles.instructionsContainer}>
          <Ionicons name="eye" size={64} color={COLORS.primary} />
          <Text style={styles.title}>Eye Tracking Test</Text>
          <Text style={styles.description}>
            Follow the moving dot with your eyes.
            {'\n\n'}
            Keep your head still and track the dot smoothly with your eyes only.
            {'\n\n'}
            The test will last {EYE_TRACKING_DURATION} seconds.
          </Text>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Tips:</Text>
            <Text style={styles.tipText}>• Hold phone at arm's length</Text>
            <Text style={styles.tipText}>• Keep head steady</Text>
            <Text style={styles.tipText}>• Move only your eyes</Text>
            <Text style={styles.tipText}>• Try not to blink excessively</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startTest}>
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isTracking && countdown > 0) {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} type={Camera.Constants.Type.front}>
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
            <Text style={styles.countdownLabel}>Get ready...</Text>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.front}>
        <View style={styles.overlay}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(EYE_TRACKING_DURATION - (progress / 100) * EYE_TRACKING_DURATION)}s
            </Text>
          </View>

          <View
            style={[
              styles.target,
              {
                left: targetPosition.x - 15,
                top: targetPosition.y - 15,
              },
            ]}
          />

          <View style={styles.instructionOverlay}>
            <Text style={styles.trackingHint}>Follow the dot with your eyes</Text>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  tipsBox: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  countdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownLabel: {
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
  },
  overlay: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    width: 40,
  },
  target: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  trackingHint: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
