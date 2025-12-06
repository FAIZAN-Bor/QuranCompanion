import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import parentService from '../services/parentService';

const screenWidth = Dimensions.get('window').width;

const LessonActivityDetails = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child' } };
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (child?._id) {
      fetchLessonDetails();
    }
  }, [child]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      const response = await parentService.getChildProgress(child._id);
      
      if (response.success && response.data) {
        const progressData = response.data.progress || [];
        
        // Transform progress data into lesson details format
        const transformedLessons = transformProgressToLessons(progressData);
        setLessons(transformedLessons);
      }
    } catch (error) {
      console.error('Error fetching lesson details:', error);
      Alert.alert('Error', 'Failed to load lesson details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLessonDetails();
    setRefreshing(false);
  };

  // Transform raw progress data into lesson display format
  const transformProgressToLessons = (progressData) => {
    // Group progress by lessonId to aggregate data
    const lessonMap = {};
    
    progressData.forEach(p => {
      const key = `${p.module}_${p.lessonId}`;
      
      if (!lessonMap[key]) {
        lessonMap[key] = {
          id: p._id,
          title: getLessonTitle(p),
          type: p.module,
          attempts: p.attempts || 1,
          accuracy: [p.accuracy || 0],
          currentAccuracy: p.accuracy || 0,
          lastRecorded: getTimeAgo(p.lastAccessedAt || p.updatedAt),
          status: p.status,
          timeSpent: p.timeSpent || 0,
          completionPercentage: p.completionPercentage || 0,
          coinsEarned: p.coinsEarned || 0,
          content: p.contentId,
        };
      } else {
        // Aggregate multiple attempts
        lessonMap[key].attempts += 1;
        lessonMap[key].accuracy.push(p.accuracy || 0);
        lessonMap[key].currentAccuracy = p.accuracy || 0;
      }
    });

    // Convert to array and sort by last accessed
    return Object.values(lessonMap)
      .map(lesson => ({
        ...lesson,
        // Ensure accuracy array has at least 2 points for chart
        accuracy: lesson.accuracy.length < 2 
          ? [0, ...lesson.accuracy] 
          : lesson.accuracy.slice(-8), // Last 8 attempts max
      }))
      .slice(0, 10); // Show top 10 lessons
  };

  const getLessonTitle = (progress) => {
    if (progress.contentId) {
      return progress.contentId.name || progress.contentId.title || progress.lessonId;
    }
    // Format lessonId into readable title
    const parts = progress.lessonId.split('_');
    if (parts.length >= 2) {
      return `${progress.module} - Lesson ${parts[1] || parts[0]}`;
    }
    return progress.lessonId;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Qaida': return '#0A7D4F';
      case 'Quran': return '#1976D2';
      case 'Dua': return '#7B1FA2';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed ✓';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7D4F" />
        <Text style={styles.loadingText}>Loading lesson details...</Text>
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
          <Text style={styles.title}>Lesson Activity</Text>
          <Text style={styles.subtitle}>{child.name}'s Practice Details</Text>
        </View>

        {lessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No Lessons Yet</Text>
            <Text style={styles.emptySubtitle}>{child.name} hasn't started any lessons</Text>
          </View>
        ) : (
          /* Lessons */
          lessons.map((lesson) => (
            <View key={lesson.id} style={styles.section}>
              
              {/* Lesson Header */}
              <LinearGradient
                colors={['#FFFFFF', '#F1F8E9']}
                style={styles.lessonCard}
              >
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonTitleContainer}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <View style={styles.tagRow}>
                      <View style={styles.typeTag}>
                        <Text style={[styles.typeText, { color: getTypeColor(lesson.type) }]}>
                          {lesson.type}
                        </Text>
                      </View>
                      <View style={[styles.statusTag, { backgroundColor: getStatusColor(lesson.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(lesson.status) }]}>
                          {getStatusLabel(lesson.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.statsContainer}>
                    <Text style={styles.attemptsText}>{lesson.attempts} attempts</Text>
                    <Text style={styles.lastRecordedText}>{lesson.lastRecorded}</Text>
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(lesson.currentAccuracy)}%</Text>
                    <Text style={styles.statLabel}>Accuracy</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatTime(lesson.timeSpent)}</Text>
                    <Text style={styles.statLabel}>Time Spent</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{lesson.completionPercentage}%</Text>
                    <Text style={styles.statLabel}>Complete</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FFD700' }]}>🪙 {lesson.coinsEarned}</Text>
                    <Text style={styles.statLabel}>Coins</Text>
                  </View>
                </View>

                {/* Accuracy Trend */}
                {lesson.accuracy.length >= 2 && (
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Accuracy Trend</Text>
                    <LineChart
                      data={{
                        labels: [],
                        datasets: [{
                          data: lesson.accuracy,
                        }],
                      }}
                      width={screenWidth - 80}
                      height={120}
                      chartConfig={{
                        backgroundColor: '#FFFFFF',
                        backgroundGradientFrom: '#FFFFFF',
                        backgroundGradientTo: '#F1F8E9',
                        decimalPlaces: 0,
                        color: (opacity = 1) => getTypeColor(lesson.type) + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
                        labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                        propsForDots: {
                          r: '4',
                          strokeWidth: '2',
                          stroke: getTypeColor(lesson.type),
                        },
                      }}
                      bezier
                      style={styles.miniChart}
                      withVerticalLabels={false}
                      withHorizontalLabels={false}
                    />
                  </View>
                )}

              </LinearGradient>
            </View>
          ))
        )}

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  lessonCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  lessonTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A7D4F',
    marginBottom: 4,
  },
  lastRecordedText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666',
    marginBottom: 10,
  },
  miniChart: {
    borderRadius: 12,
  },
});

export default LessonActivityDetails;
