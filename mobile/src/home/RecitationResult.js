import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import ScoreCircle from '../component/ScoreCircle';
import TajweedRuleItem from '../component/TajweedRuleItem';
import MistakeCard from '../component/MistakeCard';

const { width } = Dimensions.get('window');

const RecitationResult = ({ route, navigation }) => {
  const { result, module, title, subtitle } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGradeInfo = (score) => {
    if (score >= 90) return { grade: 'Excellent!', emoji: '🌟', color: '#0A7D4F' };
    if (score >= 80) return { grade: 'Great Job!', emoji: '✨', color: '#2E7D32' };
    if (score >= 70) return { grade: 'Good', emoji: '👍', color: '#558B2F' };
    if (score >= 60) return { grade: 'Keep Practicing', emoji: '📖', color: '#F57F17' };
    return { grade: 'Needs Work', emoji: '💪', color: '#E53935' };
  };

  const overallScore = result?.overallScore ?? 0;
  const gradeInfo = getGradeInfo(overallScore);

  const subScores = [
    { label: 'Text Accuracy', score: result?.accuracyScore ?? 0, icon: '📝' },
    { label: 'Pronunciation', score: result?.pronunciationScore ?? 0, icon: '🗣️' },
    { label: 'Tajweed', score: result?.tajweedScore ?? 0, icon: '📖' },
  ];

  const getScoreColor = (s) => {
    if (s >= 80) return '#0A7D4F';
    if (s >= 60) return '#FFA726';
    return '#E53935';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4FFF5" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.moduleTag}>{module}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </Animated.View>

        {/* Main Score Card */}
        <Animated.View
          style={[
            styles.mainScoreCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.gradeEmoji}>{gradeInfo.emoji}</Text>
          <Text style={[styles.gradeText, { color: gradeInfo.color }]}>
            {gradeInfo.grade}
          </Text>
          <View style={styles.scoreCircleContainer}>
            <ScoreCircle score={overallScore} size={160} strokeWidth={14} label="Overall" />
          </View>
          {result?.processingTime && (
            <Text style={styles.processingTime}>
              Analyzed in {(result.processingTime / 1000).toFixed(1)}s
            </Text>
          )}
        </Animated.View>

        {/* Sub-Scores */}
        <View style={styles.subScoresRow}>
          {subScores.map((item, idx) => (
            <View key={idx} style={styles.subScoreCard}>
              <Text style={styles.subScoreIcon}>{item.icon}</Text>
              <Text style={[styles.subScoreValue, { color: getScoreColor(item.score) }]}>
                {item.score}%
              </Text>
              <Text style={styles.subScoreLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Text Comparison */}
        {(result?.recognizedText || result?.groundTruth) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Text Comparison</Text>
            <View style={styles.comparisonBox}>
              <View style={styles.compItem}>
                <Text style={styles.compLabel}>Expected</Text>
                <Text style={styles.compArabic}>{result.groundTruth || '—'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.compItem}>
                <Text style={[styles.compLabel, { color: getScoreColor(result.accuracyScore) }]}>
                  Recognized
                </Text>
                <Text style={[styles.compArabic, { color: '#333' }]}>
                  {result.recognizedText || '—'}
                </Text>
              </View>
            </View>
            {result?.wordErrorRate != null && (
              <Text style={styles.werText}>
                Word Error Rate: {result.wordErrorRate}%
              </Text>
            )}
          </View>
        )}

        {/* Tajweed Rules */}
        {result?.tajweedAnalysis && result.tajweedAnalysis.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tajweed Rules</Text>
            <Text style={styles.sectionSubtitle}>
              Score breakdown for each tajweed rule
            </Text>
            {result.tajweedAnalysis.map((item, idx) => (
              <TajweedRuleItem key={idx} rule={item.rule} score={item.score} />
            ))}
          </View>
        )}

        {/* Mistakes */}
        {result?.mistakes && result.mistakes.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.mistakeHeader}>
              <Text style={styles.sectionTitle}>Mistakes Found</Text>
              <View style={styles.mistakeCountBadge}>
                <Text style={styles.mistakeCountText}>{result.mistakes.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Review and practice these areas to improve
            </Text>
            {result.mistakes.map((mistake, idx) => (
              <MistakeCard key={idx} mistake={mistake} index={idx} />
            ))}
          </View>
        )}

        {/* No Mistakes Message */}
        {(!result?.mistakes || result.mistakes.length === 0) && overallScore >= 80 && (
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>No mistakes found!</Text>
            <Text style={styles.successSubtitle}>
              Your recitation was accurate. Keep up the great work!
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Practice Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              // Go back to the module list
              if (module === 'Qaida') {
                navigation.navigate('QuidaTaqkti');
              } else if (module === 'Quran') {
                navigation.navigate('AllAya');
              } else {
                navigation.navigate('BottomTabNavigator');
              }
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FFF5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  moduleTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A7D4F',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  mainScoreCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradeEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  scoreCircleContainer: {
    marginVertical: 8,
  },
  processingTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
  },
  subScoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  subScoreCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  subScoreIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  subScoreValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  subScoreLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 14,
  },
  comparisonBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  compItem: {
    paddingVertical: 8,
  },
  compLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A7D4F',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compArabic: {
    fontSize: 22,
    color: '#1A1A2E',
    textAlign: 'right',
    fontWeight: '600',
    lineHeight: 34,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  werText: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  mistakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  mistakeCountBadge: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  mistakeCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0A7D4F',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A7D4F',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#0A7D4F',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default RecitationResult;
