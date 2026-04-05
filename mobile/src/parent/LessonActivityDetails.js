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
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (child?._id) {
      fetchLessonDetails();
    }
  }, [child]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      const [progressResponse, recitationsResponse, quizzesResponse] = await Promise.all([
        parentService.getChildProgress(child._id),
        parentService.getChildRecitations(child._id).catch(() => ({ success: false, data: { recitations: [] } })),
        parentService.getChildQuizzes(child._id).catch(() => ({ success: false, data: { quizzes: [] } })),
      ]);
      
      if (progressResponse.success && progressResponse.data) {
        const progressData = progressResponse.data.progress || [];
        const recitationsData = recitationsResponse?.data?.recitations || [];
        const quizzesData = quizzesResponse?.data?.quizzes || [];
        
        // Transform progress data into lesson details format
        const transformedLessons = transformProgressToLessons(progressData, recitationsData, quizzesData);
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
  const normalizeLevelId = (value) => {
    const raw = String(value || '').toLowerCase();
    const levelMatch = raw.match(/(qaida|quran|dua)(?:_level)?_(\d+)/);
    if (levelMatch) return `${levelMatch[1]}_${Number(levelMatch[2])}`;
    return raw;
  };

  const transformProgressToLessons = (progressData, recitationsData = [], quizzesData = []) => {
    const recitationMap = {};
    const quizCoinsByLevel = {};

    recitationsData.forEach((r) => {
      const normalizedLevel = normalizeLevelId(r?.levelId || 'unknown');
      const key = `${r.module || 'Unknown'}_${normalizedLevel || 'unknown'}`;
      if (!recitationMap[key]) {
        recitationMap[key] = [];
      }
      recitationMap[key].push(r);
    });

    Object.keys(recitationMap).forEach((key) => {
      recitationMap[key].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    quizzesData.forEach((q) => {
      const levelKey = normalizeLevelId(q?.levelId || q?.quizId || '');
      if (!levelKey) return;
      const coins = Number(q?.coinsEarned || 0);
      if (!quizCoinsByLevel[levelKey]) quizCoinsByLevel[levelKey] = 0;
      quizCoinsByLevel[levelKey] += coins;
    });

    // Group progress by module/level/lesson
    const lessonMap = {};
    
    progressData.forEach(p => {
      const normalizedLevel = normalizeLevelId(p?.levelId || 'unknown');
      const key = `${p.module || 'Unknown'}_${normalizedLevel || 'unknown'}`;
      const recitationsForLesson = recitationMap[key] || [];
      const recitationAccuracyTrend = recitationsForLesson
        .map((r) => Math.round(r.accuracyScore ?? r.overallScore ?? 0))
        .filter((score) => Number.isFinite(score));
      const currentAccuracy = recitationAccuracyTrend.length
        ? recitationAccuracyTrend[recitationAccuracyTrend.length - 1]
        : (p.accuracy || 0);
      const levelKey = normalizeLevelId(p?.levelId || '');
      const progressCoins = Number(p?.coinsEarned || 0);
      const fallbackQuizCoins = Number(quizCoinsByLevel[levelKey] || 0);
      const effectiveCoins = progressCoins > 0 ? progressCoins : fallbackQuizCoins;
      const mostRecentRecitationAt = recitationsForLesson.length
        ? recitationsForLesson[recitationsForLesson.length - 1]?.createdAt
        : null;
      const lastRecordedAt = mostRecentRecitationAt || p.lastAccessedAt || p.updatedAt || p.createdAt;
      
      if (!lessonMap[key]) {
        lessonMap[key] = {
          id: p._id,
          title: getLessonTitle(p),
          type: p.module,
          attempts: Math.max(p.attempts || 0, recitationsForLesson.length || 0),
          accuracyTrend: recitationAccuracyTrend,
          currentAccuracy,
          lastRecordedAt,
          lastRecorded: getTimeAgo(lastRecordedAt),
          status: p.status,
          timeSpent: p.timeSpent || 0,
          completionPercentage: p.completionPercentage || 0,
          coinsEarned: effectiveCoins,
          content: p.contentId,
          moduleLevel: p.levelId,
        };
      } else {
        // Keep the latest data by access/update timestamps.
        const currentDate = new Date(lessonMap[key].lastRecordedAt || 0).getTime();
        const candidateDate = new Date(lastRecordedAt || 0).getTime();
        if (candidateDate >= currentDate) {
          lessonMap[key].id = p._id;
          lessonMap[key].title = getLessonTitle(p);
          lessonMap[key].type = p.module;
          lessonMap[key].attempts = Math.max(p.attempts || 0, recitationsForLesson.length || 0);
          lessonMap[key].accuracyTrend = recitationAccuracyTrend;
          lessonMap[key].currentAccuracy = currentAccuracy;
          lessonMap[key].lastRecordedAt = lastRecordedAt;
          lessonMap[key].lastRecorded = getTimeAgo(lastRecordedAt);
          lessonMap[key].status = p.status;
          lessonMap[key].timeSpent = p.timeSpent || 0;
          lessonMap[key].completionPercentage = p.completionPercentage || 0;
          lessonMap[key].coinsEarned = Math.max(Number(lessonMap[key].coinsEarned || 0), effectiveCoins);
          lessonMap[key].content = p.contentId;
          lessonMap[key].moduleLevel = p.levelId;
        }
      }
    });

    // Convert to array and sort by last accessed
    return Object.values(lessonMap)
      .map(lesson => ({
        ...lesson,
        attempts: lesson.attempts > 0 ? lesson.attempts : 0,
        accuracyTrend: (lesson.accuracyTrend || []).slice(-8),
        lastRecorded: getTimeAgo(lesson.lastRecordedAt),
      }))
      .sort((a, b) => new Date(b.lastRecordedAt || 0) - new Date(a.lastRecordedAt || 0))
      .slice(0, 10); // Show top 10 lessons
  };

  const getLessonTitle = (progress) => {
    const levelId = String(progress?.levelId || '').toLowerCase();
    const levelMatch = levelId.match(/(qaida|quran|dua)(?:_level)?_(\d+)/);
    if (levelMatch) {
      const moduleName = levelMatch[1].charAt(0).toUpperCase() + levelMatch[1].slice(1);
      return `${moduleName} Level ${Number(levelMatch[2])}`;
    }

    if (progress.contentId) {
      return progress.contentId.name || progress.contentId.title || progress.lessonId;
    }

    if (progress?.module) {
      return `${progress.module} Lesson`;
    }

    return 'Lesson';
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const now = new Date(nowMs);
    const date = new Date(dateString);
    const dateMs = date.getTime();
    if (!Number.isFinite(dateMs)) return 'Unknown';

    const diffMs = Math.max(0, now.getTime() - dateMs);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const exactTime = date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    if (diffMinutes < 1) return `Less than a minute ago (${exactTime})`;
    if (diffMinutes < 60) return `${diffMinutes} min ago (${exactTime})`;
    if (diffHours < 24) {
      const mins = diffMinutes % 60;
      return `${diffHours}h ${mins}m ago (${exactTime})`;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago (${exactTime})`;
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
                {lesson.accuracyTrend.length >= 2 && (
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Accuracy Trend</Text>
                    <LineChart
                      data={{
                        labels: [],
                        datasets: [{
                          data: lesson.accuracyTrend,
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

                {lesson.accuracyTrend.length < 2 && (
                  <Text style={styles.insufficientTrendText}>More recitation attempts are needed to draw a trend graph.</Text>
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
  insufficientTrendText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default LessonActivityDetails;
