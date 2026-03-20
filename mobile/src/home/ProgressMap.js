// ProgressMap.js - Gamified Learning Path Screen with Islamic Aesthetic

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import contentService from '../services/contentService';
import progressService from '../services/progressService';

const { width: screenWidth } = Dimensions.get('window');

const QAIDA_LEVEL_RANGE = [1, 2, 3, 4, 5, 6, 7];
const QAIDA_LEVEL_COLORS = ['#0A7D4F', '#0F9D63', '#15B872', '#62B26F', '#7ECB8A', '#9BA3AF', '#34B36E'];
const QURAN_LEVEL_COLORS = ['#14532D', '#166534', '#15803D', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC'];
const QURAN_LEVELS = [
  { levelNumber: 1, title: 'Opening & Essentials', surahNumbers: [1, 112, 108, 103] },
  { levelNumber: 2, title: 'Daily Reflection I', surahNumbers: [107, 105, 106, 111] },
  { levelNumber: 3, title: 'Daily Reflection II', surahNumbers: [113, 114, 110, 109] },
  { levelNumber: 4, title: 'Accountability & Time', surahNumbers: [104, 102, 97, 98] },
  { levelNumber: 5, title: 'Power & Awakening', surahNumbers: [99, 100, 101, 96] },
  { levelNumber: 6, title: 'Character Building I', surahNumbers: [90, 91, 92] },
  { levelNumber: 7, title: 'Character Building II', surahNumbers: [93, 94, 95] },
];

const ProgressMap = ({ navigation }) => {
  const [levels, setLevels] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchProgress();
    startPulseAnimation();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);

      // Fetch each source individually so one failure doesn't crash everything
      let qaidaContent = [];
      let quranContent = [];
      let qaidaProgressRecords = [];
      let quranProgressRecords = [];

      try {
        const qaidaRes = await contentService.getQaidaLessons();
        qaidaContent = qaidaRes?.data?.content || [];
      } catch (e) {
        console.warn('Qaida content fetch failed:', e?.message || e);
      }

      try {
        const quranRes = await contentService.getQuranSurahs();
        quranContent = quranRes?.data?.content || [];
      } catch (e) {
        console.warn('Quran content fetch failed:', e?.message || e);
      }

      try {
        const qaidaProgRes = await progressService.getProgress({ module: 'Qaida' });
        qaidaProgressRecords = qaidaProgRes?.data?.progress || [];
      } catch (e) {
        console.warn('Qaida progress fetch failed:', e?.message || e);
      }

      try {
        const quranProgRes = await progressService.getProgress({ module: 'Quran' });
        quranProgressRecords = quranProgRes?.data?.progress || [];
      } catch (e) {
        console.warn('Quran progress fetch failed:', e?.message || e);
      }

      const contentByNumber = new Map();
      qaidaContent.forEach((item) => {
        const number = Number(item?.number);
        if (!Number.isNaN(number)) {
          contentByNumber.set(number, item);
        }
      });

      const qaidaProgressByLevel = new Map();
      qaidaProgressRecords.forEach((record) => {
        if (!record?.levelId) return;
        const current = qaidaProgressByLevel.get(record.levelId);
        if (!current || (record.completionPercentage || 0) > (current.completionPercentage || 0)) {
          qaidaProgressByLevel.set(record.levelId, record);
        }
      });

      const quranProgressByLevel = new Map();
      quranProgressRecords.forEach((record) => {
        if (!record?.levelId) return;
        const current = quranProgressByLevel.get(record.levelId);
        if (!current || (record.completionPercentage || 0) > (current.completionPercentage || 0)) {
          quranProgressByLevel.set(record.levelId, record);
        }
      });

      const mappedQaidaLevels = QAIDA_LEVEL_RANGE.map((levelNumber, index) => {
        const levelId = `qaida_${levelNumber}`;
        const content = contentByNumber.get(levelNumber);
        const progress = qaidaProgressByLevel.get(levelId);
        const isMissingTakhti = levelNumber === 6 && !content;

        const progressPercent = isMissingTakhti
          ? 0
          : Math.max(0, Math.min(100, Number(progress?.completionPercentage || 0)));
        const completed = progressPercent >= 100 || progress?.status === 'completed';

        return {
          id: levelId,
          module: 'Qaida',
          levelNumber,
          title: content?.name || `Takhti ${levelNumber}`,
          subtitle: isMissingTakhti
            ? 'Coming soon'
            : (content?.lesson || 'Tap to start practice'),
          icon: 'qaida',
          color: QAIDA_LEVEL_COLORS[index],
          status: isMissingTakhti ? 'locked' : (completed ? 'completed' : 'unlocked'),
          lessons: content
            ? [
                {
                  id: content._id || `${levelId}_lesson_1`,
                  title: content.name,
                  completed,
                  content,
                },
              ]
            : [],
          quizRequired: !!content,
          progress: progressPercent,
        };
      });

      const quranByNumber = new Map();
      quranContent.forEach((surah) => {
        const number = Number(surah?.number);
        if (!Number.isNaN(number)) {
          quranByNumber.set(number, surah);
        }
      });

      const mappedQuranLevels = QURAN_LEVELS.map((config, index) => {
        const levelId = `quran_${config.levelNumber}`;
        const progress = quranProgressByLevel.get(levelId);
        const surahs = config.surahNumbers
          .map((number) => quranByNumber.get(number))
          .filter(Boolean);

        const progressPercent = Math.max(0, Math.min(100, Number(progress?.completionPercentage || 0)));
        const completed = progressPercent >= 100 || progress?.status === 'completed';

        return {
          id: levelId,
          module: 'Quran',
          levelNumber: config.levelNumber,
          title: config.title,
          subtitle: surahs.length
            ? `${surahs.map((s) => s.name).join(' • ')}`
            : 'Content syncing from database',
          icon: 'quran',
          color: QURAN_LEVEL_COLORS[index],
          status: surahs.length ? (completed ? 'completed' : 'unlocked') : 'locked',
          lessons: surahs.map((surah) => ({
            id: surah._id || `quran_${surah.number}`,
            title: `${surah.name} (${surah.number})`,
            completed,
            content: surah,
          })),
          quizRequired: surahs.length > 0,
          progress: progressPercent,
        };
      });

      const mappedLevels = [...mappedQaidaLevels, ...mappedQuranLevels];

      setLevels(mappedLevels);

      const progressEligibleLevels = mappedLevels.filter((level) => level.status !== 'locked');
      const progressSum = progressEligibleLevels.reduce((sum, level) => sum + (level.progress || 0), 0);
      setOverallProgress(
        progressEligibleLevels.length
          ? Math.round(progressSum / progressEligibleLevels.length)
          : 0
      );
    } catch (error) {
      console.error('Progress fetch error:', error);
      Alert.alert('Error', 'Failed to load progress map from server.');
      setLevels([]);
      setOverallProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgress();
    setRefreshing(false);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleLevelPress = (level) => {
    if (level.status === 'locked') {
      return;
    }
    navigation.navigate('LevelDetail', { level });
  };

  const handleQuizPress = (level) => {
    navigation.navigate('QuizScreen', { level });
  };

  const renderLevelNode = (level, index) => {
    const isEven = index % 2 === 0;
    const isLocked = level.status === 'locked';
    const isCompleted = level.status === 'completed';
    const isActive = level.status === 'unlocked' && !isCompleted;

    return (
      <View key={level.id}>
        {/* Connecting Path */}
        {index > 0 && (
          <View style={styles.pathWrapper}>
            <View style={[styles.pathLine, isEven ? styles.pathLineRight : styles.pathLineLeft]}>
              <LinearGradient
                colors={isCompleted ? ['#FFD700', '#FFA500'] : ['#B8E6D5', '#7EC8A3']}
                style={styles.pathGradient}
              />
            </View>
            <View style={[styles.pathCurve, isEven ? styles.curveRight : styles.curveLeft]}>
              <View style={[styles.curveGradient, isCompleted && styles.curveCompleted]} />
            </View>
          </View>
        )}

        {/* Level Node Container */}
        <View style={[styles.nodeContainer, isEven ? styles.nodeRight : styles.nodeLeft]}>
          <Animated.View style={isActive ? { transform: [{ scale: pulseAnim }] } : {}}>
            <TouchableOpacity
              onPress={() => handleLevelPress(level)}
              activeOpacity={isLocked ? 1 : 0.7}
              disabled={isLocked}
            >
              <LinearGradient
                colors={isLocked ? ['#D1D5DB', '#9CA3AF'] : isCompleted ? ['#10B981', '#059669'] : ['#0A7D4F', '#15B872']}
                style={[styles.levelNode, isLocked && styles.lockedNode]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Islamic pattern overlay */}
                <View style={styles.islamicPattern} />
                
                {isLocked && <Image source={require('../assests/settings.png')} style={styles.lockIcon} />}
                {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                
                <View style={[styles.levelBadge, isCompleted && styles.completedBadge]}>
                  <Image 
                    source={level.module === 'Qaida' ? require('../assests/quaida.png') : require('../assests/quran.png')} 
                    style={styles.moduleIcon}
                  />
                </View>
                
                {/* Level Number Badge */}
                <View style={styles.levelNumberBadge}>
                  <Text style={styles.levelNumberText}>{level.levelNumber}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Level Info Card with Islamic Design */}
          <View style={[styles.levelInfoCard, isEven ? styles.infoCardRight : styles.infoCardLeft]}>
            <View style={styles.cardDecoration} />
            <View style={styles.moduleBadge}>
              <Text style={styles.moduleText}>{level.module} {level.levelNumber}</Text>
            </View>
            <Text style={styles.levelTitle}>{level.title}</Text>
            <Text style={styles.levelSubtitle}>✨ {level.subtitle}</Text>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonCount}>📚 {level.lessons.length} Lessons</Text>
              {level.quizRequired && <Text style={styles.quizBadge}>🎯 Quiz</Text>}
            </View>
          </View>
        </View>

        {/* Quiz Node after each level */}
        {level.quizRequired && renderQuizNode(level, index)}
      </View>
    );
  };

  const renderQuizNode = (level, index) => {
    const isEven = index % 2 === 0;
    const quizCompleted = level.quizCompleted || false;

    return (
      <View style={styles.quizNodeContainer}>
        {/* Small connecting line */}
        <View style={[styles.quizPathLine, isEven ? styles.pathLineRight : styles.pathLineLeft]} />
        
        <View style={[styles.quizNodeWrapper, isEven ? styles.nodeRight : styles.nodeLeft]}>
          <TouchableOpacity
            onPress={() => handleQuizPress(level)}
            activeOpacity={0.8}
            style={styles.quizTouchable}
          >
            <LinearGradient
              colors={quizCompleted ? ['#FFD700', '#FFA500'] : ['#8B5CF6', '#6366F1']}
              style={styles.quizNode}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image source={require('../assests/quiz.png')} style={styles.quizIcon} />
              {quizCompleted && <Text style={styles.quizCheck}>✓</Text>}
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={[styles.quizLabel, isEven ? styles.quizLabelRight : styles.quizLabelLeft]}>
            <Text style={styles.quizLabelText}>Quiz Challenge</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBadgeNode = (badgeInfo, index) => {
    const isEven = index % 2 === 0;

    return (
      <View key={badgeInfo.id} style={styles.badgeNodeContainer}>
        {/* Connecting Path */}
        <View style={styles.pathWrapper}>
          <View style={[styles.pathLine, isEven ? styles.pathLineRight : styles.pathLineLeft]}>
            <LinearGradient colors={['#B8E6D5', '#7EC8A3']} style={styles.pathGradient} />
          </View>
        </View>

        <View style={styles.badgeWrapper}>
          <LinearGradient
            colors={['#F59E0B', '#D97706', '#B45309']}
            style={styles.badgeNode}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.badgeStarburst}>
              <Text style={styles.badgeStars}>⭐</Text>
            </View>
            <Image source={require('../assests/coin.png')} style={styles.badgeIcon} />
            <Text style={styles.badgeEarnedText}>Badge Earned!</Text>
          </LinearGradient>
          
          <View style={styles.badgeInfoCard}>
            <Text style={styles.badgeTitle}>{badgeInfo.title}</Text>
            <Text style={styles.badgeDescription}>{badgeInfo.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCelebrationNode = (celebrationType, title, description) => {
    return (
      <View style={styles.celebrationContainer}>
        {/* Connecting Path */}
        <View style={styles.pathWrapper}>
          <View style={styles.pathLineCenter}>
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.pathGradient} />
          </View>
        </View>

        <View style={styles.celebrationWrapper}>
          <LinearGradient
            colors={['#10B981', '#059669', '#047857']}
            style={styles.celebrationNode}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.celebrationRays} />
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationCrown}>👑</Text>
            <Image source={require('../assests/coin.png')} style={styles.celebrationTrophy} />
          </LinearGradient>

          <View style={styles.celebrationInfoCard}>
            <Text style={styles.celebrationTitle}>{title}</Text>
            <Text style={styles.celebrationSubtitle}>{description}</Text>
            <View style={styles.celebrationRewards}>
              <Text style={styles.rewardText}>🏆 Master Badge</Text>
              <Text style={styles.rewardText}>⭐ 500 Coins</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Badge nodes data
  const badges = [
    { id: 'badge1', module: 'Qaida', afterLevel: 2, title: 'Alphabet Master', description: 'Mastered Arabic Letters!' },
    { id: 'badge-mid', module: 'Qaida', afterLevel: 4, title: 'Takhti 4 Badge', description: 'Completed key Qaida milestone!' },
  ];

  return (
    <LinearGradient colors={['#F0FDF4', '#ECFDF5', '#D1FAE5']} style={styles.wrapper}>
      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A7D4F" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : (
          <>
        {/* Enhanced Header with Islamic Pattern */}
        <View style={styles.header}>
          <View style={styles.headerPattern} />
          <Text style={styles.headerTitle}>🌙 Learning Journey</Text>
          <Text style={styles.headerSubtitle}>من القاعدة إلى القرآن</Text>
          <Text style={styles.headerSubtitleEng}>From Qaida to Quran</Text>
          
          {/* Enhanced Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarOuter}>
              <LinearGradient
                colors={['#0A7D4F', '#10B981', '#34D399']}
                style={[styles.progressFill, { width: `${overallProgress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.progressShine} />
              </LinearGradient>
            </View>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressText}>{overallProgress}% Complete</Text>
              <Text style={styles.progressEmoji}>🎯</Text>
            </View>
          </View>
        </View>

        {/* Scrollable Map with Islamic Background */}
        <ScrollView
          style={styles.mapScrollView}
          contentContainerStyle={styles.mapContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        >
          {/* Enhanced Start Badge */}
          <View style={styles.startBadge}>
            <LinearGradient 
              colors={['#0A7D4F', '#10B981', '#34D399']} 
              style={styles.startCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.startEmoji}>🚀</Text>
              <Text style={styles.startText}>START</Text>
              <Text style={styles.startArabic}>ابدأ</Text>
            </LinearGradient>
          </View>

          {/* Render levels with badges and celebrations */}
          {levels.map((level, index) => {
            const elements = [renderLevelNode(level, index)];
            
            // Add badge after certain levels
            const badge = badges.find((b) => b.afterLevel === level.levelNumber && b.module === level.module);
            if (badge) {
              elements.push(renderBadgeNode(badge, index));
            }

            // Show Qaida completion and Quran transition at the end of Takhti 7.
            if (level.module === 'Qaida' && level.levelNumber === 7) {
              elements.push(
                <View key={`celebration-qaida`}>
                  {renderCelebrationNode('qaida', 'Qaida Mastered! 🎊', 'You have completed all Qaida lessons')}
                </View>
              );

              elements.push(
                <View key={`celebration-quran`}>
                  {renderCelebrationNode('quran', 'Quran Journey Starts! 📖', 'Quran lessons and quizzes are shown below this milestone')}
                </View>
              );
            }

            return elements;
          })}

          {/* Enhanced Finish Badge */}
          <View style={styles.finishBadge}>
            <LinearGradient 
              colors={['#F59E0B', '#D97706', '#B45309']} 
              style={styles.finishCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.finishEmoji}>🏆</Text>
              <Image source={require('../assests/coin.png')} style={styles.trophyIcon} />
              <Text style={styles.finishText}>MASTERY</Text>
              <Text style={styles.finishArabic}>إتقان</Text>
            </LinearGradient>
          </View>
        </ScrollView>
        </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#0A7D4F',
    opacity: 0.3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 2,
  },
  headerSubtitleEng: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBarOuter: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
    position: 'relative',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#0A7D4F',
    textAlign: 'center',
    fontWeight: '800',
  },
  progressEmoji: {
    fontSize: 16,
  },
  mapScrollView: {
    flex: 1,
  },
  mapContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  startBadge: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  startCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  startEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  startText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  startArabic: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  levelRow: {
    marginBottom: 40,
    position: 'relative',
  },
  pathWrapper: {
    position: 'absolute',
    top: -34,
    width: '100%',
    height: 72,
  },
  pathLine: {
    position: 'absolute',
    top: 0,
    width: 6,
    height: 36,
    overflow: 'hidden',
    borderRadius: 3,
  },
  pathGradient: {
    flex: 1,
    width: '100%',
  },
  pathLineRight: {
    right: '26%',
  },
  pathLineLeft: {
    left: '26%',
  },
  pathLineCenter: {
    width: 6,
    height: 40,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 3,
  },
  pathCurve: {
    position: 'absolute',
    top: 31,
    width: '24%',
    height: 40,
    overflow: 'hidden',
  },
  curveGradient: {
    flex: 1,
    borderWidth: 6,
    borderColor: '#B8E6D5',
    borderStyle: 'solid',
  },
  curveCompleted: {
    borderColor: '#FFD700',
  },
  curveRight: {
    right: '26%',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 60,
  },
  curveLeft: {
    left: '26%',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 60,
  },
  nodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  nodeRight: {
    justifyContent: 'flex-end',
  },
  nodeLeft: {
    justifyContent: 'flex-start',
  },
  levelNode: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 5,
    borderColor: '#FFF',
    position: 'relative',
    overflow: 'hidden',
  },
  lockedNode: {
    opacity: 0.5,
  },
  islamicPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockIcon: {
    width: 35,
    height: 35,
    tintColor: '#FFF',
    position: 'absolute',
    zIndex: 10,
  },
  checkmark: {
    fontSize: 40,
    color: '#FFF',
    position: 'absolute',
    top: 5,
    right: 5,
    fontWeight: 'bold',
    zIndex: 10,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  moduleIcon: {
    width: 35,
    height: 35,
    tintColor: '#0A7D4F',
  },
  levelNumberBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 5,
  },
  levelNumberText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  levelInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 12,
    maxWidth: screenWidth * 0.55,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  cardDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0A7D4F',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  infoCardRight: {
    marginRight: 20,
  },
  infoCardLeft: {
    marginLeft: 20,
  },
  moduleBadge: {
    backgroundColor: '#0A7D4F',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  moduleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  lessonInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonCount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  quizBadge: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '700',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  
  // Quiz Node Styles
  quizNodeContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  quizPathLine: {
    position: 'absolute',
    top: -20,
    width: 4,
    height: 30,
    backgroundColor: '#C4B5FD',
    borderRadius: 2,
  },
  quizNodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizTouchable: {
    marginBottom: 5,
  },
  quizNode: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: '#FFF',
    position: 'relative',
  },
  quizIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFF',
  },
  quizCheck: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 20,
    color: '#10B981',
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: 'bold',
  },
  quizLabel: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quizLabelRight: {
    marginRight: 15,
  },
  quizLabelLeft: {
    marginLeft: 15,
  },
  quizLabelText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
  },

  // Badge Node Styles
  badgeNodeContainer: {
    marginBottom: 35,
    alignItems: 'center',
  },
  badgeWrapper: {
    alignItems: 'center',
  },
  badgeNode: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 5,
    borderColor: '#FFF',
    position: 'relative',
  },
  badgeStarburst: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  badgeStars: {
    fontSize: 30,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    tintColor: '#FFF',
  },
  badgeEarnedText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '800',
    marginTop: 2,
  },
  badgeInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    marginTop: 15,
    maxWidth: screenWidth * 0.7,
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F59E0B',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Celebration Node Styles
  celebrationContainer: {
    marginVertical: 40,
    alignItems: 'center',
  },
  celebrationWrapper: {
    alignItems: 'center',
  },
  celebrationNode: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderWidth: 6,
    borderColor: '#FFF',
    position: 'relative',
    overflow: 'hidden',
  },
  celebrationRays: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  celebrationEmoji: {
    fontSize: 35,
    position: 'absolute',
    top: 5,
  },
  celebrationCrown: {
    fontSize: 30,
    position: 'absolute',
    top: 35,
  },
  celebrationTrophy: {
    width: 45,
    height: 45,
    tintColor: '#FFF',
    position: 'absolute',
    bottom: 15,
  },
  celebrationInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    maxWidth: screenWidth * 0.8,
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#D1FAE5',
    alignItems: 'center',
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 6,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  celebrationRewards: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 8,
  },
  rewardText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '800',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  
  // Finish Badge Styles
  finishBadge: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  finishCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderWidth: 6,
    borderColor: '#FFF',
  },
  finishEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  trophyIcon: {
    width: 35,
    height: 35,
    tintColor: '#FFF',
    marginBottom: 2,
  },
  finishText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  finishArabic: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default ProgressMap;
