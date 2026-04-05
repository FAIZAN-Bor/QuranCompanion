import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import mistakeService from '../services/mistakeService';
import contentService from '../services/contentService';
import useAudioRecorder from '../hooks/useAudioRecorder';

export default function MistakePractice({ route, navigation }) {
  const { mistake } = route.params;
  
  const {
    isRecording,
    recordingTime,
    recordingSeconds,
    audioPath,
    isPlaying,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    playRecording,
    stopPlayback,
  } = useAudioRecorder();

  const [submitting, setSubmitting] = useState(false);
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  
  // Animation for recording indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation while recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigate to the actual lesson screen for practice
  const navigateToLesson = async () => {
    const module = mistake.module?.toLowerCase();
    
    if (module === 'quran') {
      const ayahNumber = extractAyahNumber(mistake.lessonId);
      let quranContent = null;

      try {
        if (mistake.contentId) {
          const byId = await contentService.getContentById(mistake.contentId);
          quranContent = byId?.data?.content || null;
        }

        if (!quranContent && isMongoId(mistake.levelId)) {
          const byLevelId = await contentService.getContentById(mistake.levelId);
          quranContent = byLevelId?.data?.content || null;
        }

        if (!quranContent) {
          const surahNumber = extractSurahNumber(mistake.levelId);
          if (surahNumber) {
            const byNumber = await contentService.getContentByNumber('Quran', surahNumber);
            quranContent = byNumber?.data?.content || null;
          }
        }
      } catch (error) {
        console.warn('Failed to resolve Quran content for mistake practice:', error?.message || error);
      }

      const verses = Array.isArray(quranContent?.ayahs)
        ? quranContent.ayahs
        : (Array.isArray(quranContent?.verses) ? quranContent.verses : []);
      const matchedAyah = verses.find((v) => (v?.number ?? v?.verseNumber) === ayahNumber) || null;

      // Navigate to AyaDetail with practice content from mistake
      const practiceData = {
        number: ayahNumber,
        _id: quranContent?._id || mistake.contentId || null,
        surahNumber: quranContent?.number || extractSurahNumber(mistake.levelId) || 1,
        arabic: matchedAyah?.arabic || matchedAyah?.arabicText || getArabicFromDescription(mistake.description),
        english: matchedAyah?.english || matchedAyah?.translation || matchedAyah?.transliteration || mistake.description || '',
        audioUrl: matchedAyah?.audioUrl || quranContent?.audioUrl || mistake.audioUrl || null,
        // Additional data for practice mode
        isPracticeMode: true,
        mistakeId: mistake._id,
        originalMistake: mistake
      };
      
      navigation.navigate('AyaDetail', {
        data: practiceData,
        surahId: quranContent?._id || mistake.levelId,
        surahName: quranContent?.name || formatSurahName(mistake.levelId)
      });
    } else if (module === 'qaida') {
      // Navigate to QuidaDetail with practice content from mistake
      const practiceData = {
        number: extractCharacterNumber(mistake.lessonId),
        _id: mistake.contentId,
        item: {
          arabic: getArabicFromDescription(mistake.description),
          english: mistake.title
        },
        // Additional data for practice mode
        isPracticeMode: true,
        mistakeId: mistake._id,
        originalMistake: mistake
      };
      
      navigation.navigate('QuidaDetail', {
        data: practiceData,
        levelId: mistake.levelId
      });
    } else {
      // Fallback - show quick practice here
      Alert.alert(
        'Practice',
        `Practice for ${mistake.module} module. Read the content below and self-assess.`
      );
    }
  };

  // Helper to extract ayah number from lessonId like "ayah_5"
  const extractAyahNumber = (lessonId) => {
    if (!lessonId) return 1;
    const match = lessonId.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  const extractSurahNumber = (levelId) => {
    if (!levelId) return null;
    const match = String(levelId).match(/surah_(\d+)/i);
    return match ? parseInt(match[1]) : null;
  };

  const isMongoId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

  const formatSurahName = (levelId) => {
    const surahNumber = extractSurahNumber(levelId);
    if (surahNumber) return `Surah ${surahNumber}`;
    return 'Practice';
  };

  // Helper to extract character number from lessonId like "character_3"
  const extractCharacterNumber = (lessonId) => {
    if (!lessonId) return 1;
    const match = lessonId.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  // Helper to extract Arabic text from description
  const getArabicFromDescription = (description) => {
    // Try to extract quoted text or return a placeholder
    const match = description?.match(/"([^"]+)"/);
    return match ? match[1] : 'ا';
  };

  const startRecording = async () => {
    setFeedback(null);
    await startAudioRecording();
  };

  const stopRecording = async () => {
    await stopAudioRecording();
  };

  const submitPractice = async (isCorrect) => {
    setSubmitting(true);
    try {
      const response = await mistakeService.submitPracticeAttempt(mistake._id, {
        isCorrect: isCorrect,
        attemptNumber: practiceAttempts + 1,
        practiceTime: recordingSeconds
      });

      setPracticeAttempts(prev => prev + 1);

      if (response.success) {
        if (isCorrect || response.data?.autoResolved) {
          setFeedback({
            type: 'success',
            title: '🎉 Excellent!',
            message: 'Your pronunciation was correct! This mistake has been resolved.'
          });
          
          // Navigate back after showing success
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        } else {
          setFeedback({
            type: 'info',
            title: '📝 Practice Recorded',
            message: 'Keep practicing! Your attempt has been logged.'
          });
        }
      } else {
        setFeedback({
          type: 'error',
          title: 'Error',
          message: response.message || 'Failed to submit practice'
        });
      }
    } catch (error) {
      console.error('Submit practice error:', error);
      Alert.alert('Error', 'Failed to submit practice attempt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelfAssessment = (isCorrect) => {
    Alert.alert(
      isCorrect ? 'Mark as Correct?' : 'Need More Practice?',
      isCorrect 
        ? 'Are you confident that you pronounced it correctly? This will resolve the mistake.'
        : 'Your practice attempt will be logged. Keep practicing!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isCorrect ? 'Yes, Resolved!' : 'Log Practice', 
          onPress: () => submitPractice(isCorrect)
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Practice Mistake</Text>
        </View>

        {/* Mistake Details */}
        <LinearGradient
          colors={['#FFFFFF', '#F1F8E9']}
          style={styles.mistakeCard}
        >
          <Text style={styles.mistakeTitle}>{mistake.title || `${mistake.module} Mistake`}</Text>
          <Text style={styles.mistakeDescription}>{mistake.description}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{mistake.module}</Text>
            </View>
            <View style={[styles.badge, styles.typeBadge]}>
              <Text style={styles.badgeText}>{mistake.mistakeType?.replace('_', ' ')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📖 How to Practice:</Text>
          <Text style={styles.instructionsText}>
            1. Go to the lesson to practice with the full recitation experience{'\n'}
            2. Or use quick practice below to record and self-assess
          </Text>
        </View>

        {/* Go to Lesson Button - Primary Action */}
        <TouchableOpacity onPress={navigateToLesson} style={styles.goToLessonBtn}>
          <LinearGradient
            colors={['#1976D2', '#42A5F5']}
            style={styles.goToLessonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Text style={styles.goToLessonIcon}>📚</Text>
            <View style={styles.goToLessonTextContainer}>
              <Text style={styles.goToLessonText}>Go to {mistake.module} Lesson</Text>
              <Text style={styles.goToLessonSubtext}>Practice with full recitation experience</Text>
            </View>
            <Text style={styles.goToLessonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR Quick Practice</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Original Audio (if available) */}
        {mistake.audioUrl && (
          <TouchableOpacity style={styles.originalAudioBtn}>
            <LinearGradient
              colors={['#FF9800', '#FFB74D']}
              style={styles.originalAudioGradient}
            >
              <Text style={styles.originalAudioText}>🔊 Listen to Correct Pronunciation</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Recording Section */}
        <View style={styles.recordingSection}>
          <Text style={styles.recordingLabel}>Your Recitation</Text>
          
          {/* Record Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <LinearGradient
                colors={isRecording ? ['#F44336', '#EF5350'] : ['#0A7D4F', '#15B872']}
                style={styles.recordButtonGradient}
              >
                {isRecording ? (
                  <View style={styles.recordingBadge}>
                    <Text style={styles.recordingBadgeText}>STOP</Text>
                  </View>
                ) : (
                  <Image
                    source={require('../assests/mic.png')}
                    style={styles.recordButtonIconImage}
                  />
                )}
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Stop Recording' : (audioPath ? 'Record Again' : 'Start Recording')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Recording Time */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>{recordingTime}</Text>
            </View>
          )}

          {/* Recorded actions */}
          {audioPath && !isRecording && (
            <View style={styles.recordedConfirmation}>
              <Text style={styles.recordedText}>Recording Complete</Text>
              <View style={styles.postRecordActions}>
                <TouchableOpacity onPress={isPlaying ? stopPlayback : playRecording} style={styles.playBtn}>
                  <Text style={styles.playBtnText}>{isPlaying ? 'Stop' : 'Play'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Feedback Display */}
        {feedback && (
          <View style={[
            styles.feedbackCard,
            feedback.type === 'success' && styles.feedbackSuccess,
            feedback.type === 'error' && styles.feedbackError
          ]}>
            <Text style={styles.feedbackTitle}>{feedback.title}</Text>
            <Text style={styles.feedbackMessage}>{feedback.message}</Text>
          </View>
        )}

        {/* Self Assessment Buttons */}
        {audioPath && !isRecording && (
          <View style={styles.assessmentSection}>
            <Text style={styles.assessmentLabel}>Or self-assess your recitation:</Text>
            
            <View style={styles.assessmentButtons}>
              <TouchableOpacity
                style={styles.assessmentButton}
                onPress={() => handleSelfAssessment(true)}
                disabled={submitting}
              >
                <LinearGradient
                  colors={['#0A7D4F', '#15B872']}
                  style={styles.assessmentGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.assessmentIcon}>✓</Text>
                      <Text style={styles.assessmentText}>I Got It Right!</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.assessmentButton}
                onPress={() => handleSelfAssessment(false)}
                disabled={submitting}
              >
                <LinearGradient
                  colors={['#FF9800', '#FFB74D']}
                  style={styles.assessmentGradient}
                >
                  <Text style={styles.assessmentIcon}>↻</Text>
                  <Text style={styles.assessmentText}>Need Practice</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Practice Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Practice Stats</Text>
          <Text style={styles.statsText}>Attempts this session: {practiceAttempts}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#0A7D4F',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A7D4F',
    marginLeft: 10,
  },
  mistakeCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mistakeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  mistakeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadge: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A7D4F',
    textTransform: 'capitalize',
  },
  instructionsCard: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 22,
  },
  originalAudioBtn: {
    marginBottom: 15,
  },
  originalAudioGradient: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  originalAudioText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  recordingSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: 'transparent',
  },
  recordingActive: {
    borderWidth: 3,
    borderColor: '#F44336',
  },
  recordButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonIconImage: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
    tintColor: '#fff',
    marginBottom: 5,
  },
  recordingBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
  },
  recordingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
  },
  recordedConfirmation: {
    marginTop: 20,
    alignItems: 'center',
  },
  recordedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A7D4F',
    marginBottom: 5,
  },
  rerecordText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  feedbackCard: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 15,
    backgroundColor: '#E3F2FD',
  },
  feedbackSuccess: {
    backgroundColor: '#E8F5E9',
  },
  feedbackError: {
    backgroundColor: '#FFEBEE',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#666',
  },
  assessmentSection: {
    marginTop: 20,
  },
  assessmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  assessmentButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  assessmentButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  assessmentGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  assessmentIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  assessmentText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  statsText: {
    fontSize: 13,
    color: '#666',
  },
  // Go to Lesson Button Styles
  goToLessonBtn: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  goToLessonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  goToLessonIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  goToLessonTextContainer: {
    flex: 1,
  },
  goToLessonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  goToLessonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  goToLessonArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  // Post-record actions
  postRecordActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  playBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  playBtnText: {
    color: '#0A7D4F',
    fontWeight: '700',
    fontSize: 14,
  },
});
