import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import progressService from '../services/progressService';
import mistakeService from '../services/mistakeService';

const AyaDetail = ({ route }) => {
  const { data, surahId, surahName } = route.params;
  const navigation = useNavigation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [tajweedScore, setTajweedScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const timerRef = useRef(null);

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
    // Simulate AI tajweed analysis (in production, this would be actual AI)
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // Random score 60-100
      setTajweedScore(score);
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (tajweedScore === 0) {
      Alert.alert('Record First', 'Please record your recitation before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // Update lesson progress
      const progressResponse = await progressService.updateLessonProgress({
        module: 'Quran',
        levelId: surahId || `surah_${data.surahNumber || 1}`,
        lessonId: `ayah_${data.number}`,
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
          module: 'Quran',
          levelId: surahId || `surah_${data.surahNumber || 1}`,
          lessonId: `ayah_${data.number}`,
          contentId: data._id || null,
          mistakeType: 'recitation',
          title: `Ayah ${data.number} Recitation`,
          description: `Recitation accuracy was ${tajweedScore}% in ${surahName || 'Surah'}. Needs improvement in tajweed.`,
          severity: tajweedScore < 60 ? 'major' : 'moderate'
        });
      }

      Alert.alert(
        tajweedScore >= 80 ? '🎉 Excellent!' : '📝 Practice Complete',
        tajweedScore >= 80 
          ? `Great recitation! You scored ${tajweedScore}% accuracy and earned coins!`
          : `You scored ${tajweedScore}%. Keep practicing to improve your tajweed!`,
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
      <Text style={styles.practiceTitle}>
        Recitation Practice for <Text style={styles.ayahHighlight}>Ayah {data.number}</Text>
      </Text>

      {/* Main Rounded Container */}
      <LinearGradient
        colors={['#FFFFFF', '#E8F5E9']}
        style={styles.mainContainer}
      >

        {/* Quran Header Card */}
        <View style={styles.topCard}>
          <Text style={styles.arabicHeader}>{data.arabic}</Text>
          <Text style={styles.translationHeader}>{data.english}</Text>
        </View>

        {/* Tajweed Feedback Section */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>AI Tajweed Feedback</Text>
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
            >
              <Text style={styles.smallBtnText}>Stop</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Big Mic Button */}
          <TouchableOpacity 
            style={styles.bigMic} 
            activeOpacity={0.8}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
          >
            <LinearGradient
              colors={isRecording ? ['#E53935', '#D32F2F'] : ['#0A7D4F', '#15B872']}
              style={styles.bigMicGradient}
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

export default AyaDetail;


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  practiceTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  ayahHighlight: {
    color: '#F57F17',
  },

  mainContainer: {
    borderRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 25,
    elevation: 15,
    shadowColor: '#0A7D4F',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
  },

  // -----------------
  // TOP CARD
  // -----------------
  topCard: {
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
  },

  arabicHeader: {
    fontSize: 28,
    color: '#2b624c',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    lineHeight: 42,
  },

  translationHeader: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
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
    height: 14,
    width: '100%',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    justifyContent: 'center',
  },

  progressFill: {
    height: 14,
    backgroundColor: '#0A7D4F',
    borderRadius: 10,
  },

  ecg: {
    width: '100%',
    height: 80,
    marginBottom: 15,
    tintColor: '#0A7D4F',
  },

  ecgActive: {
    tintColor: '#E53935',
  },

  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },

  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  smallBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },

  bigMic: {
    borderRadius: 70,
    overflow: 'hidden',
    elevation: 12,
  },

  bigMicGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bigMicIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },

});

