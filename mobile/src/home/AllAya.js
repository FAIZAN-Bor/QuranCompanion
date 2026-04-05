import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useFocusEffect } from '@react-navigation/native';
import contentService from '../services/contentService';
import progressService from '../services/progressService';

const AllAya = ({ navigation, route }) => {
  const initialSurah = route.params.data; // The selected Surah object
  const [surahData, setSurahData] = useState(initialSurah);
  const playerRef = useRef(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [audioInstance, setAudioInstance] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);
  const [loadingAudioUrl, setLoadingAudioUrl] = useState(null);
  const [completedAyahIds, setCompletedAyahIds] = useState(new Set());
  const ayahs = Array.isArray(surahData?.ayahs)
    ? surahData.ayahs
    : (Array.isArray(surahData?.verses) ? surahData.verses : []);

  const getSurahLevelAliases = (surah) => {
    const aliases = new Set();
    const surahNumber = Number(surah?.number || initialSurah?.number || 0);
    if (surah?._id) aliases.add(String(surah._id).toLowerCase());
    if (surahNumber) aliases.add(`surah_${surahNumber}`);
    return aliases;
  };

  const getAyahLessonId = (item, index) => `ayah_${getAyahNumber(item, index)}`;

  const fetchAyahCompletionProgress = async (surah, isMountedRef) => {
    try {
      const progressResponse = await progressService.getProgress({ module: 'Quran' });
      const records = progressResponse?.data?.progress || [];
      const surahAliases = getSurahLevelAliases(surah);

      const completedIds = new Set(
        records
          .filter((record) => {
            const levelId = String(record?.levelId || '').toLowerCase();
            const lessonId = String(record?.lessonId || '').toLowerCase();
            return (
              record?.status === 'completed' &&
              lessonId.startsWith('ayah_') &&
              surahAliases.has(levelId)
            );
          })
          .map((record) => String(record.lessonId).toLowerCase())
      );

      if (isMountedRef.current) {
        setCompletedAyahIds(completedIds);
      }
    } catch (error) {
      console.warn('Failed to fetch ayah completion progress:', error?.message || error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const isMountedRef = { current: true };

      const loadLatestSurah = async () => {
        const number = Number(initialSurah?.number);
        if (Number.isNaN(number)) return;

        try {
          const [response] = await Promise.all([
            contentService.getContentByNumber('Quran', number),
            fetchAyahCompletionProgress(initialSurah, isMountedRef),
          ]);
          const latest = response?.data?.content;
          if (isMountedRef.current && latest) {
            setSurahData(latest);
            fetchAyahCompletionProgress(latest, isMountedRef);
          }
        } catch (error) {
          if (isMountedRef.current) {
            setSurahData(initialSurah);
          }
        }
      };

      loadLatestSurah();

      return () => {
        isMountedRef.current = false;
      };
    }, [initialSurah])
  );

  const getAyahNumber = (item, index) => item?.number ?? item?.verseNumber ?? index + 1;
  const getArabicText = (item) => item?.arabic ?? item?.arabicText ?? '';
  const getEnglishText = (item) => item?.english ?? item?.translation ?? item?.transliteration ?? '';
  const getReferenceAudioUrl = (item) => item?.audioUrl || item?.referenceAudioUrl || '';

  const handlePlayReferenceAudio = (item) => {
    const url = getReferenceAudioUrl(item);
    if (!url) {
      Alert.alert('Audio Not Available', 'Reference audio is not available for this ayah.');
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

  const completedCount = ayahs.filter((item, index) =>
    completedAyahIds.has(getAyahLessonId(item, index).toLowerCase())
  ).length;

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.surahTitle}>{surahData?.name}</Text>
        <Text style={styles.arabicTitle}>{surahData?.arabicName || surahData?.nameArabic}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={{
                width: `${ayahs.length > 0 ? (completedCount / ayahs.length) * 100 : 0}%`,
                height: '100%',
                borderRadius: 6,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>{completedCount} / {ayahs.length} Ayahs Completed</Text>
        </View>
      </View>

      <FlatList
        data={ayahs}
        keyExtractor={(item, index) => `${getAyahNumber(item, index)}`}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.ayahCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            {completedAyahIds.has(getAyahLessonId(item, index).toLowerCase()) && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓</Text>
              </View>
            )}

            {/* Ayah Number Badge */}
            <View style={styles.ayahBadge}>
              <Text style={styles.ayahNumber}>{getAyahNumber(item, index)}</Text>
            </View>

            {/* Arabic Text */}
            <View style={styles.arabicContainer}>
              <Text style={styles.arabic}>{getArabicText(item)}</Text>
            </View>

            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.8}
              onPress={() => handlePlayReferenceAudio(item)}
            >
              <LinearGradient colors={['#0A7D4F', '#15B872']} style={styles.playGradient}>
                {isReferenceLoading && loadingAudioUrl === getReferenceAudioUrl(item) ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Image source={require('../assests/play.png')} style={styles.playIcon} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* English Text */}
            <Text style={styles.english}>{getEnglishText(item)}</Text>

            {/* Practice Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('AyaDetail', {
                data: {
                  ...item,
                  number: getAyahNumber(item, index),
                  arabic: getArabicText(item),
                  english: getEnglishText(item),
                  surahNumber: surahData?.number,
                },
                surahId: surahData?._id || `surah_${surahData?.number}`,
                surahName: surahData?.name,
              })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0A7D4F', '#15B872']}
                style={styles.practiceBtn}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.practiceText}>Practice (Recite) ▶</Text>
              </LinearGradient>
            </TouchableOpacity>

          </LinearGradient>
        )}
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
    </LinearGradient>
  );
};

export default AllAya;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  headerContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 10,
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

  surahTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
  },

  arabicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2b624c',
    marginTop: 5,
  },

  ayahCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 125, 79, 0.1)',
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
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

  ayahBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A7D4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
  },

  ayahNumber: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  arabicContainer: {
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  arabic: {
    fontSize: 24,
    textAlign: 'right',
    color: '#2b624c',
    fontWeight: 'bold',
    lineHeight: 40,
  },

  english: {
    fontSize: 15,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  playButton: {
    alignSelf: 'flex-end',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
  },
  playGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },

  practiceBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
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
