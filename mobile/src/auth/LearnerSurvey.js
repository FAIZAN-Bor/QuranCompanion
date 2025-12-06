// LearnerSurvey.js - Assessment Survey for Learner's Arabic Proficiency

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { surveyQuestions, calculateProficiencyLevel, getSections } from '../assests/data/surveyData';
import userService from '../services/userService';

const LearnerSurvey = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherGoalText, setOtherGoalText] = useState('');
  const [progress] = useState(new Animated.Value(0));
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null); // { level, description }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const totalQuestions = surveyQuestions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Update progress bar animation
  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: progressPercentage,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex]);

  const handleSelectOption = (questionId, optionValue) => {
    setAnswers({
      ...answers,
      [questionId]: optionValue
    });
  };

  const handleNext = () => {
    const currentQ = surveyQuestions[currentQuestionIndex];
    
    // Check if required question is answered
    if (currentQ.required && !answers[currentQ.id]) {
      setErrorMessage('Please select an option to continue.');
      return;
    }

    // Handle "Other" option for goals
    if (currentQ.id === 'q11' && answers[currentQ.id] === 'other' && !otherGoalText.trim()) {
      setErrorMessage('Please specify your goal.');
      return;
    }

    // Save "Other" text if applicable
    if (currentQ.id === 'q11' && answers[currentQ.id] === 'other') {
      setAnswers({
        ...answers,
        q11_other: otherGoalText
      });
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setErrorMessage('');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    if (!currentQuestion.required) {
      if (currentQuestionIndex < totalQuestions - 1) {
        setErrorMessage('');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const proficiency = calculateProficiencyLevel(answers);
      
      // Prepare survey data for backend
      const surveyData = {
        answers: Object.fromEntries(Object.entries(answers)),
        proficiencyLevel: proficiency.level,
        // Calculate section scores based on questions
        sectionScores: {
          readingAbility: 0,
          pronunciationAbility: 0,
          wordSentenceReading: 0,
          previousExperience: 0,
          comprehension: 0
        },
        totalScore: Object.keys(answers).length
      };

      // Submit to backend
      const response = await userService.submitSurvey(surveyData);
      
      setResult(proficiency);
      
      // After showing result, navigate to Progress Map
      setTimeout(() => {
        navigation.replace('BottomTabNavigator', { 
          initialRouteName: 'Progress Map'
        });
      }, 3000);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit survey');
      setIsSubmitting(false);
    }
  };

  const renderOption = (option) => {
    const isSelected = answers[currentQuestion.id] === option.value;

    return (
      <TouchableOpacity
        key={option.value}
        style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
        onPress={() => handleSelectOption(currentQuestion.id, option.value)}
        activeOpacity={0.7}
      >
        <View style={styles.radioOuter}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']} style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learner Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Let's understand your Arabic learning level
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </View>

        {/* Question Section or Result */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {result ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Assessment Complete 🎉</Text>
              <Text style={styles.resultLevel}>Your Level: {result.level}</Text>
              <Text style={styles.resultDescription}>{result.description}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.reset({ index: 0, routes: [{ name: 'BottomTabNavigator' }] })
                }
                activeOpacity={0.85}
                style={styles.gradientButtonWrapper}
              >
                <LinearGradient
                  colors={['#0A7D4F', '#0F9D63', '#15B872']}
                  style={[styles.primaryButton, { marginTop: 16 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Section Header */}
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {currentQuestion.section}
                </Text>
              </View>

              {/* Question */}
              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option) => renderOption(option))}
              </View>

              {/* Inline validation message */}
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Other Goal Input */}
              {currentQuestion.id === 'q11' && answers[currentQuestion.id] === 'other' && (
                <TextInput
                  style={styles.otherInput}
                  placeholder="Please specify your goal..."
                  placeholderTextColor="#999"
                  value={otherGoalText}
                  onChangeText={setOtherGoalText}
                  multiline
                />
              )}

              {/* Optional Badge */}
              {!currentQuestion.required && (
                <Text style={styles.optionalBadge}>Optional</Text>
              )}
            </>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        {!result && (
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {/* Previous Button */}
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePrevious}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {/* Skip Button (for optional questions) */}
            {!currentQuestion.required && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            )}

            {/* Next/Submit Button */}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              style={styles.gradientButtonWrapper}
            >
              <LinearGradient
                colors={['#0A7D4F', '#0F9D63', '#15B872']}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>
                  {currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0F9D63',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionBadge: {
    backgroundColor: '#0A7D4F',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  sectionBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 25,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  optionButtonSelected: {
    borderColor: '#0F9D63',
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
    backgroundColor: '#0F9D63',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#0A7D4F',
    fontWeight: '600',
  },
  otherInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0F9D63',
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionalBadge: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  gradientButtonWrapper: {
    flex: 1,
  },
  primaryButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F9D63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#0F9D63',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FDECEC',
    borderColor: '#E53935',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  errorBannerText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultLevel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LearnerSurvey;
