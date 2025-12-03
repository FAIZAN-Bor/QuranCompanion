import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const LessonActivityDetails = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child' } };

  const lessons = [
    {
      id: 1,
      title: 'Lesson 5: Madd Rules',
      type: 'Qaida',
      attempts: 8,
      accuracy: [60, 65, 70, 75, 78, 82, 85, 88],
      lastRecorded: '2 days ago',
      totalMistakes: 5,
      words: [
        { word: 'مَدّ', accuracy: 90, errors: 1 },
        { word: 'قَلْقَلَة', accuracy: 85, errors: 2 },
        { word: 'إِخْفَاء', accuracy: 75, errors: 5 },
      ],
    },
    {
      id: 2,
      title: 'Surah Al-Fatihah',
      type: 'Quran',
      attempts: 12,
      accuracy: [70, 72, 75, 78, 80, 82, 85, 87, 88, 90, 91, 92],
      lastRecorded: 'Today',
      totalMistakes: 8,
      words: [
        { word: 'بِسْمِ', accuracy: 95, errors: 1 },
        { word: 'الرَّحْمَٰنِ', accuracy: 92, errors: 2 },
        { word: 'الرَّحِيمِ', accuracy: 88, errors: 3 },
      ],
    },
    {
      id: 3,
      title: 'Dua Before Sleeping',
      type: 'Dua',
      attempts: 5,
      accuracy: [65, 72, 78, 85, 90],
      lastRecorded: 'Yesterday',
      totalMistakes: 3,
      words: [
        { word: 'اللَّهُمَّ', accuracy: 92, errors: 1 },
        { word: 'بِاسْمِكَ', accuracy: 88, errors: 2 },
      ],
    },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'Qaida': return '#0A7D4F';
      case 'Quran': return '#1976D2';
      case 'Dua': return '#7B1FA2';
      default: return '#666';
    }
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lesson Activity</Text>
          <Text style={styles.subtitle}>{child.name}'s Practice Details</Text>
        </View>

        {/* Lessons */}
        {lessons.map((lesson) => (
          <View key={lesson.id} style={styles.section}>
            
            {/* Lesson Header */}
            <LinearGradient
              colors={['#FFFFFF', '#F1F8E9']}
              style={styles.lessonCard}
            >
              <View style={styles.lessonHeader}>
                <View>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <View style={styles.typeTag}>
                    <Text style={[styles.typeText, { color: getTypeColor(lesson.type) }]}>
                      {lesson.type}
                    </Text>
                  </View>
                </View>
                <View style={styles.statsContainer}>
                  <Text style={styles.attemptsText}>{lesson.attempts} attempts</Text>
                  <Text style={styles.lastRecordedText}>{lesson.lastRecorded}</Text>
                </View>
              </View>

              {/* Accuracy Trend */}
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

              {/* Mistakes Summary */}
              <View style={styles.mistakeSummary}>
                <Text style={styles.mistakeCount}>Total Mistakes: {lesson.totalMistakes}</Text>
              </View>

              {/* Word Details */}
              <View style={styles.wordSection}>
                <Text style={styles.wordSectionTitle}>Word-by-Word Analysis</Text>
                {lesson.words.map((word, index) => (
                  <View key={index} style={styles.wordRow}>
                    <Text style={styles.arabicWord}>{word.word}</Text>
                    <View style={styles.wordStats}>
                      <View style={styles.accuracyBadge}>
                        <Text style={styles.accuracyText}>{word.accuracy}%</Text>
                      </View>
                      <Text style={styles.errorCount}>{word.errors} errors</Text>
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        ))}

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
  lessonTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  typeTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '800',
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
  chartContainer: {
    marginVertical: 15,
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
  mistakeSummary: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  mistakeCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
    textAlign: 'center',
  },
  wordSection: {
    marginTop: 10,
  },
  wordSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 12,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
  },
  arabicWord: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D84315',
  },
  wordStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accuracyBadge: {
    backgroundColor: '#0A7D4F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  accuracyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  errorCount: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '700',
  },
});

export default LessonActivityDetails;
