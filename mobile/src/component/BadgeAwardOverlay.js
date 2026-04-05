// BadgeAwardOverlay.js
// Gamified animated badge award celebration overlay

import React, { useEffect, useRef } from 'react';
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

const StarBurst = ({ delay, angle, distance }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const rad = (angle * Math.PI) / 180;
  const toX = Math.cos(rad) * distance;
  const toY = Math.sin(rad) * distance;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: toX, duration: 700, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: toY, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.starBurst,
        { opacity, transform: [{ translateX }, { translateY }, { scale }] },
      ]}
    >
      ✦
    </Animated.Text>
  );
};

const BadgeAwardOverlay = ({ visible, badge, onDismiss }) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(-15)).current;
  const titleSlide = useRef(new Animated.Value(40)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const STAR_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  useEffect(() => {
    if (visible && badge) {
      // Entrance sequence
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();

      Animated.sequence([
        Animated.parallel([
          Animated.spring(badgeScale, { toValue: 1.15, tension: 80, friction: 4, useNativeDriver: true }),
          Animated.timing(badgeRotate, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.spring(badgeScale, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
      ]).start();

      // Title text
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(titleSlide, { toValue: 0, tension: 60, friction: 6, useNativeDriver: true }),
        ]).start();
      }, 400);

      // Pulsing glow loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      // Light shake celebration
      Animated.sequence([
        Animated.delay(500),
        Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
          ]),
          { iterations: 3 }
        ),
      ]).start();

      const timer = setTimeout(() => dismissOverlay(), 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, badge]);

  const dismissOverlay = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(badgeScale, { toValue: 0.3, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      badgeScale.setValue(0);
      badgeRotate.setValue(-15);
      titleSlide.setValue(40);
      titleOpacity.setValue(0);
      glowAnim.setValue(0.3);
      shakeAnim.setValue(0);
      overlayOpacity.setValue(0);
      onDismiss?.();
    });
  };

  if (!visible || !badge) return null;

  const spin = badgeRotate.interpolate({ inputRange: [-15, 0], outputRange: ['-15deg', '0deg'] });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismissOverlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={dismissOverlay}>
        <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>

          {/* Star bursts radiating from center */}
          <View style={styles.starsContainer}>
            {STAR_ANGLES.map((angle, i) => (
              <StarBurst
                key={i}
                delay={200 + i * 30}
                angle={angle}
                distance={120 + (i % 3) * 30}
              />
            ))}
          </View>

          {/* Badge Card */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { scale: badgeScale },
                  { rotate: spin },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* Glow ring behind badge */}
            <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />

            {/* Badge icon */}
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeEmoji}>{badge.emoji || '🏅'}</Text>
            </View>

            <Animated.View
              style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}
            >
              <Text style={styles.earnedLabel}>BADGE EARNED!</Text>
              <Text style={styles.badgeName}>{badge.title}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>

              {badge.reward && (
                <View style={styles.rewardRow}>
                  <Text style={styles.rewardItem}>⭐ {badge.reward} Coins</Text>
                </View>
              )}

              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>Tap to continue</Text>
              </View>
            </Animated.View>
          </Animated.View>

        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 20, 10, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  starBurst: {
    position: 'absolute',
    fontSize: 20,
    color: '#F9A825',
  },
  card: {
    backgroundColor: '#0A2D1F',
    borderRadius: 32,
    padding: 36,
    alignItems: 'center',
    width: width * 0.82,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    elevation: 30,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    zIndex: 999,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    top: -10,
  },
  badgeCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
    marginBottom: 20,
  },
  badgeEmoji: {
    fontSize: 56,
  },
  earnedLabel: {
    fontSize: 13,
    color: '#6EE7B7',
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  badgeName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDesc: {
    fontSize: 15,
    color: '#A7F3D0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  rewardItem: {
    fontSize: 16,
    color: '#FCD34D',
    fontWeight: '700',
  },
  tapHint: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  tapHintText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default BadgeAwardOverlay;
