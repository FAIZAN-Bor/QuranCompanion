import { StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useFocusEffect } from '@react-navigation/native';
import contentService from '../services/contentService';
import progressService from '../services/progressService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 1.1;

const QuidaTaqkti = ({ navigation, route }) => {
  const initialData = route.params?.data || {};
  const [data, setData] = useState(initialData);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

  const rawList = data?.characters;
  const list = Array.isArray(rawList) ? rawList : [];

  const playerRef = useRef(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState(0);
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);
  const [loadingAudioUrl, setLoadingAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getTakhtiNumber = () => {
    const n = Number(data?.number || initialData?.number);
    return Number.isNaN(n) ? null : n;
  };

  const getQaidaLevelAliases = (takhtiNo) => {
    const n = Number(takhtiNo || 0);
    if (!n) return [];
    return [`qaida_${n}`, `qaida_level_${n}`];
  };

  const getCharacterLessonId = (item, index) => {
    const n = Number(item?.number || index + 1);
    return `character_${n}`;
  };

  const fetchCompletionProgress = async (takhtiNo, isMountedRef) => {
    try {
      const progressResponse = await progressService.getProgress({ module: 'Qaida' });
      const records = progressResponse?.data?.progress || [];
      const aliases = new Set(getQaidaLevelAliases(takhtiNo));

      const completedIds = new Set(
        records
          .filter((record) => {
            const lessonId = String(record?.lessonId || '').toLowerCase();
            const levelId = String(record?.levelId || '').toLowerCase();
            return (
              record?.status === 'completed' &&
              lessonId.startsWith('character_') &&
              aliases.has(levelId)
            );
          })
          .map((record) => String(record.lessonId).toLowerCase())
      );

      if (isMountedRef.current) {
        setCompletedLessonIds(completedIds);
      }
    } catch (error) {
      console.warn('Failed to fetch Takhti completion progress:', error?.message || error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const isMountedRef = { current: true };

      const fetchFullQaidaData = async () => {
        if (!initialData?.characters) setIsLoading(true);

        const number = Number(initialData?.number || data?.number);
        if (Number.isNaN(number)) {
          if (isMountedRef.current) setIsLoading(false);
          return;
        }

        try {
          const [response] = await Promise.all([
            contentService.getContentByNumber('Qaida', number),
            fetchCompletionProgress(number, isMountedRef),
          ]);

          const latest = response?.data?.content;
          if (isMountedRef.current && latest) {
            setData(latest);
          }
        } catch (error) {
          console.warn('Failed to fetch full Qaida Takhti data', error?.message || error);
        } finally {
          if (isMountedRef.current) setIsLoading(false);
        }
      };

      fetchFullQaidaData();

      return () => {
        isMountedRef.current = false;
      };
    }, [initialData, data?.number])
  );

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

  const getPrimaryText = (item) => {
    if (typeof item === 'string') return item;
    return normalizeArabicText(item?.arabicText || item?.arabic || item?.word || item?.english || 'N/A');
  };

  const getSecondaryText = (item) => {
    if (!item || typeof item === 'string') return '';
    return item?.english || item?.transliteration || '';
  };

  const getReferenceAudioUrl = (item) => {
    if (!item || typeof item === 'string') return '';
    return item?.audioUrl || data?.audioUrl || '';
  };

  const handlePlayReferenceAudio = (item) => {
    const url = getReferenceAudioUrl(item);
    if (!url) {
      Alert.alert('Audio Not Available', 'Reference audio is not available for this word.');
      return;
    }

    setIsReferenceLoading(true);
    setLoadingAudioUrl(url);

    if (currentAudioUrl === url) {
      playerRef.current?.seek?.(0);
      setIsAudioPlaying(true);
      return;
    }

    setCurrentAudioUrl(url);
    setIsAudioPlaying(true);
    setAudioInstance((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A7D4F" />
        <Text style={{ marginTop: 10, color: '#0A7D4F', fontWeight: 'bold' }}>Loading Takhti content...</Text>
      </View>
    );
  }

  if (!Array.isArray(rawList)) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red' }}>Error: No characters found!</Text>
      </View>
    );
  }

  const completedCount = list.filter((item, index) =>
    completedLessonIds.has(getCharacterLessonId(item, index).toLowerCase())
  ).length;

  const renderItem = ({ item, index }) => {
    const lessonId = getCharacterLessonId(item, index).toLowerCase();
    const isCompleted = completedLessonIds.has(lessonId);

    return (
      <LinearGradient
        colors={['#FFFFFF', '#F1F8E9']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.index}>#{index + 1}</Text>

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}

        <View style={styles.characterRow}>
          <View style={styles.textContainer}>
            <Text style={styles.text} onPress={() => handlePlayReferenceAudio(item)}>{getPrimaryText(item)}</Text>
            {!!getSecondaryText(item) && (
              <Text style={styles.englishText}>{getSecondaryText(item)}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.playButton, styles.playButtonFloating]}
            activeOpacity={0.7}
            onPress={() => handlePlayReferenceAudio(item)}
          >
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={styles.playGradient}
            >
              {isReferenceLoading && loadingAudioUrl === getReferenceAudioUrl(item) ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Image
                  source={require('../assests/play.png')}
                  style={styles.playIcon}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('QuidaDetail', {
            data: { item, number: index + 1, levelNumber: getTakhtiNumber() || 1 },
            levelId: `qaida_level_${getTakhtiNumber() || 1}`,
          })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0A7D4F', '#15B872']}
            style={styles.practiceBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.practiceText}>Practice (Recite) ▶</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>{data?.nameArabic || data?.arabicName} ({data?.name})</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={{
                width: `${list.length > 0 ? (completedCount / list.length) * 100 : 0}%`,
                height: '100%',
                borderRadius: 6,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>{completedCount} / {list.length} Characters Completed</Text>
        </View>

        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(item, index) => String(item?.number || index)}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 20, alignItems: 'center' }}
        />

        {currentAudioUrl ? (
          <Video
            key={`${currentAudioUrl}_${audioInstance}`}
            ref={playerRef}
            source={{ uri: currentAudioUrl }}
            audioOnly
            controls={false}
            paused={!isAudioPlaying}
            ignoreSilentSwitch="ignore"
            playInBackground={false}
            onLoad={() => {
              setIsReferenceLoading(false);
              setLoadingAudioUrl(null);
              setIsAudioPlaying(true);
            }}
            onEnd={() => {
              setIsReferenceLoading(false);
              setLoadingAudioUrl(null);
              setIsAudioPlaying(false);
            }}
            onError={() => {
              setIsReferenceLoading(false);
              setLoadingAudioUrl(null);
              setIsAudioPlaying(false);
              Alert.alert('Playback Error', 'Could not play reference audio.');
            }}
            style={styles.hiddenAudioPlayer}
          />
        ) : null}
      </View>
    </LinearGradient>
  );
};

export default QuidaTaqkti;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#DDEFE2',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#0A7D4F',
    textAlign: 'center',
  },
  card: {
    width: CARD_WIDTH,
    paddingVertical: 18,
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(10, 125, 79, 0.1)',
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  index: {
    fontSize: 18,
    color: '#0A7D4F',
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginBottom: 8,
  },
  characterRow: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 16,
    minHeight: 72,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  text: {
    fontSize: 48,
    color: '#0A7D4F',
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
    includeFontPadding: false,
    flexShrink: 1,
  },
  englishText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  playButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
  },
  playButtonFloating: {
    position: 'absolute',
    right: 16,
  },
  playGradient: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  practiceBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 15,
    elevation: 5,
  },
  practiceText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  hiddenAudioPlayer: {
    width: 0,
    height: 0,
  },
});
