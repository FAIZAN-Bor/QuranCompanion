// CoinRewardOverlay.js
// A full-screen gamified overlay that celebrates earned coins with flying coin particles

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Single flying coin particle
const CoinParticle = ({ delay, startX, startY }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const driftX = (Math.random() - 0.5) * 180; // random left/right drift

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -height * 0.5, duration: 1400, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: driftX, duration: 1400, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]);
    seq.start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.Text
      style={[
        styles.coinParticle,
        {
          left: startX,
          top: startY,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }, { rotate: spin }],
        },
      ]}
    >
      🪙
    </Animated.Text>
  );
};

const CoinRewardOverlay = ({ visible, coins = 0, message = '', onDismiss }) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const coinScaleAnim = useRef(new Animated.Value(0)).current;
  const coinTextAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (visible && coins > 0) {
      // Generate 16 random coin particles
      const newParticles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        delay: Math.random() * 500,
        startX: width * 0.1 + Math.random() * width * 0.8,
        startY: height * 0.5 + Math.random() * 60,
      }));
      setParticles(newParticles);

      // Animate overlay in
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(coinScaleAnim, { toValue: 1, tension: 60, friction: 5, delay: 200, useNativeDriver: true }),
      ]).start();

      // Bouncing count-up pulsation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -8, duration: 300, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        { iterations: 4 }
      ).start();

      // Text reveal
      Animated.timing(coinTextAnim, {
        toValue: 1,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        dismissOverlay();
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [visible, coins]);

  const dismissOverlay = () => {
    Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      coinScaleAnim.setValue(0);
      coinTextAnim.setValue(0);
      bounceAnim.setValue(0);
      setParticles([]);
      onDismiss?.();
    });
  };

  if (!visible || coins <= 0) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismissOverlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={dismissOverlay}
      >
        <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>

          {/* Flying Coin Particles */}
          {particles.map((p) => (
            <CoinParticle key={p.id} delay={p.delay} startX={p.startX} startY={p.startY} />
          ))}

          {/* Central Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: coinTextAnim,
                transform: [
                  { scale: coinScaleAnim },
                  { translateY: bounceAnim },
                ],
              },
            ]}
          >
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={styles.coinsEarnedLabel}>You Earned</Text>
            <Text style={styles.coinsAmount}>+{coins}</Text>
            <Text style={styles.coinsWordLabel}>COINS!</Text>
            {!!message && <Text style={styles.messageText}>{message}</Text>}
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap to continue</Text>
            </View>
          </Animated.View>

        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 30, 15, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coinParticle: {
    position: 'absolute',
    fontSize: 28,
    zIndex: 10,
  },
  card: {
    backgroundColor: '#0A2D1F',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9A825',
    elevation: 20,
    shadowColor: '#F9A825',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    zIndex: 20,
  },
  coinEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  coinsEarnedLabel: {
    fontSize: 16,
    color: '#A7F3D0',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  coinsAmount: {
    fontSize: 72,
    fontWeight: '900',
    color: '#F9A825',
    lineHeight: 80,
    textShadowColor: '#FF8F00',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  coinsWordLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F9A825',
    letterSpacing: 4,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    color: '#6EE7B7',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  tapHint: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(249, 168, 37, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 168, 37, 0.4)',
  },
  tapHintText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default CoinRewardOverlay;
