// QuizScreen.js - Quiz after completing level lessons

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import quizService from '../services/quizService';
import CoinRewardOverlay from '../component/CoinRewardOverlay';

const QUIZ_PASS_THRESHOLD = 60;

const QuizScreen = ({ route, navigation }) => {
  const { level } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [showCoinOverlay, setShowCoinOverlay] = useState(false);
  const [quizCoinsEarned, setQuizCoinsEarned] = useState(0);

  useEffect(() => {
    fetchQuizQuestions();
  }, [level.id]);

  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      console.log(`[Quiz] Fetching questions for level: ${level.id}`);
      const res = await quizService.getQuestions(level.id);
      
      if (res?.success && res?.data?.questions?.length > 0) {
        console.log(`[Quiz] Successfully fetched ${res.data.questions.length} questions`);
        setQuizQuestions(res.data.questions);
      } else {
        const msg = res?.message || 'No questions found for this level in the database.';
        setFetchError(msg);
        console.log(`[Quiz] Fetch failed: ${msg}`);
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to connect to browser storage or server.';
      setFetchError(`Network Error: ${errorMsg}`);
      console.error('[Quiz] Error fetching quiz questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      Alert.alert('Select Answer', 'Please select an answer to continue.');
      return;
    }

    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correctAnswer;
    
    // Store answer
    setUserAnswers([...userAnswers, {
      questionId: quizQuestions[currentQuestion]._id || currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect
    }]);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      const finalScore = score + (selectedAnswer === quizQuestions[currentQuestion].correctAnswer ? 1 : 0);
      const quizData = {
        quizId: `quiz_${level.id}`,
        module: level.module || 'Qaida',
        levelId: level.id,
        questions: userAnswers,
        score: finalScore,
        totalQuestions: quizQuestions.length,
        timeSpent: 0
      };
      
      console.log('[Quiz] Submitting quiz data:', quizData);
      await quizService.submitQuiz(quizData);
      setScore(finalScore);

      // Calculate coins earned (mirrors backend coinHelper.calculateQuizCoins)
      const percentage = (finalScore / quizQuestions.length) * 100;
      let earned = 0;
      if (percentage >= QUIZ_PASS_THRESHOLD) {
        earned = 50; // Base for passing
        if (percentage === 100) earned += 50;
        else if (percentage >= 90) earned += 30;
        else if (percentage >= 80) earned += 10;
        earned += 20; // First attempt bonus (simplified)
      } else {
        earned = 10; // Consolation
      }
      setQuizCoinsEarned(earned);
      setShowResult(true);

      // Show coin overlay after brief delay
      setTimeout(() => setShowCoinOverlay(true), 600);
    } catch (error) {
      console.error('[Quiz] Quiz submission error:', error);
      Alert.alert('Error', 'Failed to submit quiz statistics. Showing results anyway.');
      setShowResult(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= QUIZ_PASS_THRESHOLD) {
      Alert.alert(
        'Congratulations! 🎉',
        `You passed with ${percentage.toFixed(0)}%!\n\nNext level unlocked!`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('BottomTabNavigator', { screen: 'Progress Map' })
          }
        ]
      );
    } else {
      Alert.alert(
        'Try Again',
        `You scored ${percentage.toFixed(0)}%.\n\nYou need ${QUIZ_PASS_THRESHOLD}% to pass. Review the lessons and try again!`,
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

  if (loading) {
    return (
      <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={{ marginTop: 10, color: '#0A7D4F', fontWeight: 'bold' }}>Loading Quiz Content...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (fetchError) {
    return (
      <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <Text style={{ fontSize: 32, marginBottom: 15 }}>🔎</Text>
          <Text style={{ fontSize: 18, color: '#DC2626', fontWeight: 'bold', textAlign: 'center' }}>
            {fetchError}
          </Text>
          <Text style={{ fontSize: 13, color: '#666', marginTop: 15, textAlign: 'center', lineHeight: 20 }}>
            Make sure the quiz data for "{level.id}" is seeded in the database.
          </Text>
          <TouchableOpacity 
            onPress={fetchQuizQuestions} 
            style={{ marginTop: 30, backgroundColor: '#0A7D4F', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Retry Fetch</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#666', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <Text style={{ fontSize: 18, color: '#0A7D4F', fontWeight: 'bold', textAlign: 'center' }}>No questions available for this level yet.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#0A7D4F', fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (showResult) {
    const percentage = (score / quizQuestions.length) * 100;
    const passed = percentage >= QUIZ_PASS_THRESHOLD;
    return (
      <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
        <SafeAreaView style={styles.container}>

          {/* Gamified Coin Celebration Overlay */}
          <CoinRewardOverlay
            visible={showCoinOverlay}
            coins={quizCoinsEarned}
            message={passed
              ? percentage === 100 ? '🌟 Perfect Score! Massive Bonus!' : '✅ Quiz Passed!'
              : '💪 Keep trying! Consolation coins awarded.'}
            onDismiss={() => setShowCoinOverlay(false)}
          />

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

          <TouchableOpacity 
            onPress={handleNext} 
            activeOpacity={0.8}
            disabled={submitting}
          >
            <LinearGradient
              colors={submitting ? ['#88cbb0', '#88cbb0'] : ['#0A7D4F', '#15B872']}
              style={styles.nextButton}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {currentQuestion + 1 === quizQuestions.length ? 'Finish' : 'Next'}
                </Text>
              )}
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
    borderColor: '#E8F5E9',
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
