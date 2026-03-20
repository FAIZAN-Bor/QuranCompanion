import { StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 1.1;

const QuidaTaqkti = ({ navigation, route }) => {
  const { data } = route.params || {};
  const rawList = data?.characters;
  const list = Array.isArray(rawList) ? rawList : [];
  console.log('Received data:', data);
  const playerRef = useRef(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState(0);
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);
  const [loadingAudioUrl, setLoadingAudioUrl] = useState(null);

  const getTakhtiNumber = () => {
    const n = Number(data?.number);
    return Number.isNaN(n) ? null : n;
  };

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

  const getReferenceAudioUrl = (item, index) => {
    if (!item || typeof item === 'string') return '';
    return item?.audioUrl || data?.audioUrl || '';
  };

  const handlePlayReferenceAudio = (item, index) => {
    const url = getReferenceAudioUrl(item, index);
    if (!url) {
      Alert.alert('Audio Not Available', 'Reference audio is not available for this word.');
      return;
    }

    setIsReferenceLoading(true);
    setLoadingAudioUrl(url);

    if (currentAudioUrl === url) {
      // Restart from beginning on every tap for quicker feedback.
      playerRef.current?.seek?.(0);
      setIsAudioPlaying(true);
      return;
    }

    setCurrentAudioUrl(url);
    setIsAudioPlaying(true);
    setAudioInstance((prev) => prev + 1);
  };

  if (!Array.isArray(rawList)) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red' }}>❌ Error: No characters found!</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => (
    <LinearGradient
      colors={['#FFFFFF', '#F1F8E9']}
      style={styles.card}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <Text style={styles.index}>#{index + 1}</Text>

      <View style={styles.characterRow}>
        <View style={styles.textContainer}>
           <Text style={styles.text} onPress={() => handlePlayReferenceAudio(item, index)}>{getPrimaryText(item)}</Text>
           {!!getSecondaryText(item) && (
             <Text style={styles.englishText}>{getSecondaryText(item)}</Text>
           )}
        </View>
       
        <TouchableOpacity
          style={[styles.playButton, styles.playButtonFloating]}
          activeOpacity={0.7}
          onPress={() => handlePlayReferenceAudio(item, index)}
        >
          <LinearGradient
            colors={['#0A7D4F', '#15B872']}
            style={styles.playGradient}
          >
            {isReferenceLoading && loadingAudioUrl === getReferenceAudioUrl(item, index) ? (
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

      <TouchableOpacity onPress={() => navigation.navigate('QuidaDetail', { data: {item, number: index + 1, levelNumber: getTakhtiNumber() || 1}, levelId: `qaida_level_${getTakhtiNumber() || 1}` })} activeOpacity={0.8}>
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
  );

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={{flex: 1}}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>{data?.nameArabic || data?.arabicName} ({data?.name})</Text>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
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
    marginBottom: 20,
    letterSpacing: 0.5,
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
