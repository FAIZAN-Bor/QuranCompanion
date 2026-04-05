// ProgressMap.js - Gamified Learning Path Screen with Islamic Aesthetic

import React, { useState, useEffect, useRef } from 'react';
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
import quizService from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import BadgeAwardOverlay from '../component/BadgeAwardOverlay';

const { width: screenWidth } = Dimensions.get('window');

const QAIDA_LEVEL_RANGE = [1, 2, 3, 4, 5, 6, 7];
const QUIZ_PASS_THRESHOLD = 60;
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
  const { user } = useAuth();
  const proficiencyLevel = user?.proficiencyLevel || 'Beginner';

  const [levels, setLevels] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  // State for caching static content
  const [cachedQaidaContent, setCachedQaidaContent] = useState(null);
  const [cachedQuranContent, setCachedQuranContent] = useState(null);
  // Quiz pass tracking (levelId -> bestPercentage)
  const [quizPassMap, setQuizPassMap] = useState({});
  const [quizPassTimeMap, setQuizPassTimeMap] = useState({});
  // Badge overlay
  const [showBadgeOverlay, setShowBadgeOverlay] = useState(false);
  const [activeBadge, setActiveBadge] = useState(null);
  const prevLevelStatuses = useRef({});
  const hasInitializedBadgeState = useRef(false);

  const normalizeLevelId = (value) => {
    if (!value) return '';
    const raw = String(value).toLowerCase();
    const qaidaMatch = raw.match(/qaida(?:_level)?_(\d+)/);
    if (qaidaMatch) return `qaida_${Number(qaidaMatch[1])}`;

    const quranMatch = raw.match(/quran_(\d+)/);
    if (quranMatch) return `quran_${Number(quranMatch[1])}`;

    return raw;
  };

  const getLevelIdAliases = (value) => {
    const aliases = new Set();
    const raw = String(value || '').toLowerCase();
    const normalized = normalizeLevelId(raw);

    if (raw) aliases.add(raw);
    if (normalized) aliases.add(normalized);

    const qaidaMatch = normalized.match(/^qaida_(\d+)$/);
    if (qaidaMatch) {
      const n = Number(qaidaMatch[1]);
      aliases.add(`qaida_${n}`);
      aliases.add(`qaida_level_${n}`);
      aliases.add(`quiz_qaida_${n}`);
      aliases.add(`quiz_qaida_level_${n}`);
      aliases.add(`qaida_${n}_quiz`);
      aliases.add(`qaida_level_${n}_quiz`);
    }

    const quranMatch = normalized.match(/^quran_(\d+)$/);
    if (quranMatch) {
      const n = Number(quranMatch[1]);
      aliases.add(`quran_${n}`);
      aliases.add(`quiz_quran_${n}`);
      aliases.add(`quran_${n}_quiz`);
    }

    return Array.from(aliases);
  };

  const buildQuizPassMaps = (quizList = []) => {
    const newQuizPassMap = {};
    const newQuizPassTimeMap = {};

    quizList.forEach((q) => {
      const pct = Number(q?.percentage || 0);
      const passedAtMs = new Date(q?.completedAt || q?.createdAt || q?.updatedAt || 0).getTime();
      const idAliases = new Set();

      getLevelIdAliases(q?.levelId).forEach((key) => idAliases.add(key));

      const quizId = String(q?.quizId || '').toLowerCase();
      if (quizId) {
        idAliases.add(quizId);
        const fromQuizId = quizId
          .replace(/^quiz_/, '')
          .replace(/_quiz$/, '');
        getLevelIdAliases(fromQuizId).forEach((key) => idAliases.add(key));
      }

      idAliases.forEach((key) => {
        if (!key) return;
        if (!newQuizPassMap[key] || pct > newQuizPassMap[key]) {
          newQuizPassMap[key] = pct;
        }
        if (pct >= QUIZ_PASS_THRESHOLD && Number.isFinite(passedAtMs) && passedAtMs > 0) {
          if (!newQuizPassTimeMap[key] || passedAtMs > newQuizPassTimeMap[key]) {
            newQuizPassTimeMap[key] = passedAtMs;
          }
        }
      });
    });

    return {
      quizPassMap: newQuizPassMap,
      quizPassTimeMap: newQuizPassTimeMap,
    };
  };

  const getQuizBestPctForLevel = (levelId, map = quizPassMap) => {
    return getLevelIdAliases(levelId).reduce((best, key) => {
      const current = Number(map?.[key] || 0);
      return current > best ? current : best;
    }, 0);
  };

  const getQuizPassedAtForLevel = (levelId, map = quizPassTimeMap) => {
    return getLevelIdAliases(levelId).reduce((latest, key) => {
      const current = Number(map?.[key] || 0);
      return current > latest ? current : latest;
    }, 0);
  };

  const getQaidaLevelAliases = (levelNumber) => {
    const n = Number(levelNumber || 0);
    if (!n) return new Set();
    return new Set([`qaida_${n}`, `qaida_level_${n}`]);
  };

  const getSurahLevelAliases = (surah) => {
    const aliases = new Set();
    if (surah?._id) aliases.add(String(surah._id).toLowerCase());
    const surahNumber = Number(surah?.number || 0);
    if (surahNumber) aliases.add(`surah_${surahNumber}`);
    return aliases;
  };

  const getCompletedUnitIds = (records, levelAliases, lessonPrefix) => {
    return new Set(
      records
        .filter((record) => {
          const levelId = String(record?.levelId || '').toLowerCase();
          const lessonId = String(record?.lessonId || '').toLowerCase();
          return (
            record?.status === 'completed' &&
            lessonId.startsWith(lessonPrefix) &&
            levelAliases.has(levelId)
          );
        })
        .map((record) => String(record.lessonId).toLowerCase())
    );
  };

  useEffect(() => {
    fetchProgress(true); // True indicates this is the initial loud loading
    startPulseAnimation();

    // Add listener to securely refresh data in the background without causing the loading screen to flicker
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProgress(false); // False indicates silent background refresh 
    });

    return unsubscribe;
  }, [navigation, proficiencyLevel]);

  const fetchProgress = async (isInitialLoading = false) => {
    try {
      if (isInitialLoading) setLoading(true);

      let qaidaContent = [];
      let quranContent = [];
      let qaidaProgressRecords = [];
      let quranProgressRecords = [];
      let effectiveQuizPassMap = { ...quizPassMap };
      let effectiveQuizPassTimeMap = { ...quizPassTimeMap };

      // Determine if we need to fetch static content or use cache
      const needsContentFetch = isInitialLoading || !cachedQaidaContent || !cachedQuranContent;

      if (needsContentFetch) {
        // Fetch all required data concurrently
        const [qaidaRes, quranRes, qaidaProgRes, quranProgRes, quizRes] = await Promise.allSettled([
          contentService.getQaidaLessons(),
          contentService.getQuranSurahs({ summary: true }),
          progressService.getProgress({ module: 'Qaida' }),
          progressService.getProgress({ module: 'Quran' }),
          quizService.getQuizResults({}),
        ]);

        if (qaidaRes.status === 'fulfilled') {
          qaidaContent = qaidaRes.value?.data?.content || [];
          setCachedQaidaContent(qaidaContent);
        }
        if (quranRes.status === 'fulfilled') {
          quranContent = quranRes.value?.data?.content || [];
          setCachedQuranContent(quranContent);
        }
        if (qaidaProgRes.status === 'fulfilled') {
          qaidaProgressRecords = qaidaProgRes.value?.data?.progress || [];
        }
        if (quranProgRes.status === 'fulfilled') {
          quranProgressRecords = quranProgRes.value?.data?.progress || [];
        }
        if (quizRes.status === 'fulfilled') {
          const quizList = quizRes.value?.data?.results || [];
          const { quizPassMap: newQuizPassMap, quizPassTimeMap: newQuizPassTimeMap } = buildQuizPassMaps(quizList);
          effectiveQuizPassMap = newQuizPassMap;
          effectiveQuizPassTimeMap = newQuizPassTimeMap;
          setQuizPassMap(newQuizPassMap);
          setQuizPassTimeMap(newQuizPassTimeMap);
        }
      } else {
        // Use cached content, ONLY fetch progress + quiz
        qaidaContent = cachedQaidaContent;
        quranContent = cachedQuranContent;

        const [qaidaProgRes, quranProgRes, quizRes] = await Promise.allSettled([
          progressService.getProgress({ module: 'Qaida' }),
          progressService.getProgress({ module: 'Quran' }),
          quizService.getQuizResults({}),
        ]);

        if (qaidaProgRes.status === 'fulfilled') {
          qaidaProgressRecords = qaidaProgRes.value?.data?.progress || [];
        }
        if (quranProgRes.status === 'fulfilled') {
          quranProgressRecords = quranProgRes.value?.data?.progress || [];
        }
        if (quizRes.status === 'fulfilled') {
          const quizList = quizRes.value?.data?.results || [];
          const { quizPassMap: newQuizPassMap, quizPassTimeMap: newQuizPassTimeMap } = buildQuizPassMaps(quizList);
          effectiveQuizPassMap = newQuizPassMap;
          effectiveQuizPassTimeMap = newQuizPassTimeMap;
          setQuizPassMap(newQuizPassMap);
          setQuizPassTimeMap(newQuizPassTimeMap);
        }
      }

      const contentByNumber = new Map();
      qaidaContent.forEach((item) => {
        const number = Number(item?.number);
        if (!Number.isNaN(number)) {
          contentByNumber.set(number, item);
        }
      });

      const qaidaDirectByLevel = new Map();
      qaidaProgressRecords.forEach((record) => {
        if (!record?.levelId) return;
        const normalizedLevelId = normalizeLevelId(record.levelId);
        if (!normalizedLevelId.startsWith('qaida_')) return;

        const current = qaidaDirectByLevel.get(normalizedLevelId);
        if (!current || (record.completionPercentage || 0) > (current.completionPercentage || 0)) {
          qaidaDirectByLevel.set(normalizedLevelId, record);
        }
      });

      const quranDirectByLevel = new Map();
      quranProgressRecords.forEach((record) => {
        if (!record?.levelId) return;
        const normalizedLevelId = normalizeLevelId(record.levelId);
        if (!normalizedLevelId.startsWith('quran_')) return;

        const current = quranDirectByLevel.get(normalizedLevelId);
        if (!current || (record.completionPercentage || 0) > (current.completionPercentage || 0)) {
          quranDirectByLevel.set(normalizedLevelId, record);
        }
      });

      let previousQaidaCompleted = true; // Level 1 is unlocked by default
      // Quiz for level N unlocks level N+1.
      let previousQaidaQuizPassed = true;

      const mappedQaidaLevels = QAIDA_LEVEL_RANGE.map((levelNumber, index) => {
        const levelId = `qaida_${levelNumber}`;
        const content = contentByNumber.get(levelNumber);
        const directLevelProgress = qaidaDirectByLevel.get(levelId);
        const isMissingTakhti = levelNumber === 6 && !content;

        const qaidaAliases = getQaidaLevelAliases(levelNumber);
        const completedCharacterIds = getCompletedUnitIds(qaidaProgressRecords, qaidaAliases, 'character_');
        const totalCharacters = Array.isArray(content?.characters) ? content.characters.length : 0;
        const completedCharacters = totalCharacters > 0
          ? Array.from({ length: totalCharacters }).filter((_, idx) =>
              completedCharacterIds.has(`character_${idx + 1}`)
            ).length
          : 0;

        const progressPercent = isMissingTakhti
          ? 0
          : totalCharacters > 0
            ? Math.round((completedCharacters / totalCharacters) * 100)
            : Math.max(0, Math.min(100, Number(directLevelProgress?.completionPercentage || 0)));

        const completed = (totalCharacters > 0 && completedCharacters >= totalCharacters)
          || progressPercent >= 100
          || directLevelProgress?.status === 'completed';

        const quizBestPct = getQuizBestPctForLevel(levelId, effectiveQuizPassMap);
        const quizPassed = quizBestPct >= QUIZ_PASS_THRESHOLD;
        const quizPassedAt = getQuizPassedAtForLevel(levelId, effectiveQuizPassTimeMap);

        const gateFromPrevious = previousQaidaCompleted && previousQaidaQuizPassed;
        let isUnlocked = gateFromPrevious && !isMissingTakhti;

        // Proficiency level override for Qaida
        if (proficiencyLevel === 'Intermediate' || proficiencyLevel === 'Advanced') {
          isUnlocked = !isMissingTakhti;
        }

        const finalStatus = (isUnlocked || completed) ? (completed ? 'completed' : 'unlocked') : 'locked';
        
        // Update prerequisites for next level
        previousQaidaCompleted = completed;
        previousQaidaQuizPassed = quizPassed;

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
          status: finalStatus,
          lessons: content
            ? [
                {
                  id: content._id || `${levelId}_lesson_1`,
                  title: content.name,
                  completed,
                  lessonProgress: progressPercent,
                  completedUnits: completedCharacters,
                  totalUnits: totalCharacters || 1,
                  content,
                },
              ]
            : [],
          quizRequired: !!content,
          quizPassed,
          quizBestPct,
          quizPassedAt,
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

      let previousQuranCompleted = true; // Level 1 Quran is unlocked by default
      let previousQuranQuizPassed = true;

      const mappedQuranLevels = QURAN_LEVELS.map((config, index) => {
        const levelId = `quran_${config.levelNumber}`;
        const directLevelProgress = quranDirectByLevel.get(levelId);
        const surahs = config.surahNumbers
          .map((number) => quranByNumber.get(number))
          .filter(Boolean);

        const surahLessons = surahs.map((surah) => {
          const totalAyahs = Number(
            surah?.totalAyahs ||
            (Array.isArray(surah?.ayahs) ? surah.ayahs.length : 0) ||
            (Array.isArray(surah?.verses) ? surah.verses.length : 0) ||
            0
          );
          const surahAliases = getSurahLevelAliases(surah);
          const completedAyahIds = getCompletedUnitIds(quranProgressRecords, surahAliases, 'ayah_');
          const completedAyahs = totalAyahs > 0
            ? Math.min(totalAyahs, completedAyahIds.size)
            : 0;

          const directSurahCompleted = quranProgressRecords.some((record) => {
            const recordLevelId = String(record?.levelId || '').toLowerCase();
            const recordLessonId = String(record?.lessonId || '').toLowerCase();
            const surahId = String(surah?._id || '').toLowerCase();
            return (
              record?.status === 'completed' &&
              recordLevelId === levelId &&
              !!surahId &&
              recordLessonId === surahId
            );
          });

          const surahCompleted = (totalAyahs > 0 && completedAyahs >= totalAyahs) || directSurahCompleted;
          const surahProgress = totalAyahs > 0
            ? Math.round((completedAyahs / totalAyahs) * 100)
            : (directSurahCompleted ? 100 : 0);

          return {
            id: surah._id || `quran_${surah.number}`,
            title: `${surah.name} (${surah.number})`,
            completed: surahCompleted,
            lessonProgress: surahProgress,
            completedUnits: completedAyahs,
            totalUnits: totalAyahs || 1,
            content: surah,
          };
        });

        const totalAyahsAll = surahLessons.reduce((sum, lesson) => sum + Number(lesson.totalUnits || 0), 0);
        const completedAyahsAll = surahLessons.reduce((sum, lesson) => sum + Number(lesson.completedUnits || 0), 0);

        const progressPercent = totalAyahsAll > 0
          ? Math.round((completedAyahsAll / totalAyahsAll) * 100)
          : Math.max(0, Math.min(100, Number(directLevelProgress?.completionPercentage || 0)));

        const completed = (totalAyahsAll > 0 && completedAyahsAll >= totalAyahsAll)
          || progressPercent >= 100
          || directLevelProgress?.status === 'completed';

        const quizBestPct = getQuizBestPctForLevel(levelId, effectiveQuizPassMap);
        const quizPassed = quizBestPct >= QUIZ_PASS_THRESHOLD;
        const quizPassedAt = getQuizPassedAtForLevel(levelId, effectiveQuizPassTimeMap);

        const gateFromPrevious = previousQuranCompleted && previousQuranQuizPassed;
        let isUnlocked = gateFromPrevious && surahs.length > 0;

        // Proficiency level override for Quran
        if (proficiencyLevel === 'Advanced') {
          isUnlocked = surahs.length > 0;
        }

        const finalStatus = (isUnlocked || completed) ? (completed ? 'completed' : 'unlocked') : 'locked';
        
        previousQuranCompleted = completed;
        previousQuranQuizPassed = quizPassed;

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
          status: finalStatus,
          lessons: surahLessons,
          quizRequired: surahs.length > 0,
          quizPassed,
          quizBestPct,
          quizPassedAt,
          progress: progressPercent,
        };
      });

      const mappedLevels = [...mappedQaidaLevels, ...mappedQuranLevels];

      // Auto-show badge overlay when the quiz above a badge is passed
      const BADGES_DEFS = getBadgeDefs();
      const isFirstBadgeSync = !hasInitializedBadgeState.current;
      const newlyUnlockedBadges = [];
      for (const badge of BADGES_DEFS) {
        const matchedLevel = mappedLevels.find(
          (l) => l.module === badge.module && l.levelNumber === badge.afterLevel
        );
        const currentUnlocked = (matchedLevel?.quizBestPct || 0) >= QUIZ_PASS_THRESHOLD;
        const prevUnlocked = Boolean(prevLevelStatuses.current[badge.id]);

        // Do not auto-popup badges on first load after login.
        if (!isFirstBadgeSync && !prevUnlocked && currentUnlocked) {
          newlyUnlockedBadges.push({
            ...badge,
            quizPassedAt: Number(matchedLevel?.quizPassedAt || 0),
          });
        }
      }

      if (!isFirstBadgeSync && newlyUnlockedBadges.length) {
        const badgeToShow = newlyUnlockedBadges.sort((a, b) => {
          if ((b.quizPassedAt || 0) !== (a.quizPassedAt || 0)) {
            return (b.quizPassedAt || 0) - (a.quizPassedAt || 0);
          }
          return b.afterLevel - a.afterLevel;
        })[0];

        setTimeout(() => {
          setActiveBadge(badgeToShow);
          setShowBadgeOverlay(true);
        }, 1200);
      }

      // Store current statuses for comparison next refresh
      const newStatuses = {};
      mappedLevels.forEach((l) => { newStatuses[l.id] = l.status; });
      BADGES_DEFS.forEach((b) => {
        const ml = mappedLevels.find((l) => l.module === b.module && l.levelNumber === b.afterLevel);
        newStatuses[b.id] = (ml?.quizBestPct || 0) >= QUIZ_PASS_THRESHOLD;
      });
      prevLevelStatuses.current = newStatuses;
      hasInitializedBadgeState.current = true;

      setLevels(mappedLevels);

      const qaidaLevels = mappedQaidaLevels.filter((item) => item.quizRequired);
      const quranLevels = mappedQuranLevels.filter((item) => item.quizRequired);

      const qaidaLessonPct = qaidaLevels.length
        ? qaidaLevels.reduce((sum, item) => sum + Number(item.progress || 0), 0) / qaidaLevels.length
        : 0;
      const quranLessonPct = quranLevels.length
        ? quranLevels.reduce((sum, item) => sum + Number(item.progress || 0), 0) / quranLevels.length
        : 0;

      const qaidaQuizPct = qaidaLevels.length
        ? (qaidaLevels.filter((item) => item.quizPassed).length / qaidaLevels.length) * 100
        : 0;
      const quranQuizPct = quranLevels.length
        ? (quranLevels.filter((item) => item.quizPassed).length / quranLevels.length) * 100
        : 0;

      // Fixed-weight journey model: lessons and quizzes from Qaida + Quran.
      const weightedProgress =
        (qaidaLessonPct * 0.35) +
        (quranLessonPct * 0.35) +
        (qaidaQuizPct * 0.15) +
        (quranQuizPct * 0.15);

      setOverallProgress((prev) => Math.max(prev, Math.round(weightedProgress)));
    } catch (error) {
      console.error('Progress fetch error:', error);
      Alert.alert('Error', 'Failed to load progress map from server.');
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
      const msg = !level.quizPassed && level.quizRequired
        ? `Complete the previous level's quiz with at least ${QUIZ_PASS_THRESHOLD}% to unlock this one!`
        : 'Please complete the previous levels to unlock this one!';
      Alert.alert('🔒 Locked', msg);
      return;
    }
    navigation.navigate('LevelDetail', { level });
  };

  const handleQuizPress = (level) => {
    if (level.status !== 'completed') {
      Alert.alert('🔒 Locked', 'Please complete all lessons for this level first to unlock the quiz!');
      return;
    }
    navigation.navigate('QuizScreen', { level });
  };

  const handleBadgePress = (badge, isLocked) => {
    if (isLocked) {
      Alert.alert('🔒 Badge Locked', `Pass the quiz above this badge with at least ${QUIZ_PASS_THRESHOLD}% in ${badge.module} Level ${badge.afterLevel} to earn it!`);
      return;
    }
    setActiveBadge(badge);
    setShowBadgeOverlay(true);
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
              <Text style={[styles.lessonCount, {marginLeft: 8, color: '#0A7D4F'}]}>📊 {level.progress || 0}%</Text>
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
    const isLocked = level.status !== 'completed';
    const quizPassed = level.quizPassed || false;
    const quizBestPct = level.quizBestPct || 0;

    return (
      <View style={styles.quizNodeContainer}>
        {/* Small connecting line */}
        <View style={[styles.quizPathLine, isEven ? styles.pathLineRight : styles.pathLineLeft]} />
        
        <View style={[styles.quizNodeWrapper, isEven ? styles.nodeRight : styles.nodeLeft]}>
          <TouchableOpacity
            onPress={() => handleQuizPress(level)}
            activeOpacity={isLocked ? 1 : 0.8}
            style={styles.quizTouchable}
          >
            <LinearGradient
              colors={isLocked ? ['#D1D5DB', '#9CA3AF'] : quizPassed ? ['#FFD700', '#FFA500'] : ['#8B5CF6', '#6366F1']}
              style={styles.quizNode}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image source={isLocked ? require('../assests/settings.png') : require('../assests/quiz.png')} style={[styles.quizIcon, isLocked && { width: 20, height: 20, tintColor: '#FFF' }]} />
              {quizPassed && <Text style={styles.quizCheck}>✓</Text>}
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={[styles.quizLabel, isEven ? styles.quizLabelRight : styles.quizLabelLeft]}>
            <Text style={styles.quizLabelText}>
              {isLocked ? 'Quiz Locked' : quizPassed ? `Passed ✓ (${quizBestPct}%)` : `Quiz (need ${QUIZ_PASS_THRESHOLD}%)`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBadgeNode = (badgeInfo, index, isLocked = false) => {
    const isEven = index % 2 === 0;

    return (
      <View key={badgeInfo.id} style={styles.badgeNodeContainer}>
        {/* Connecting Path */}
        <View style={styles.pathWrapper}>
          <View style={[styles.pathLine, isEven ? styles.pathLineRight : styles.pathLineLeft]}>
            <LinearGradient colors={isLocked ? ['#E5E7EB', '#D1D5DB'] : ['#B8E6D5', '#7EC8A3']} style={styles.pathGradient} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.badgeWrapper}
          activeOpacity={0.8}
          onPress={() => handleBadgePress(badgeInfo, isLocked)}
        >
          <LinearGradient
            colors={isLocked ? ['#D1D5DB', '#9CA3AF', '#6B7280'] : ['#F59E0B', '#D97706', '#B45309']}
            style={[styles.badgeNode, isLocked && { elevation: 2 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.badgeStarburst}>
              <Text style={[styles.badgeStars, isLocked && { opacity: 0.2 }]}>⭐</Text>
            </View>
            <Text style={styles.badgeNodeEmoji}>{isLocked ? '🔒' : (badgeInfo.emoji || '🏅')}</Text>
            <Text style={styles.badgeEarnedText}>{isLocked ? 'Locked' : 'Badge Earned!'}</Text>
          </LinearGradient>
          
          <View style={styles.badgeInfoCard}>
            <Text style={styles.badgeTitle}>{badgeInfo.title}</Text>
            <Text style={styles.badgeDescription}>{badgeInfo.description}</Text>
          </View>
        </TouchableOpacity>
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

  // Badge definitions — also used in auto-show and click logic
  const getBadgeDefs = () => [
    { id: 'badge-qaida-2', module: 'Qaida', afterLevel: 2, emoji: '🅰️', title: 'Alphabet Master', description: 'You have mastered the Arabic alphabet letters!', reward: 150 },
    { id: 'badge-qaida-4', module: 'Qaida', afterLevel: 4, emoji: '📖', title: 'Takhti Scholar', description: 'Completed key Qaida Takhti milestone!', reward: 200 },
    { id: 'badge-qaida-7', module: 'Qaida', afterLevel: 7, emoji: '🎓', title: 'Qaida Graduate', description: 'You have completed the entire Qaida course!', reward: 500 },
    { id: 'badge-quran-3', module: 'Quran', afterLevel: 3, emoji: '🌙', title: 'Quran Beginner', description: 'Completed the first 3 Quran lesson groups!', reward: 300 },
    { id: 'badge-quran-7', module: 'Quran', afterLevel: 7, emoji: '🏆', title: 'Quran Champion', description: 'Completed all Quran lessons. MashaAllah!', reward: 1000 },
  ];
  const badges = getBadgeDefs();

  return (
    <LinearGradient colors={['#F0FDF4', '#ECFDF5', '#D1FAE5']} style={styles.wrapper}>
      <SafeAreaView style={styles.container}>

        {/* Gamified Badge Award Overlay */}
        <BadgeAwardOverlay
          visible={showBadgeOverlay}
          badge={activeBadge}
          onDismiss={() => { setShowBadgeOverlay(false); setActiveBadge(null); }}
        />

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
              const isBadgeLocked = (level.quizBestPct || 0) < QUIZ_PASS_THRESHOLD;
              elements.push(renderBadgeNode(badge, index, isBadgeLocked));
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
  badgeNodeEmoji: {
    fontSize: 38,
    marginBottom: 2,
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
