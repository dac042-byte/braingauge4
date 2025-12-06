import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { COLORS, USER_ID, getScoreColor, getScoreStatus } from '../utils/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [trend, setTrend] = useState('stable');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Try to load from API
      try {
        const historyData = await apiService.getHistory(USER_ID);

        if (historyData.success && historyData.history.length > 0) {
          setHistory(historyData.history);
          await storageService.cacheHistory(historyData.history);

          const latest = historyData.history[historyData.history.length - 1];
          setLatestScore(latest);

          // Calculate trend
          if (historyData.history.length >= 2) {
            const recent = historyData.history.slice(-4);
            const scores = recent.map(h => h.neuro_load_score);
            const avgRecent = scores.reduce((a, b) => a + b, 0) / scores.length;
            const lastScore = scores[scores.length - 1];

            if (lastScore > avgRecent + 5) {
              setTrend('improving');
            } else if (lastScore < avgRecent - 5) {
              setTrend('declining');
            } else {
              setTrend('stable');
            }
          }
        }
      } catch (apiError) {
        // Fall back to cached data
        console.log('Using cached data:', apiError.message);
        const cachedHistory = await storageService.getCachedHistory();
        if (cachedHistory && cachedHistory.length > 0) {
          setHistory(cachedHistory);
          setLatestScore(cachedHistory[cachedHistory.length - 1]);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return 'trending-up';
    if (trend === 'declining') return 'trending-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (trend === 'improving') return COLORS.success;
    if (trend === 'declining') return COLORS.warning;
    return COLORS.textSecondary;
  };

  const prepareChartData = () => {
    if (history.length === 0) {
      return {
        labels: ['Week 1'],
        datasets: [{ data: [0] }],
      };
    }

    const recentHistory = history.slice(-8); // Last 8 weeks
    const labels = recentHistory.map(h => `W${h.week}`);
    const neuroScores = recentHistory.map(h => h.neuro_load_score);
    const speechScores = recentHistory.map(h => h.speech.drift_score);
    const cognitiveScores = recentHistory.map(h => h.cognitive.drift_score);
    const visualScores = recentHistory.map(h => h.visual.drift_score);

    return {
      labels,
      datasets: [
        {
          data: neuroScores,
          color: (opacity = 1) => COLORS.primary,
          strokeWidth: 3,
        },
        {
          data: speechScores,
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity * 0.3})`,
          strokeWidth: 2,
        },
        {
          data: cognitiveScores,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity * 0.3})`,
          strokeWidth: 2,
        },
        {
          data: visualScores,
          color: (opacity = 1) => `rgba(245, 158, 11, ${opacity * 0.3})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Ionicons name="bar-chart-outline" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No Assessments Yet</Text>
        <Text style={styles.emptyText}>
          Complete your first weekly check-in to start tracking your cognitive performance.
        </Text>
      </ScrollView>
    );
  }

  const chartData = prepareChartData();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View>
            <Text style={styles.scoreLabel}>Current Neuro Load Score</Text>
            <Text style={styles.weekLabel}>Week {latestScore?.week}</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name={getTrendIcon()} size={20} color={getTrendColor()} />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trend}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.scoreValue,
            { color: getScoreColor(latestScore?.neuro_load_score || 0) },
          ]}
        >
          {Math.round(latestScore?.neuro_load_score || 0)}
        </Text>

        <Text style={styles.statusText}>
          Status: {getScoreStatus(latestScore?.neuro_load_score || 0)}
        </Text>

        {latestScore?.is_baseline && (
          <View style={styles.baselineBadge}>
            <Text style={styles.baselineText}>Baseline Week</Text>
          </View>
        )}
      </View>

      {/* Component Scores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Component Scores</Text>

        <View style={styles.componentRow}>
          <View style={styles.componentCard}>
            <Ionicons name="mic" size={32} color={COLORS.primary} />
            <Text style={styles.componentName}>Speech</Text>
            <Text style={styles.componentScore}>
              {Math.round(latestScore?.speech.drift_score || 0)}
            </Text>
          </View>

          <View style={styles.componentCard}>
            <Ionicons name="flash" size={32} color={COLORS.success} />
            <Text style={styles.componentName}>Cognitive</Text>
            <Text style={styles.componentScore}>
              {Math.round(latestScore?.cognitive.drift_score || 0)}
            </Text>
          </View>

          <View style={styles.componentCard}>
            <Ionicons name="eye" size={32} color={COLORS.warning} />
            <Text style={styles.componentName}>Visual</Text>
            <Text style={styles.componentScore}>
              {Math.round(latestScore?.visual.drift_score || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Trend Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Trends</Text>

        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - 40}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Neuro Load</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(79, 70, 229, 0.3)' }]} />
              <Text style={styles.legendText}>Speech</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(16, 185, 129, 0.3)' }]} />
              <Text style={styles.legendText}>Cognitive</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(245, 158, 11, 0.3)' }]} />
              <Text style={styles.legendText}>Visual</Text>
            </View>
          </View>
        </View>
      </View>

      {/* History Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assessment History</Text>

        <View style={styles.historyCard}>
          <View style={styles.historyItem}>
            <Text style={styles.historyLabel}>Total Assessments</Text>
            <Text style={styles.historyValue}>{history.length}</Text>
          </View>

          <View style={styles.historyItem}>
            <Text style={styles.historyLabel}>Weeks Tracked</Text>
            <Text style={styles.historyValue}>{history.length}</Text>
          </View>

          <View style={styles.historyItem}>
            <Text style={styles.historyLabel}>Latest Update</Text>
            <Text style={styles.historyValue}>
              {latestScore?.timestamp
                ? new Date(latestScore.timestamp).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scoreCard: {
    backgroundColor: COLORS.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  weekLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
    textTransform: 'capitalize',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  statusText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  baselineBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  baselineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  componentCard: {
    backgroundColor: COLORS.surface,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  componentName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 5,
  },
  componentScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  bottomPadding: {
    height: 30,
  },
});
