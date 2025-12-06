import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import progressService from '../services/progressService';
import mistakeService from '../services/mistakeService';

const QuidaDetail = ({ route }) => {
  const { data, levelId } = route.params;
  const navigation = useNavigation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [tajweedScore, setTajweedScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const timerRef = useRef(null);
  
  console.log(data);

  useEffect(() => {
    // Start practice timer
    timerRef.current = setInterval(() => {
      setPracticeTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate AI tajweed analysis
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60;
      setTajweedScore(score);
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (tajweedScore === 0) {
      Alert.alert('Record First', 'Please record your pronunciation before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // Update lesson progress
      const progressResponse = await progressService.updateLessonProgress({
        module: 'Qaida',
        levelId: levelId || `qaida_level_${data.levelNumber || 1}`,
        lessonId: `character_${data.number}`,
        contentId: data._id || null,
        status: 'completed',
        completionPercentage: 100,
        timeSpent: practiceTime,
        accuracy: tajweedScore
      });

      console.log('Progress updated:', progressResponse);

      // If accuracy is below threshold, log a mistake
      if (tajweedScore < 80) {
        await mistakeService.logMistake({
          module: 'Qaida',
          levelId: levelId || `qaida_level_${data.levelNumber || 1}`,
          lessonId: `character_${data.number}`,
          contentId: data._id || null,
          mistakeType: 'pronunciation',
          title: `${data.item?.arabic || 'Character'} Pronunciation`,
          description: `Pronunciation accuracy was ${tajweedScore}% for "${data.item?.english || 'character'}". Needs practice.`,
          severity: tajweedScore < 60 ? 'major' : 'moderate'
        });
      }

      Alert.alert(
        tajweedScore >= 80 ? '🎉 Excellent!' : '📝 Practice Complete',
        tajweedScore >= 80 
          ? `Great pronunciation! You scored ${tajweedScore}% accuracy and earned coins!`
          : `You scored ${tajweedScore}%. Keep practicing to perfect your pronunciation!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.screen}
    >
      <Text style={{ fontSize: 28, fontWeight: '900', color: '#0A7D4F', textAlign: 'center', marginBottom: 20, letterSpacing: 0.5 }}>
        Recitation Practice
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#666', textAlign: 'center', marginBottom: 20 }}>
        Character {data.number}
      </Text>

      {/* Main Rounded Container */}
      <LinearGradient
        colors={['#FFFFFF', '#E8F5E9']}
        style={styles.mainContainer}
      >

        {/* Quran Header Card */}
        <LinearGradient
          colors={['#FFF9C4', '#FFF59D']}
          style={styles.topCard}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <Text style={styles.arabicHeader}>{data.item.arabic}</Text>
          <Text style={styles.translationHeader}>{data.item.english}</Text>
        </LinearGradient>

        {/* Tajweed Feedback Section */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>AI Pronunciation Feedback</Text>
          <Text style={styles.scoreText}>{tajweedScore > 0 ? `${tajweedScore}%` : 'Start recording...'}</Text>

          {/* Feedback Bar */}
          <View style={styles.feedbackBar}>
            <View style={[styles.progressFill, { width: `${tajweedScore}%` }]}></View>
          </View>
        </View>

        {/* ECG Wave */}
        <Image 
          source={require('../assests/ecg.png')} 
          style={[styles.ecg, isRecording && styles.ecgActive]}
          resizeMode="contain"
        />

        {/* Practice Time */}
        <Text style={styles.timerText}>
          Practice Time: {Math.floor(practiceTime / 60)}:{(practiceTime % 60).toString().padStart(2, '0')}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          
          {/* Stop Button */}
          <TouchableOpacity activeOpacity={0.8} onPress={handleStopRecording} disabled={!isRecording}>
            <LinearGradient
              colors={isRecording ? ['#E53935', '#D32F2F'] : ['#BDBDBD', '#9E9E9E']}
              style={styles.smallButton}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.smallBtnText}>Stop</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Big Mic Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
          >
            <LinearGradient
              colors={isRecording ? ['#E53935', '#D32F2F', '#C62828'] : ['#0A7D4F', '#0F9D63', '#15B872']}
              style={styles.bigMic}
            >
              <Image 
                source={require('../assests/mic.png')} 
                style={styles.bigMicIcon} 
              />
              {isRecording && <Text style={styles.recordingText}>Recording...</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit} disabled={submitting}>
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={styles.smallButton}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.smallBtnText}>Submit</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </LinearGradient>
    </LinearGradient>
  );
};

export default QuidaDetail;


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  mainContainer: {
    borderRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#0A7D4F',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },

  // -----------------
  // TOP CARD
  // -----------------
  topCard: {
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 6,
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  arabicHeader: {
    fontSize: 40,
    color: '#D84315',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '900',
  },

  translationHeader: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },

  // -----------------
  // FEEDBACK SECTION
  // -----------------
  feedbackContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    elevation: 6,
    marginBottom: 25,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 8,
    textAlign: 'center',
  },

  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 10,
  },

  feedbackBar: {
    height: 12,
    width: '100%',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    justifyContent: 'center',
  },

  progressFill: {
    height: 12,
    backgroundColor: '#0A7D4F',
    borderRadius: 10,
  },

  // ECG SECTION
  ecg: {
    width: '100%',
    height: 80,
    marginBottom: 10,
    tintColor: '#0A7D4F',
    opacity: 0.7,
  },

  ecgActive: {
    tintColor: '#E53935',
    opacity: 1,
  },

  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },

  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },

  // -----------------
  // ACTION BUTTONS
  // -----------------
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallButton: {
    width: 80,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  audioButton: {
    width: 90,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    flexDirection: 'row',
    gap: 5,
  },

  smallBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // BIG MIC BUTTON
  bigMic: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A7D4F',
    shadowRadius: 12,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  bigMicIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },

});

