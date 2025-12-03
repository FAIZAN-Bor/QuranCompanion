// QuizScreen.js - Quiz after completing level lessons

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const QuizScreen = ({ route, navigation }) => {
  const { level } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Sample quiz questions (you can expand this with real data)
  const quizQuestions = [
    {
      id: 1,
      question: `What did you learn in ${level.title}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0
    },
    {
      id: 2,
      question: 'Which concept is most important in this level?',
      options: ['Concept 1', 'Concept 2', 'Concept 3', 'Concept 4'],
      correctAnswer: 1
    },
    {
      id: 3,
      question: 'How many lessons did you complete?',
      options: [`${level.lessons.length} lessons`, 'None', 'All', 'Some'],
      correctAnswer: 0
    }
  ];

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      Alert.alert('Select Answer', 'Please select an answer to continue.');
      return;
    }

    if (selectedAnswer === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 70) {
      Alert.alert(
        'Congratulations! 🎉',
        `You passed with ${percentage.toFixed(0)}%!\n\nNext level unlocked!`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('ProgressMap')
          }
        ]
      );
    } else {
      Alert.alert(
        'Try Again',
        `You scored ${percentage.toFixed(0)}%.\n\nYou need 70% to pass. Review the lessons and try again!`,
        [
          {
            text: 'Retry',
            onPress: () => {
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setScore(0);
              setShowResult(false);
            }
          },
          {
            text: 'Review Lessons',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  if (showResult) {
    const percentage = (score / quizQuestions.length) * 100;
    return (
      <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
        <SafeAreaView style={styles.container}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Quiz Complete!</Text>
            <Text style={styles.resultScore}>{score} / {quizQuestions.length}</Text>
            <Text style={styles.resultPercentage}>{percentage.toFixed(0)}%</Text>
            
            <TouchableOpacity onPress={handleFinish} activeOpacity={0.8}>
              <LinearGradient
                colors={['#0A7D4F', '#15B872']}
                style={styles.finishButton}
              >
                <Text style={styles.finishButtonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{level.title} Quiz</Text>
          <Text style={styles.questionCounter}>
            Question {currentQuestion + 1} of {quizQuestions.length}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionSelected
                ]}
                onPress={() => handleAnswerSelect(index)}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {selectedAnswer === index && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.optionText,
                  selectedAnswer === index && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestion + 1 === quizQuestions.length ? 'Finish' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionCounter: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 25,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: '#0A7D4F',
    backgroundColor: '#E8F5E9',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0A7D4F',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#0A7D4F',
    fontWeight: '700',
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 10,
  },
  resultPercentage: {
    fontSize: 64,
    fontWeight: '900',
    color: '#15B872',
    marginBottom: 40,
  },
  finishButton: {
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 12,
    elevation: 6,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default QuizScreen;
