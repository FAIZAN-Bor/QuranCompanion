import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ChildProgressOverview = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child' } };

  // Mock data for charts
  const accuracyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [65, 70, 75, 72, 80, 83, 85],
      color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const mistakeDistribution = [
    { name: 'Ikhfa', population: 25, color: '#E53935', legendFontColor: '#666', legendFontSize: 13 },
    { name: 'Idgham', population: 15, color: '#1976D2', legendFontColor: '#666', legendFontSize: 13 },
    { name: 'Qalqalah', population: 30, color: '#F57C00', legendFontColor: '#666', legendFontSize: 13 },
    { name: 'Madd', population: 20, color: '#7B1FA2', legendFontColor: '#666', legendFontSize: 13 },
    { name: 'Ghunna', population: 10, color: '#0097A7', legendFontColor: '#666', legendFontSize: 13 },
  ];

  const lessonProgress = [
    { name: 'Qaida Lessons', progress: 80, color: '#0A7D4F' },
    { name: 'Quran Lessons', progress: 65, color: '#1976D2' },
    { name: 'Duas Learned', progress: 90, color: '#7B1FA2' },
  ];

  const summaryCards = [
    { label: 'Top Mistake', value: 'Qalqalah', color: '#E53935' },
    { label: 'Overall Accuracy', value: '83%', color: '#0A7D4F' },
    { label: 'Last Active', value: '3 hours ago', color: '#1976D2' },
    { label: 'Quizzes Attempted', value: '12', color: '#7B1FA2' },
  ];

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{child.name}'s Progress</Text>
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
          <View style={styles.chartContainer}>
            <PieChart
              data={mistakeDistribution}
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
          <Text style={styles.chartNote}>Most common mistakes this week</Text>
        </View>

        {/* Lesson Completion Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lesson Completion</Text>
          {lessonProgress.map((lesson, index) => (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{lesson.name}</Text>
                <Text style={styles.progressPercentage}>{lesson.progress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={[lesson.color, lesson.color + '80']}
                  style={[styles.progressBarFill, { width: `${lesson.progress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
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
