import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, REACTION_TIME_TRIALS, NBACK_TRIALS } from '../utils/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CognitiveTest({ onComplete }) {
  const [testPhase, setTestPhase] = useState('intro'); // intro, reaction, nback, complete
  const [currentTest, setCurrentTest] = useState('reaction');

  // Reaction time state
  const [rtTrial, setRtTrial] = useState(0);
  const [rtWaiting, setRtWaiting] = useState(false);
  const [rtActive, setRtActive] = useState(false);
  const [rtStartTime, setRtStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);

  // N-back state
  const [nbackTrial, setNbackTrial] = useState(0);
  const [nbackSequence, setNbackSequence] = useState([]);
  const [currentLetter, setCurrentLetter] = useState('');
  const [nbackResponses, setNbackResponses] = useState([]);
  const [responseStartTime, setResponseStartTime] = useState(0);

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reaction Time Test
  const startReactionTest = () => {
    setTestPhase('reaction');
    setRtTrial(0);
    setReactionTimes([]);
    startReactionTrial();
  };

  const startReactionTrial = () => {
    setRtWaiting(true);
    setRtActive(false);

    // Random delay between 1-3 seconds
    const delay = 1000 + Math.random() * 2000;

    timeoutRef.current = setTimeout(() => {
      setRtWaiting(false);
      setRtActive(true);
      setRtStartTime(Date.now());
    }, delay);
  };

  const handleReactionTap = () => {
    if (rtWaiting) {
      // Tapped too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setRtWaiting(false);
      alert('Too early! Wait for the green circle.');
      setTimeout(startReactionTrial, 1000);
      return;
    }

    if (rtActive) {
      const reactionTime = Date.now() - rtStartTime;
      const newReactionTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newReactionTimes);
      setRtActive(false);

      const nextTrial = rtTrial + 1;
      setRtTrial(nextTrial);

      if (nextTrial >= REACTION_TIME_TRIALS) {
        // Reaction test complete, move to N-back
        setTimeout(() => {
          startNBackTest();
        }, 500);
      } else {
        setTimeout(startReactionTrial, 1000);
      }
    }
  };

  // N-Back Test
  const startNBackTest = () => {
    setCurrentTest('nback');
    setTestPhase('nback-intro');
  };

  const beginNBack = () => {
    setTestPhase('nback');
    setNbackTrial(0);
    setNbackResponses([]);

    // Generate sequence
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const sequence = [];

    // Ensure at least 30% matches
    for (let i = 0; i < NBACK_TRIALS; i++) {
      if (i < 2) {
        // First two can't be matches
        sequence.push(letters[Math.floor(Math.random() * letters.length)]);
      } else if (Math.random() < 0.3) {
        // Create a match (same as 2 positions back)
        sequence.push(sequence[i - 2]);
      } else {
        // Random non-match letter
        let letter;
        do {
          letter = letters[Math.floor(Math.random() * letters.length)];
        } while (i >= 2 && letter === sequence[i - 2]);
        sequence.push(letter);
      }
    }

    setNbackSequence(sequence);
    showNextLetter(sequence, 0);
  };

  const showNextLetter = (sequence, index) => {
    if (index >= sequence.length) {
      completeTests();
      return;
    }

    setCurrentLetter(sequence[index]);
    setNbackTrial(index);
    setResponseStartTime(Date.now());

    let responded = false;

    // Letter shows for 500ms, then 1500ms blank
    timeoutRef.current = setTimeout(() => {
      setCurrentLetter('');

      timeoutRef.current = setTimeout(() => {
        // Record no-response if user didn't tap
        if (!responded) {
          recordNBackResponse(sequence, index, false, 0);
        }
        showNextLetter(sequence, index + 1);
      }, 1500);
    }, 500);
  };

  const handleNBackTap = () => {
    if (currentLetter && nbackTrial < nbackSequence.length) {
      const responseTime = Date.now() - responseStartTime;
      recordNBackResponse(nbackSequence, nbackTrial, true, responseTime);
    }
  };

  const recordNBackResponse = (sequence, index, userResponded, responseTime) => {
    const isMatch = index >= 2 && sequence[index] === sequence[index - 2];
    const correct = (isMatch && userResponded) || (!isMatch && !userResponded);

    setNbackResponses(prev => [
      ...prev,
      {
        letter: sequence[index],
        is_match: isMatch,
        user_responded: userResponded,
        correct,
        response_time: responseTime,
      },
    ]);
  };

  const completeTests = () => {
    setTestPhase('complete');
    onComplete({
      reactionTimes,
      nbackResponses,
    });
  };

  // Render phases
  if (testPhase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.introContainer}>
          <Ionicons name="flash" size={64} color={COLORS.primary} />
          <Text style={styles.title}>Cognitive Performance Test</Text>
          <Text style={styles.description}>
            This assessment has two parts:
          </Text>

          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>1. Reaction Time</Text>
            <Text style={styles.testDesc}>
              Tap the screen as quickly as possible when the circle turns green.
              {'\n'}({REACTION_TIME_TRIALS} trials)
            </Text>
          </View>

          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>2. Working Memory (2-Back)</Text>
            <Text style={styles.testDesc}>
              Tap when the current letter matches the letter from 2 steps back.
              {'\n'}({NBACK_TRIALS} trials)
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startReactionTest}>
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (testPhase === 'reaction') {
    return (
      <TouchableOpacity
        style={styles.reactionContainer}
        activeOpacity={1}
        onPress={handleReactionTap}
      >
        <Text style={styles.trialCounter}>
          Trial {rtTrial + 1} of {REACTION_TIME_TRIALS}
        </Text>

        <View style={styles.reactionArea}>
          {rtWaiting && (
            <>
              <View style={[styles.reactionCircle, styles.waitingCircle]} />
              <Text style={styles.reactionText}>Wait...</Text>
            </>
          )}

          {rtActive && (
            <>
              <View style={[styles.reactionCircle, styles.activeCircle]} />
              <Text style={styles.reactionText}>TAP NOW!</Text>
            </>
          )}

          {!rtWaiting && !rtActive && (
            <Text style={styles.reactionText}>Get ready...</Text>
          )}
        </View>

        <Text style={styles.hint}>
          {rtWaiting ? "Don't tap yet!" : rtActive ? 'Tap as fast as you can!' : ''}
        </Text>
      </TouchableOpacity>
    );
  }

  if (testPhase === 'nback-intro') {
    return (
      <View style={styles.container}>
        <View style={styles.introContainer}>
          <Ionicons name="brain" size={64} color={COLORS.primary} />
          <Text style={styles.title}>2-Back Memory Test</Text>
          <Text style={styles.description}>
            Letters will appear one at a time.
            {'\n\n'}
            <Text style={styles.bold}>Tap the screen</Text> when the current letter
            matches the letter from 2 positions back.
          </Text>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>Example:</Text>
            <Text style={styles.exampleText}>
              A → B → <Text style={styles.bold}>A</Text> ← Tap here! (matches A from 2 back)
              {'\n'}
              C → D → E ← Don't tap (E ≠ C)
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={beginNBack}>
            <Text style={styles.startButtonText}>Begin Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (testPhase === 'nback') {
    return (
      <TouchableOpacity
        style={styles.nbackContainer}
        activeOpacity={1}
        onPress={handleNBackTap}
      >
        <Text style={styles.trialCounter}>
          {nbackTrial + 1} of {NBACK_TRIALS}
        </Text>

        <View style={styles.letterArea}>
          {currentLetter ? (
            <Text style={styles.letterText}>{currentLetter}</Text>
          ) : (
            <Text style={styles.plusSign}>+</Text>
          )}
        </View>

        <Text style={styles.hint}>
          Tap when letter matches 2-back
        </Text>
      </TouchableOpacity>
    );
  }

  if (testPhase === 'complete') {
    const avgRT = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    const accuracy = nbackResponses.length > 0
      ? Math.round((nbackResponses.filter(r => r.correct).length / nbackResponses.length) * 100)
      : 0;

    return (
      <View style={styles.container}>
        <View style={styles.completeContainer}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          <Text style={styles.title}>Test Complete!</Text>

          <View style={styles.results}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Average Reaction Time</Text>
              <Text style={styles.resultValue}>{avgRT}ms</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Memory Accuracy</Text>
              <Text style={styles.resultValue}>{accuracy}%</Text>
            </View>
          </View>

          <Text style={styles.completeText}>
            Processing results...
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  introContainer: {
    flex: 1,
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
  bold: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  testInfo: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 5,
  },
  testDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  exampleBox: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reactionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialCounter: {
    position: 'absolute',
    top: 60,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  reactionArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 30,
  },
  waitingCircle: {
    backgroundColor: COLORS.danger,
  },
  activeCircle: {
    backgroundColor: COLORS.success,
  },
  reactionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  hint: {
    position: 'absolute',
    bottom: 60,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nbackContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  letterText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  plusSign: {
    fontSize: 80,
    color: COLORS.textSecondary,
  },
  completeContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  completeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 20,
  },
});
