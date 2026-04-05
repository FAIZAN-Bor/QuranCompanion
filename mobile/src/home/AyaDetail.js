import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Animated, Easing } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import progressService from '../services/progressService';
import mistakeService from '../services/mistakeService';
import { analyzeRecitation } from '../services/recitationService';
import useAudioRecorder from '../hooks/useAudioRecorder';

const AyaDetail = ({ route }) => {
  const { data, surahId, surahName } = route.params;
  const navigation = useNavigation();
  const currentArabic = data?.arabic || data?.arabicText || data?.text || '';
  const currentEnglish = data?.english || data?.translation || data?.transliteration || data?.description || '';
  
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
  const referenceAudioUrl = data?.audioUrl || data?.referenceAudioUrl || '';

  const handlePlayReferenceAudio = () => {
    if (!referenceAudioUrl) {
      Alert.alert('Audio Not Available', 'Reference audio is not available for this ayah.');
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
      setAnalysisResult(null);
      await startRecording();
    }
  };

  const handleAnalyze = async () => {
    if (!audioPath) {
      Alert.alert('Record First', 'Please record your recitation before analyzing.');
      return;
    }

    setAnalyzing(true);
    try {
      const groundTruth = currentArabic;
      const result = await analyzeRecitation(
        audioPath,
        groundTruth,
        'Quran',
        surahId || `surah_${data.surahNumber || 1}`,
        `ayah_${data.number}`,
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
      Alert.alert('Analyze First', 'Please record and analyze your recitation before submitting.');
      return;
    }

    const score = analysisResult.overallScore || 0;
    const requiredThreshold = 70;
    const canMarkDone = score >= requiredThreshold;

    setSubmitting(true);
    try {
      if (canMarkDone) {
        await progressService.updateLessonProgress({
          module: 'Quran',
          levelId: surahId || `surah_${data.surahNumber || 1}`,
          lessonId: `ayah_${data.number}`,
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
            module: 'Quran',
            levelId: surahId || `surah_${data.surahNumber || 1}`,
            lessonId: `ayah_${data.number}`,
            contentId: data._id || null,
            mistakeType: 'recitation',
            title: `Ayah ${data.number} Recitation`,
            description: `Recitation accuracy was ${score}% in ${surahName || 'Surah'}. Needs improvement in tajweed.`,
            severity: score < 60 ? 'major' : 'moderate'
          });
          setFailedAttemptsCount(0); // Reset after logging
        }
      }

      // Navigate to result screen with full analysis
      navigation.navigate('RecitationResult', {
        result: analysisResult,
        module: 'Quran',
        lessonNumber: 0,
        requiredThreshold,
        canMarkDone,
        title: surahName || 'Quran Practice',
        subtitle: `Ayah ${data.number}`,
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
        <Text style={styles.practiceTitle}>
          Recitation Practice for <Text style={styles.ayahHighlight}>Ayah {data.number}</Text>
        </Text>

        <LinearGradient
          colors={['#FFFFFF', '#E8F5E9']}
          style={styles.mainContainer}
        >
          {/* Quran Header Card */}
          <Animated.View style={{ transform: [{ scale: cardPressAnim }] }}>
            <View style={styles.topCard}>
              <TouchableOpacity
                style={styles.cardTapArea}
                activeOpacity={0.9}
                onPress={handlePlayReferenceAudio}
                onPressIn={() => animateCardPress(0.98)}
                onPressOut={() => animateCardPress(1)}
              >
                <Text style={styles.arabicHeader}>{currentArabic}</Text>
                <Text style={styles.translationHeader}>{currentEnglish}</Text>
              </TouchableOpacity>
            </View>
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

          {/* AI Feedback Section */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>
              {analyzing ? 'Analyzing...' : hasResult ? 'AI Tajweed Feedback' : 'AI Tajweed Feedback'}
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
                {/* Score breakdown */}
                <View style={styles.scoreBreakdown}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreItemLabel}>Text</Text>
                    <Text style={styles.scoreItemValue}>{analysisResult.accuracyScore || 0}%</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreItemLabel}>Pronunciation</Text>
                    <Text style={styles.scoreItemValue}>{analysisResult.pronunciationScore || 0}%</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreItemLabel}>Tajweed</Text>
                    <Text style={styles.scoreItemValue}>{analysisResult.tajweedScore || 0}%</Text>
                  </View>
                </View>
                {/* Tajweed rules highlights */}
                {analysisResult.tajweedAnalysis?.length > 0 && (
                  <View style={styles.tajweedHighlights}>
                    {analysisResult.tajweedAnalysis
                      .filter(r => r.score < 80)
                      .slice(0, 3)
                      .map((rule, i) => (
                        <View key={i} style={styles.tajweedRuleBadge}>
                          <Text style={styles.tajweedRuleText}>{rule.rule}: {rule.score}%</Text>
                        </View>
                      ))}
                  </View>
                )}
                {/* Mistakes summary */}
                {analysisResult.mistakes?.length > 0 && (
                  <View style={styles.mistakesSummary}>
                    <Text style={styles.mistakesTitle}>
                      {analysisResult.mistakes.length} mistake{analysisResult.mistakes.length > 1 ? 's' : ''} found
                    </Text>
                    {analysisResult.mistakes.slice(0, 2).map((m, i) => (
                      <Text key={i} style={styles.mistakeItem}>
                        • {m.suggestion || `${m.type}: "${m.word}"`}
                      </Text>
                    ))}
                  </View>
                )}
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

          {/* Timer */}
          <Text style={styles.timerText}>
            {isRecording 
              ? `Recording: ${recordingTime}` 
              : (audioPath ? (isPlaying ? `Playing: ${playbackTime}` : 'Audio Recorded') : 'Press mic to start')
            }
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Left Button */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={hasResult ? handleRetry : (audioPath && !isRecording ? (isPlaying ? stopPlayback : playRecording) : handleToggleRecording)}
              disabled={analyzing}
            >
              <LinearGradient
                colors={hasResult ? ['#FFA726', '#F57C00'] : (isRecording ? ['#E53935', '#D32F2F'] : ['#0A7D4F', '#15B872'])}
                style={styles.smallButton}
              >
                <Text style={styles.smallBtnText}>
                  {hasResult ? 'Retry' : (isRecording ? 'Stop' : (isPlaying ? 'Stop' : (audioPath ? 'Play' : 'Rec')))}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Big Mic Button */}
            <TouchableOpacity 
              style={styles.bigMic} 
              activeOpacity={0.8}
              onPress={isRecording ? stopRecording : (hasResult ? handleRetry : startRecording)}
              disabled={analyzing}
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

            {/* Right Button: Analyze or Submit */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={hasResult ? handleSubmit : handleAnalyze}
              disabled={submitting || analyzing || (!audioPath && !hasResult)}
            >
              <LinearGradient
                colors={(!audioPath && !hasResult) ? ['#BDBDBD', '#9E9E9E'] : ['#0A7D4F', '#15B872']}
                style={styles.smallButton}
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

export default AyaDetail;


const styles = StyleSheet.create({

  screen: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  practiceTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
    marginTop: 10,
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

  topCard: {
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
  },
  cardTapArea: {
    width: '100%',
    alignItems: 'center',
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

  // Analysis states
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

  tajweedHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },

  tajweedRuleBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  tajweedRuleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E65100',
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
  hiddenAudioPlayer: {
    width: 0,
    height: 0,
  },
});

