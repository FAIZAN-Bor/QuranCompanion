import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const QuizResults = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child' } };

  const quizzes = [
    {
      id: 1,
      title: 'Tajweed Rules Quiz 1',
      score: 85,
      maxScore: 100,
      passed: true,
      date: '2 days ago',
      timeSpent: '8 min',
      badge: '🏆',
    },
    {
      id: 2,
      title: 'Qaida Level 4 Assessment',
      score: 92,
      maxScore: 100,
      passed: true,
      date: '5 days ago',
      timeSpent: '12 min',
      badge: '⭐',
    },
    {
      id: 3,
      title: 'Madd Rules Practice',
      score: 68,
      maxScore: 100,
      passed: true,
      date: '1 week ago',
      timeSpent: '10 min',
      badge: null,
    },
    {
      id: 4,
      title: 'Quran Recitation Test',
      score: 95,
      maxScore: 100,
      passed: true,
      date: '1 week ago',
      timeSpent: '15 min',
      badge: '🥇',
    },
    {
      id: 5,
      title: 'Basic Tajweed Quiz',
      score: 78,
      maxScore: 100,
      passed: true,
      date: '2 weeks ago',
      timeSpent: '7 min',
      badge: null,
    },
  ];

  const chartData = {
    labels: ['Quiz 1', 'Q2', 'Q3', 'Q4', 'Q5'],
    datasets: [{
      data: quizzes.map(q => q.score),
    }],
  };

  const avgScore = (quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length).toFixed(0);
  const bestScore = Math.max(...quizzes.map(q => q.score));
  const weakestScore = Math.min(...quizzes.map(q => q.score));

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
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

        {/* Quiz List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Quiz Attempts</Text>
          {quizzes.map((quiz) => (
            <LinearGradient
              key={quiz.id}
              colors={['#FFFFFF', '#F1F8E9']}
              style={styles.quizCard}
            >
              <View style={styles.quizHeader}>
                <View style={styles.quizTitleContainer}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  {quiz.badge && <Text style={styles.badge}>{quiz.badge}</Text>}
                </View>
                <View style={[
                  styles.scoreCircle,
                  { backgroundColor: quiz.score >= 80 ? '#0A7D4F' : quiz.score >= 60 ? '#F57C00' : '#E53935' }
                ]}>
                  <Text style={styles.scoreText}>{quiz.score}</Text>
                  <Text style={styles.maxScoreText}>/{quiz.maxScore}</Text>
                </View>
              </View>

              <View style={styles.quizDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, styles.passText]}>
                    {quiz.passed ? '✓ Passed' : '✗ Failed'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{quiz.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Time Spent:</Text>
                  <Text style={styles.detailValue}>{quiz.timeSpent}</Text>
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
