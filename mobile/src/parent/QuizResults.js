import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import parentService from '../services/parentService';

const screenWidth = Dimensions.get('window').width;

const QuizResults = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child', _id: null } };
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (child?._id) {
      fetchQuizzes();
    } else {
      setLoading(false);
    }
  }, [child?._id]);

  const fetchQuizzes = async () => {
    if (!child?._id) return;
    try {
      setLoading(true);
      const response = await parentService.getChildQuizzes(child._id);
      if (response.success) {
        setQuizzes(response.data.quizzes || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizzes();
    setRefreshing(false);
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

  const getBadge = (percentage) => {
    if (percentage === 100) return '🥇';
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '⭐';
    return null;
  };

  const chartData = {
    labels: quizzes.slice(0, 5).map((_, i) => `Q${i + 1}`),
    datasets: [{
      data: quizzes.slice(0, 5).map(q => q.percentage || 0),
    }],
  };

  const avgScore = quizzes.length > 0 
    ? (quizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizzes.length).toFixed(0) 
    : 0;
  const bestScore = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.percentage || 0)) : 0;
  const weakestScore = quizzes.length > 0 ? Math.min(...quizzes.map(q => q.percentage || 0)) : 0;

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7D4F" />
        <Text style={styles.loadingText}>Loading quiz results...</Text>
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
          <Text style={styles.title}>Quiz Results</Text>
          <Text style={styles.subtitle}>{child.name}'s Performance</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <LinearGradient colors={['#FFFFFF', '#E3F2FD']} style={styles.statCard}>
              <Text style={styles.statValue}>{avgScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#E8F5E9']} style={styles.statCard}>
              <Text style={styles.statValue}>{bestScore}%</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#FFEBEE']} style={styles.statCard}>
              <Text style={styles.statValue}>{weakestScore}%</Text>
              <Text style={styles.statLabel}>Weakest Score</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#FFF9C4']} style={styles.statCard}>
              <Text style={styles.statValue}>{quizzes.length}</Text>
              <Text style={styles.statLabel}>Total Quizzes</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Score Chart */}
        {quizzes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Progression</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
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
                propsForBackgroundLines: {
                  strokeDasharray: '',
                },
              }}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>
        </View>
        )}

        {/* Quiz List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Quiz Attempts</Text>
          {quizzes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>No quizzes completed yet!</Text>
            </View>
          ) : quizzes.map((quiz) => (
            <LinearGradient
              key={quiz._id}
              colors={['#FFFFFF', '#F1F8E9']}
              style={styles.quizCard}
            >
              <View style={styles.quizHeader}>
                <View style={styles.quizTitleContainer}>
                  <Text style={styles.quizTitle}>{quiz.quizId?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                  {getBadge(quiz.percentage) && <Text style={styles.badge}>{getBadge(quiz.percentage)}</Text>}
                </View>
                <View style={[
                  styles.scoreCircle,
                  { backgroundColor: quiz.percentage >= 80 ? '#0A7D4F' : quiz.percentage >= 60 ? '#F57C00' : '#E53935' }
                ]}>
                  <Text style={styles.scoreText}>{quiz.percentage}</Text>
                  <Text style={styles.maxScoreText}>%</Text>
                </View>
              </View>

              <View style={styles.quizDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, quiz.passed ? styles.passText : styles.failText]}>
                    {quiz.passed ? '✓ Passed' : '✗ Failed'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{getTimeAgo(quiz.completedAt)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Score:</Text>
                  <Text style={styles.detailValue}>{quiz.score}/{quiz.totalQuestions}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Coins Earned:</Text>
                  <Text style={styles.detailValue}>🪙 {quiz.coinsEarned}</Text>
                </View>
              </View>
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
  failText: {
    color: '#E53935',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
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
  quizCard: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  quizTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A7D4F',
    flex: 1,
  },
  badge: {
    fontSize: 24,
  },
  scoreCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  maxScoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quizDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  passText: {
    color: '#0A7D4F',
  },
});

export default QuizResults;
