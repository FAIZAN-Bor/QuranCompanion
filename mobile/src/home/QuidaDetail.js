import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Animated, Easing } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import progressService from '../services/progressService';
import mistakeService from '../services/mistakeService';
import { analyzeRecitation } from '../services/recitationService';
import useAudioRecorder from '../hooks/useAudioRecorder';

const QuidaDetail = ({ route }) => {
  const { data, levelId, takhtiNumber } = route.params;
  const navigation = useNavigation();
  
  const {
    isRecording,
    recordingTime,
    recordingSeconds,
    audioPath,
    isPlaying,
    playbackTime,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    resetRecording,
  } = useAudioRecorder();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState(0);
  const timerRef = useRef(null);
  const cardPressAnim = useRef(new Animated.Value(1)).current;
  const referencePlayerRef = useRef(null);
  const [playReferenceAudio, setPlayReferenceAudio] = useState(false);
  const [referenceAudioInstance, setReferenceAudioInstance] = useState(0);

  const normalizeArabicText = (value) => {
    if (typeof value !== 'string') return '';
    return value
      .normalize('NFC')
      .replace(/\u200E|\u200F|\u061C/g, '')
      .replace(/\u0651\u0650/g, '\u0650\u0651')
      .replace(/\u0651\u064F/g, '\u064F\u0651')
      .replace(/\u0651\u064E/g, '\u064E\u0651')
      .replace(/\u0651\u064D/g, '\u064D\u0651')
      .replace(/\u0651\u064C/g, '\u064C\u0651')
      .replace(/\u0651\u064B/g, '\u064B\u0651');
  };

  const currentArabicText = normalizeArabicText(data?.item?.arabicText || data?.item?.arabic || data?.arabicText || data?.arabic || '');
  const currentMeaningText = data?.item?.english || data?.item?.transliteration || data?.english || data?.transliteration || '';
  const referenceAudioUrl = data?.item?.audioUrl || data?.audioUrl || '';
  const parseLessonFromLevelId = (value) => {
    const m = `${value || ''}`.match(/(\d+)/);
    return m ? Number(m[1]) : null;
  };
  const lessonNumber = Number(takhtiNumber)
    || Number(data?.levelNumber)
    || Number(data?.lessonNumber)
    || parseLessonFromLevelId(levelId)
    || 1;

  const getQaidaThreshold = (lessonNo) => {
    if (lessonNo >= 1 && lessonNo <= 6) return 80;
    return 70;
  };

  const handlePlayReferenceAudio = () => {
    if (!referenceAudioUrl) {
      Alert.alert('Audio Not Available', 'Reference audio is not available for this word.');
      return;
    }

    referencePlayerRef.current?.seek?.(0);
    setReferenceAudioInstance((prev) => prev + 1);
    setPlayReferenceAudio(true);
  };

  const animateCardPress = (toValue) => {
    Animated.timing(cardPressAnim, {
      toValue,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPracticeTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      // Reset previous result if re-recording
      setAnalysisResult(null);
      await startRecording();
    }
  };

  const handleAnalyze = async () => {
    if (!audioPath) {
      Alert.alert('Record First', 'Please record your pronunciation before analyzing.');
      return;
    }

    setAnalyzing(true);
    try {
      const groundTruth = currentArabicText;
      const qaidaLevelId = levelId || `qaida_level_${data.levelNumber || data.lessonNumber || 1}`;
      const result = await analyzeRecitation(
        audioPath,
        groundTruth,
        'Qaida',
        qaidaLevelId,
        `character_${data.number}`,
        referenceAudioUrl
      );

      if (result?.success && result.data) {
        setAnalysisResult(result.data);
      } else {
        Alert.alert('Analysis Issue', 'Could not get analysis results. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Error', error.message || 'Failed to analyze. Please check your connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!analysisResult) {
      Alert.alert('Analyze First', 'Please record and analyze your pronunciation before submitting.');
      return;
    }

    const score = analysisResult.overallScore || 0;
    const requiredThreshold = getQaidaThreshold(lessonNumber);
    const canMarkDone = score >= requiredThreshold;

    setSubmitting(true);
    try {
      if (canMarkDone) {
        await progressService.updateLessonProgress({
          module: 'Qaida',
          levelId: levelId || `qaida_level_${lessonNumber}`,
          lessonId: `character_${data.number}`,
          contentId: data._id || null,
          status: 'completed',
          completionPercentage: 100,
          timeSpent: practiceTime,
          accuracy: score
        });
      }

      if (!canMarkDone) {
        const newFailCount = failedAttemptsCount + 1;
        setFailedAttemptsCount(newFailCount);
        
        if (newFailCount >= 5) {
          await mistakeService.logMistake({
            module: 'Qaida',
            levelId: levelId || `qaida_level_${lessonNumber}`,
            lessonId: `character_${data.number}`,
            contentId: data._id || null,
            mistakeType: 'pronunciation',
            title: `${currentArabicText || 'Character'} Pronunciation`,
            description: `Pronunciation accuracy was ${score}% for "${currentMeaningText || 'character'}". Needs practice.`,
            severity: score < 60 ? 'major' : 'moderate'
          });
          setFailedAttemptsCount(0); // Reset after logging
        }
      }

      // Navigate to result screen with full analysis
      navigation.navigate('RecitationResult', {
        result: analysisResult,
        module: 'Qaida',
        lessonNumber,
        requiredThreshold,
        canMarkDone,
        title: currentArabicText || 'Qaida Practice',
        subtitle: currentMeaningText || '',
      });
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnalysisResult(null);
    resetRecording();
  };

  const score = analysisResult?.overallScore || 0;
  const hasResult = analysisResult !== null;

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Recitation Practice</Text>
        <Text style={styles.screenSubtitle}>Character {data.number}</Text>

        <LinearGradient
          colors={['#FFFFFF', '#E8F5E9']}
          style={styles.mainContainer}
        >
          {/* Arabic Character Card */}
          <Animated.View style={{ transform: [{ scale: cardPressAnim }] }}>
            <LinearGradient
              colors={['#FFF9C4', '#FFF59D']}
              style={styles.topCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <TouchableOpacity
                style={styles.cardTapArea}
                activeOpacity={0.9}
                onPress={handlePlayReferenceAudio}
                onPressIn={() => animateCardPress(0.98)}
                onPressOut={() => animateCardPress(1)}
              >
                <Text style={styles.arabicHeader}>{currentArabicText || '...'}</Text>
                <Text style={styles.translationHeader}>{currentMeaningText}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {referenceAudioUrl ? (
            <Video
              key={`${referenceAudioUrl}_${referenceAudioInstance}`}
              ref={referencePlayerRef}
              source={{ uri: referenceAudioUrl }}
              audioOnly
              controls={false}
              paused={!playReferenceAudio}
              ignoreSilentSwitch="ignore"
              playInBackground={false}
              onEnd={() => {
                setPlayReferenceAudio(false);
              }}
              onError={() => {
                setPlayReferenceAudio(false);
                Alert.alert('Playback Error', 'Could not play reference audio.');
              }}
              style={styles.hiddenAudioPlayer}
            />
          ) : null}

          {/* Score / Feedback Section */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>
              {analyzing ? 'Analyzing...' : hasResult ? 'AI Feedback' : 'AI Pronunciation Feedback'}
            </Text>
            
            {analyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color="#0A7D4F" />
                <Text style={styles.analyzingText}>Analyzing your recitation...</Text>
                <Text style={styles.analyzingSubtext}>This may take a moment</Text>
              </View>
            ) : hasResult ? (
              <View>
                <Text style={[styles.scoreText, { color: score >= 80 ? '#0A7D4F' : score >= 60 ? '#FFA726' : '#E53935' }]}>
                  {score}%
                </Text>
                <View style={styles.feedbackBar}>
                  <View style={[styles.progressFill, { 
                    width: `${score}%`,
                    backgroundColor: score >= 80 ? '#0A7D4F' : score >= 60 ? '#FFA726' : '#E53935'
                  }]} />
                </View>
                {/* Mini score breakdown — only show relevant scores */}
                <View style={styles.scoreBreakdown}>
                  {lessonNumber >= 7 && (
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreItemLabel}>Text</Text>
                      <Text style={styles.scoreItemValue}>{analysisResult.accuracyScore || 0}%</Text>
                    </View>
                  )}
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreItemLabel}>Pronunciation</Text>
                    <Text style={styles.scoreItemValue}>{analysisResult.pronunciationScore || 0}%</Text>
                  </View>
                  {lessonNumber >= 4 && (
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreItemLabel}>Tajweed</Text>
                      <Text style={styles.scoreItemValue}>{analysisResult.tajweedScore || 0}%</Text>
                    </View>
                  )}
                </View>
                {/* Mistakes summary — filter out irrelevant mistakes for early Qaida lessons */}
                {(() => {
                  const allMistakes = analysisResult.mistakes || [];
                  // Text-based types from Whisper (irrelevant for isolated sounds)
                  const TEXT_TYPES = ['missing', 'substitution', 'insertion', 'mispronounced', 'extra', 'deletion'];
                  const relevantMistakes = allMistakes.filter(m => {
                    const type = (m.type || '').toLowerCase();
                    // Lessons 1-3: Exclude ALL text + tajweed mistakes (only pure pronunciation)
                    if (lessonNumber <= 3) return !TEXT_TYPES.includes(type) && type !== 'tajweed';
                    // Lessons 4-6: Exclude text mistakes (keep pronunciation + tajweed)
                    if (lessonNumber <= 6) return !TEXT_TYPES.includes(type);
                    return true;
                  });
                  return relevantMistakes.length > 0 ? (
                    <View style={styles.mistakesSummary}>
                      <Text style={styles.mistakesTitle}>
                        {relevantMistakes.length} mistake{relevantMistakes.length > 1 ? 's' : ''} found
                      </Text>
                      {relevantMistakes.slice(0, 2).map((m, i) => (
                        <Text key={i} style={styles.mistakeItem}>
                          • {m.suggestion || `${m.type}: "${m.word}"`}
                        </Text>
                      ))}
                    </View>
                  ) : null;
                })()}
              </View>
            ) : (
              <Text style={styles.scoreText}>
                {audioPath ? 'Ready to analyze' : 'Start recording...'}
              </Text>
            )}
          </View>

          {/* ECG Wave */}
          <Image 
            source={require('../assests/ecg.png')} 
            style={[styles.ecg, isRecording && styles.ecgActive]}
            resizeMode="contain"
          />

          {/* Timer / Recording status */}
          <Text style={styles.timerText}>
            {isRecording 
              ? `Recording: ${recordingTime}` 
              : (audioPath ? (isPlaying ? `Playing: ${playbackTime}` : 'Audio Recorded') : 'Press mic to start')
            }
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Left Button: Retry or Play */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={hasResult ? handleRetry : (audioPath && !isRecording ? (isPlaying ? stopPlayback : playRecording) : handleToggleRecording)}
              disabled={analyzing}
            >
              <LinearGradient
                colors={hasResult ? ['#FFA726', '#F57C00'] : (isRecording ? ['#E53935', '#D32F2F'] : ['#0A7D4F', '#15B872'])}
                style={styles.smallButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.smallBtnText}>
                  {hasResult ? 'Retry' : (isRecording ? 'Stop' : (isPlaying ? 'Stop' : (audioPath ? 'Play' : 'Rec')))}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Big Mic Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={isRecording ? stopRecording : (hasResult ? handleRetry : startRecording)}
              disabled={analyzing}
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

            {/* Right Button: Analyze or Submit */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={hasResult ? handleSubmit : handleAnalyze} 
              disabled={submitting || analyzing || (!audioPath && !hasResult)}
            >
              <LinearGradient
                colors={(!audioPath && !hasResult) ? ['#BDBDBD', '#9E9E9E'] : ['#0A7D4F', '#15B872']}
                style={styles.smallButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                {(submitting || analyzing) ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.smallBtnText}>{hasResult ? 'Result' : 'Check'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
};

export default QuidaDetail;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    marginTop: 10,
  },
  screenSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
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
  cardTapArea: {
    width: '100%',
    alignItems: 'center',
  },
  arabicHeader: {
    fontSize: 40,
    color: '#D84315',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '900',
    flexShrink: 1,
    writingDirection: 'rtl',
  },
  translationHeader: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
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
  hiddenAudioPlayer: {
    width: 0,
    height: 0,
  },
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
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A7D4F',
    marginTop: 12,
  },
  analyzingSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  scoreItemValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginTop: 2,
  },
  mistakesSummary: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
  },
  mistakesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E53935',
    marginBottom: 6,
  },
  mistakeItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
    lineHeight: 18,
  },
});

