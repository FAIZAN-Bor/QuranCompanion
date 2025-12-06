import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import parentService from '../services/parentService';

const MistakeLog = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child', _id: null } };
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (child?._id) {
      fetchMistakes();
    } else {
      setLoading(false);
    }
  }, [child?._id]);

  const fetchMistakes = async () => {
    if (!child?._id) return;
    try {
      setLoading(true);
      const response = await parentService.getChildMistakes(child._id);
      if (response.success) {
        setMistakes(response.data.mistakes || []);
      }
    } catch (error) {
      console.error('Error fetching mistakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMistakes();
    setRefreshing(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'major': return '#E53935';
      case 'moderate': return '#F57C00';
      case 'minor': return '#FDD835';
      default: return '#666';
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} week(s) ago`;
  };

  const unresolvedCount = mistakes.filter(m => !m.isResolved).length;
  const topMistakeType = mistakes.length > 0 
    ? mistakes.reduce((acc, m) => {
        acc[m.mistakeType] = (acc[m.mistakeType] || 0) + 1;
        return acc;
      }, {})
    : {};
  const mostCommonType = Object.keys(topMistakeType).sort((a, b) => topMistakeType[b] - topMistakeType[a])[0] || 'None';

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7D4F" />
        <Text style={styles.loadingText}>Loading mistakes...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A7D4F']} />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mistake Log</Text>
          <Text style={styles.subtitle}>{child.name}'s Common Errors</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#FFFFFF', '#FFEBEE']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryTitle}>Unresolved Mistakes</Text>
            <Text style={styles.summaryCount}>{unresolvedCount}</Text>
            <Text style={styles.summaryNote}>Focus on {mostCommonType} errors</Text>
          </LinearGradient>
        </View>

        {/* Mistakes Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Mistake Log</Text>
          
          {mistakes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyText}>No mistakes recorded yet!</Text>
            </View>
          ) : mistakes.map((mistake) => (
            <LinearGradient
              key={mistake._id}
              colors={mistake.isResolved ? ['#F1F8E9', '#E8F5E9'] : ['#FFFFFF', '#F9F9F9']}
              style={styles.mistakeCard}
            >
              <View style={styles.mistakeHeader}>
                <View style={styles.wordContainer}>
                  <Text style={styles.arabicWord}>{mistake.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(mistake.severity) }]}>
                    <Text style={styles.severityText}>{mistake.severity.toUpperCase()}</Text>
                  </View>
                </View>
                {mistake.isResolved && (
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedText}>✓ Resolved</Text>
                  </View>
                )}
              </View>

              <View style={styles.mistakeDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{mistake.mistakeType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Module:</Text>
                  <Text style={styles.detailValue}>{mistake.module}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Occurred:</Text>
                  <Text style={styles.detailValue}>{getTimeAgo(mistake.timestamp)}</Text>
                </View>
                <Text style={styles.descriptionText}>{mistake.description}</Text>
              </View>

              {!mistake.isResolved && (
              <TouchableOpacity activeOpacity={0.8}>
                <LinearGradient
                  colors={['#0A7D4F', '#15B872']}
                  style={styles.practiceButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.practiceButtonText}>Practice This ▶</Text>
                </LinearGradient>
              </TouchableOpacity>
              )}
            </LinearGradient>
          ))}
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  resolvedBadge: {
    backgroundColor: '#0A7D4F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  resolvedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
  },
  summaryCount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#E53935',
    marginBottom: 10,
  },
  summaryNote: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  mistakeCard: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  mistakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arabicWord: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D84315',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: '#E53935',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  mistakeDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#0A7D4F',
    fontWeight: '800',
  },
  practiceButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  practiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default MistakeLog;
