import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { COLORS, USER_ID, API_URL } from '../utils/constants';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  const checkServerConnection = async () => {
    setLoading(true);
    try {
      await apiService.healthCheck();
      setServerStatus('connected');
      Alert.alert('Connection Status', 'Connected to server successfully!');
    } catch (error) {
      setServerStatus('disconnected');
      Alert.alert(
        'Connection Error',
        'Cannot connect to server. Make sure the backend is running at:\n\n' + API_URL
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetBaseline = () => {
    Alert.alert(
      'Reset Baseline',
      'This will delete all your assessment history and set your next assessment as a new baseline. This action cannot be undone.\n\nAre you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await apiService.resetBaseline(USER_ID);

              if (result.success) {
                // Also clear local cache
                await storageService.clearAllData();

                Alert.alert('Success', result.message);
              } else {
                throw new Error('Reset failed');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to reset baseline');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const data = await apiService.exportData(USER_ID);

      if (data.success) {
        // Convert to JSON string
        const jsonData = JSON.stringify(data, null, 2);

        // Share data
        await Share.share({
          message: `BrainGauge Data Export\n\nUser: ${data.user_id}\nAssessments: ${data.total_assessments}\nExported: ${new Date(data.export_date).toLocaleString()}\n\n${jsonData}`,
          title: 'BrainGauge Data Export',
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all locally cached data. Your data on the server will not be affected.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: async () => {
            await storageService.clearAllData();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>Athlete Profile</Text>
        <Text style={styles.userId}>ID: {USER_ID}</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Connection</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={checkServerConnection}
          disabled={loading}
        >
          <View style={styles.cardContent}>
            <Ionicons
              name={
                serverStatus === 'connected'
                  ? 'cloud-done'
                  : serverStatus === 'disconnected'
                  ? 'cloud-offline'
                  : 'cloud'
              }
              size={24}
              color={
                serverStatus === 'connected'
                  ? COLORS.success
                  : serverStatus === 'disconnected'
                  ? COLORS.danger
                  : COLORS.textSecondary
              }
            />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Check Connection</Text>
              <Text style={styles.cardSubtitle}>
                {serverStatus === 'connected'
                  ? 'Connected'
                  : serverStatus === 'disconnected'
                  ? 'Disconnected'
                  : 'Tap to check'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Server URL:</Text>
          <Text style={styles.infoValue}>{API_URL}</Text>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={handleExportData}
          disabled={loading}
        >
          <View style={styles.cardContent}>
            <Ionicons name="download" size={24} color={COLORS.primary} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Export Data</Text>
              <Text style={styles.cardSubtitle}>
                Download all assessment data as JSON
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={handleClearCache}
          disabled={loading}
        >
          <View style={styles.cardContent}>
            <Ionicons name="trash-bin" size={24} color={COLORS.textSecondary} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Clear Cache</Text>
              <Text style={styles.cardSubtitle}>
                Remove locally stored data
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={handleResetBaseline}
          disabled={loading}
        >
          <View style={styles.cardContent}>
            <Ionicons name="refresh" size={24} color={COLORS.warning} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Reset Baseline</Text>
              <Text style={styles.cardSubtitle}>
                Delete all data and start fresh
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>BrainGauge</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            Cognitive Performance Tracker for Athletes
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              BrainGauge tracks three key areas of cognitive performance:
            </Text>
          </View>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="mic" size={16} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>Speech Analysis</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="flash" size={16} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>Cognitive Performance</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="eye" size={16} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>Visual-Motor Tracking</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.disclaimerBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
            <Text style={styles.disclaimerText}>
              This is a performance tracking tool, NOT a medical diagnostic device.
              Consult healthcare professionals for medical concerns.
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>
            Change Server URL
          </Text>
          <Text style={styles.instructionText}>
            To connect to a different backend server:
          </Text>
          <Text style={styles.codeText}>
            1. Edit: mobile-app/app/utils/constants.js{'\n'}
            2. Update API_URL to your server address{'\n'}
            3. Restart Expo app
          </Text>

          <Text style={styles.instructionText} style={{ marginTop: 15 }}>
            For physical devices, use your computer's local IP:
          </Text>
          <Text style={styles.codeText}>
            export const API_URL = 'http://192.168.1.XXX:8000';
          </Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  card: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardText: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  aboutCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  aboutVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  aboutDescription: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  bulletList: {
    marginLeft: 30,
    marginTop: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  instructionCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.primary,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 6,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 30,
  },
});
