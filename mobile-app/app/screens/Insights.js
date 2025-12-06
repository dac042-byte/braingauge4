import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { COLORS, USER_ID, getScoreColor } from '../utils/constants';

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);

      try {
        const data = await apiService.getInsights(USER_ID);

        if (data.success) {
          setInsights(data.insights);
          await storageService.cacheInsights(data.insights);
        }
      } catch (apiError) {
        console.log('Using cached insights:', apiError.message);
        const cached = await storageService.getCachedInsights();
        if (cached) {
          setInsights(cached);
        }
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  const getAreaName = (area) => {
    const names = {
      speech: 'Speech Analysis',
      cognitive: 'Cognitive Performance',
      visual: 'Visual-Motor Tracking',
    };
    return names[area] || area;
  };

  const getAreaIcon = (area) => {
    const icons = {
      speech: 'mic',
      cognitive: 'flash',
      visual: 'eye',
    };
    return icons[area] || 'help-circle';
  };

  const getRecommendations = (area, score) => {
    const recommendations = {
      speech: [
        'Practice vocal exercises and breathing techniques',
        'Stay hydrated - dehydration affects speech clarity',
        'Get adequate sleep - fatigue impacts articulation',
        'Reduce screen time before assessments',
      ],
      cognitive: [
        'Ensure 7-9 hours of quality sleep',
        'Take regular breaks during intense mental work',
        'Practice mindfulness or meditation',
        'Stay physically active - exercise boosts cognition',
        'Avoid assessments when fatigued',
      ],
      visual: [
        'Take screen breaks every 20 minutes',
        'Practice eye exercises',
        'Ensure proper lighting when working',
        'Stay hydrated',
        'Get your vision checked regularly',
      ],
    };

    return recommendations[area] || [];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Generating insights...</Text>
      </View>
    );
  }

  if (!insights || insights.assessments_completed < 2) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Ionicons name="bulb-outline" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Not Enough Data</Text>
        <Text style={styles.emptyText}>
          Complete at least 2 weekly assessments to see personalized insights and recommendations.
        </Text>
        <Text style={styles.emptySubtext}>
          Assessments completed: {insights?.assessments_completed || 0} / 2
        </Text>
      </ScrollView>
    );
  }

  const { area_of_concern, concern_score, trend, trend_change, component_scores } = insights;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Trend</Text>
            <View style={styles.trendContainer}>
              <Ionicons
                name={
                  trend === 'improving'
                    ? 'trending-up'
                    : trend === 'declining'
                    ? 'trending-down'
                    : 'remove'
                }
                size={24}
                color={
                  trend === 'improving'
                    ? COLORS.success
                    : trend === 'declining'
                    ? COLORS.warning
                    : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.trendText,
                  {
                    color:
                      trend === 'improving'
                        ? COLORS.success
                        : trend === 'declining'
                        ? COLORS.warning
                        : COLORS.textSecondary,
                  },
                ]}
              >
                {trend}
              </Text>
            </View>
          </View>

          {trend_change > 0 && (
            <Text style={styles.trendDetail}>
              {trend === 'improving' ? '+' : '-'}
              {Math.round(trend_change)} points from recent average
            </Text>
          )}
        </View>
      </View>

      {/* Component Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Component Analysis</Text>

        {Object.entries(component_scores).map(([area, score]) => (
          <View key={area} style={styles.componentCard}>
            <View style={styles.componentHeader}>
              <View style={styles.componentTitleRow}>
                <Ionicons
                  name={getAreaIcon(area)}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.componentName}>{getAreaName(area)}</Text>
              </View>
              <Text
                style={[
                  styles.componentScore,
                  { color: getScoreColor(score) },
                ]}
              >
                {Math.round(score)}
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${score}%`,
                    backgroundColor: getScoreColor(score),
                  },
                ]}
              />
            </View>

            {area === area_of_concern && score < 80 && (
              <View style={styles.concernBadge}>
                <Ionicons name="alert-circle" size={16} color={COLORS.warning} />
                <Text style={styles.concernText}>Needs attention</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Recommendations */}
      {area_of_concern && concern_score < 80 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>

          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Ionicons
                name={getAreaIcon(area_of_concern)}
                size={32}
                color={COLORS.warning}
              />
              <View style={styles.recommendationHeaderText}>
                <Text style={styles.recommendationArea}>
                  {getAreaName(area_of_concern)}
                </Text>
                <Text style={styles.recommendationSubtext}>
                  Score: {Math.round(concern_score)} - Focus area
                </Text>
              </View>
            </View>

            <Text style={styles.recommendationTitle}>
              Tips to improve your performance:
            </Text>

            {getRecommendations(area_of_concern, concern_score).map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* General Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Performance Tips</Text>

        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Ionicons name="moon" size={24} color={COLORS.primary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Prioritize Sleep</Text>
              <Text style={styles.tipText}>
                7-9 hours of quality sleep is crucial for cognitive performance
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="water" size={24} color={COLORS.primary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay Hydrated</Text>
              <Text style={styles.tipText}>
                Dehydration can impair cognitive function by up to 25%
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="fitness" size={24} color={COLORS.primary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Exercise Regularly</Text>
              <Text style={styles.tipText}>
                Physical activity increases blood flow to the brain
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Consistent Timing</Text>
              <Text style={styles.tipText}>
                Take assessments at the same time each week for accurate tracking
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.disclaimerSection}>
        <Ionicons name="information-circle" size={20} color={COLORS.textSecondary} />
        <Text style={styles.disclaimer}>
          These insights are for performance awareness only and are not medical advice.
          Consult a healthcare professional if you have concerns about your cognitive health.
        </Text>
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
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  trendDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  componentCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  componentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  componentScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  concernBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  concernText: {
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '500',
    marginLeft: 5,
  },
  recommendationCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendationHeaderText: {
    marginLeft: 15,
    flex: 1,
  },
  recommendationArea: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recommendationSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tipContent: {
    marginLeft: 15,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 20,
    padding: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 30,
  },
});
