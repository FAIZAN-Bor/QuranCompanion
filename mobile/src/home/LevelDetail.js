// LevelDetail.js - Display lessons for a specific level

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const LevelDetail = ({ route, navigation }) => {
  const { level } = route.params;
  const [lessons, setLessons] = useState(level.lessons);

  const completedCount = lessons.filter(l => l.completed).length;
  const totalCount = lessons.length;
  const allCompleted = completedCount === totalCount;

  const handleLessonPress = (lesson) => {
    if (lesson.completed) {
      Alert.alert('Already Completed', 'You have completed this lesson!');
      return;
    }

    // Navigate to appropriate lesson screen based on module
    if (level.module === 'Qaida') {
      // Navigate to Quaida screen with the appropriate data
      if (level.quidaData && level.quidaData.length > 0) {
        navigation.navigate('Quaida', { data: level.quidaData });
      } else {
        Alert.alert('No Data', 'Lesson content is not available yet.');
      }
    } else if (level.module === 'Quran') {
      // Navigate to Quran screen with the appropriate data
      if (level.quranData && level.quranData.length > 0) {
        navigation.navigate('Quran', { data: level.quranData });
      } else {
        Alert.alert('No Data', 'Surah content is not available yet.');
      }
    }
  };

  const handleQuizPress = () => {
    if (!allCompleted) {
      Alert.alert('Complete All Lessons', 'You must complete all lessons before taking the quiz!');
      return;
    }
    navigation.navigate('QuizScreen', { level });
  };

  const renderLesson = (lesson, index) => {
    return (
      <TouchableOpacity
        key={lesson.id}
        style={[styles.lessonCard, lesson.completed && styles.lessonCompleted]}
        onPress={() => handleLessonPress(lesson)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={lesson.completed ? ['#E8F5E9', '#C8E6C9'] : ['#FFFFFF', '#F5F5F5']}
          style={styles.lessonGradient}
        >
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>{index + 1}</Text>
          </View>
          
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonStatus}>
              {lesson.completed ? '✓ Completed' : 'Not Started'}
            </Text>
          </View>

          {lesson.completed ? (
            <Image source={require('../assests/coin.png')} style={styles.checkIcon} />
          ) : (
            <Image source={require('../assests/bell1.png')} style={styles.playIcon} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.moduleBadge}>
            <Text style={styles.moduleText}>{level.module} - Level {level.levelNumber}</Text>
          </View>
          
          <Text style={styles.headerTitle}>{level.title}</Text>
          <Text style={styles.headerSubtitle}>{level.subtitle}</Text>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#0A7D4F', '#15B872']}
                style={[styles.progressFill, { width: `${(completedCount / totalCount) * 100}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount} / {totalCount} Lessons Completed
            </Text>
          </View>
        </View>

        {/* Lessons List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Lessons</Text>
          
          {lessons.map((lesson, index) => renderLesson(lesson, index))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '700',
  },
  moduleBadge: {
    backgroundColor: '#0A7D4F',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  moduleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 15,
  },
  lessonCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lessonCompleted: {
    borderWidth: 2,
    borderColor: '#0A7D4F',
  },
  lessonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A7D4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  lessonStatus: {
    fontSize: 12,
    color: '#666',
  },
  checkIcon: {
    width: 24,
    height: 24,
    tintColor: '#0A7D4F',
  },
  playIcon: {
    width: 24,
    height: 24,
    tintColor: '#0A7D4F',
  },
  quizSection: {
    marginTop: 30,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
  },
  quizIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFF',
    marginRight: 10,
  },
  quizButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default LevelDetail;
