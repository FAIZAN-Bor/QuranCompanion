import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';
import parentService from '../services/parentService';

const screenWidth = Dimensions.get('window').width;

const ChildProgressOverview = ({ route }) => {
  const childFromParams = route?.params?.child;
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [mistakeData, setMistakeData] = useState([]);
  const [quizCount, setQuizCount] = useState(0);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(childFromParams || null);

  useEffect(() => {
    if (!childFromParams) {
      fetchChildren();
    } else {
      setSelectedChild(childFromParams);
    }
  }, [childFromParams]);

  useEffect(() => {
    if (selectedChild?._id) {
      fetchAllData();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await parentService.getChildren();
      // response is { success, data: { children: [{ child: {...} }, ...] } }
      if (response.success && response.data?.children?.length > 0) {
        const childrenList = response.data.children.map(link => ({
          _id: link.child._id,
          name: link.child.name,
          email: link.child.email,
          ...link.child
        }));
        setChildren(childrenList);
        setSelectedChild(childrenList[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching children:', err);
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    if (!selectedChild?._id) return;
    try {
      setLoading(true);
      const [progressRes, mistakesRes, quizzesRes] = await Promise.all([
        parentService.getChildProgress(selectedChild._id),
        parentService.getChildMistakes(selectedChild._id),
        parentService.getChildQuizzes(selectedChild._id),
      ]);

      // progressRes.data is { progress, summary }
      setProgressData(progressRes.data?.summary || null);
      // quizzesRes.data is { quizzes }
      setQuizCount(quizzesRes.data?.quizzes?.length || 0);

      // mistakesRes.data is { mistakes }
      const mistakes = mistakesRes.data?.mistakes || [];
      if (mistakes.length > 0) {
        const mistakesByType = mistakes.reduce((acc, m) => {
          const type = m.mistakeType || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const colors = ['#E53935', '#1976D2', '#F57C00', '#7B1FA2', '#0097A7', '#4CAF50'];
        const pieData = Object.entries(mistakesByType).map(([name, count], index) => ({
          name,
          population: count,
          color: colors[index % colors.length],
          legendFontColor: '#666',
          legendFontSize: 13,
        }));
        setMistakeData(pieData);
      }
    } catch (err) {
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  // Build accuracy data from weeklyProgress
  const buildAccuracyData = () => {
    const defaultData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
        strokeWidth: 3,
      }],
    };

    if (!progressData?.weeklyProgress) return defaultData;

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataPoints = progressData.weeklyProgress.map(wp => wp.accuracy || 0);
    const labels = progressData.weeklyProgress.map(wp => {
      const date = new Date(wp.date);
      return dayLabels[date.getDay()];
    });

    return {
      labels: labels.length > 0 ? labels : defaultData.labels,
      datasets: [{
        data: dataPoints.length > 0 ? dataPoints : defaultData.datasets[0].data,
        color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
        strokeWidth: 3,
      }],
    };
  };

  // Build lesson progress from lessonsByType
  const buildLessonProgress = () => {
    const defaultProgress = [
      { name: 'Qaida Lessons', progress: 0, color: '#0A7D4F' },
      { name: 'Quran Lessons', progress: 0, color: '#1976D2' },
      { name: 'Duas Learned', progress: 0, color: '#7B1FA2' },
    ];

    if (!progressData?.lessonsByType) return defaultProgress;

    const { Qaida = {}, Quran = {}, Dua = {} } = progressData.lessonsByType;
    return [
      { name: 'Qaida Lessons', progress: Qaida.completed || 0, total: Qaida.total || 30, color: '#0A7D4F' },
      { name: 'Quran Lessons', progress: Quran.completed || 0, total: Quran.total || 114, color: '#1976D2' },
      { name: 'Duas Learned', progress: Dua.completed || 0, total: Dua.total || 50, color: '#7B1FA2' },
    ];
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!selectedChild) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>👶</Text>
          <Text style={styles.emptyText}>No child linked yet</Text>
        </View>
      </LinearGradient>
    );
  }

  const accuracyData = buildAccuracyData();
  const lessonProgress = buildLessonProgress();
  
  const topMistake = mistakeData.length > 0 
    ? mistakeData.reduce((a, b) => a.population > b.population ? a : b).name 
    : 'None';

  const summaryCards = [
    { label: 'Top Mistake', value: topMistake, color: '#E53935' },
    { label: 'Overall Accuracy', value: `${progressData?.accuracy || 0}%`, color: '#0A7D4F' },
    { label: 'Last Active', value: formatLastActive(progressData?.lastActivity), color: '#1976D2' },
    { label: 'Quizzes Attempted', value: `${quizCount}`, color: '#7B1FA2' },
  ];

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{selectedChild.name}'s Progress</Text>
          <Text style={styles.subtitle}>Detailed Performance Overview</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Summary</Text>
          <View style={styles.summaryGrid}>
            {summaryCards.map((card, index) => (
              <LinearGradient
                key={index}
                colors={['#FFFFFF', '#F1F8E9']}
                style={styles.summaryCard}
              >
                <Text style={styles.summaryLabel}>{card.label}</Text>
                <Text style={[styles.summaryValue, { color: card.color }]}>{card.value}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Accuracy Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accuracy Trend (Last 7 Days)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={accuracyData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#E8F5E9',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#0A7D4F',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Mistake Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mistake Distribution</Text>
          {mistakeData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyText}>No mistakes recorded yet!</Text>
            </View>
          ) : (
          <View style={styles.chartContainer}>
            <PieChart
              data={mistakeData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend={true}
              style={styles.chart}
            />
          </View>
          )}
          <Text style={styles.chartNote}>Most common mistakes this week</Text>
        </View>

        {/* Lesson Completion Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lesson Completion</Text>
          {lessonProgress.map((lesson, index) => {
            const progressPercent = lesson.total > 0 
              ? Math.round((lesson.progress / lesson.total) * 100) 
              : 0;
            return (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{lesson.name}</Text>
                <Text style={styles.progressPercentage}>{lesson.progress}/{lesson.total || '?'}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={[lesson.color, lesson.color + '80']}
                  style={[styles.progressBarFill, { width: `${Math.min(progressPercent, 100)}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            );
          })}
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
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  chartNote: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A7D4F',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A7D4F',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    overflow: 'hidden',
    elevation: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
});

export default ChildProgressOverview;
