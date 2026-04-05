import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import parentService from '../services/parentService';

const QUIZ_PASS_THRESHOLD = 60;
const MAP_BADGES = [
  { id: 'badge-qaida-2', module: 'Qaida', afterLevel: 2, icon: '🅰️', title: 'Alphabet Master', description: 'Passed Qaida Level 2 quiz.' },
  { id: 'badge-qaida-4', module: 'Qaida', afterLevel: 4, icon: '📖', title: 'Takhti Scholar', description: 'Passed Qaida Level 4 quiz.' },
  { id: 'badge-qaida-7', module: 'Qaida', afterLevel: 7, icon: '🎓', title: 'Qaida Graduate', description: 'Passed Qaida Level 7 quiz.' },
  { id: 'badge-quran-3', module: 'Quran', afterLevel: 3, icon: '🌙', title: 'Quran Beginner', description: 'Passed Quran Level 3 quiz.' },
  { id: 'badge-quran-7', module: 'Quran', afterLevel: 7, icon: '🏆', title: 'Quran Champion', description: 'Passed Quran Level 7 quiz.' },
];

const normalizeLevelId = (value) => {
  const raw = String(value || '').toLowerCase();
  const match = raw.match(/(qaida|quran|dua)(?:_level)?_(\d+)/);
  if (!match) return raw;
  return `${match[1]}_${Number(match[2])}`;
};

const getLevelIdAliases = (value) => {
  const raw = String(value || '').toLowerCase();
  const normalized = normalizeLevelId(raw);
  const aliases = new Set([raw, normalized].filter(Boolean));

  const match = normalized.match(/^(qaida|quran)_(\d+)$/);
  if (match) {
    const module = match[1];
    const level = Number(match[2]);
    aliases.add(`${module}_${level}`);
    aliases.add(`${module}_level_${level}`);
    aliases.add(`quiz_${module}_${level}`);
    aliases.add(`${module}_${level}_quiz`);
    aliases.add(`quiz_${module}_level_${level}`);
    aliases.add(`${module}_level_${level}_quiz`);
  }

  return Array.from(aliases);
};

const getMapBadgesFromQuizzes = (quizzes = []) => {
  const badgePassTimes = {};

  quizzes.forEach((quiz) => {
    const percentage = Number(quiz?.percentage || 0);
    if (percentage < QUIZ_PASS_THRESHOLD) return;

    const completedAtMs = new Date(quiz?.completedAt || quiz?.createdAt || quiz?.updatedAt || 0).getTime();
    if (!Number.isFinite(completedAtMs) || completedAtMs <= 0) return;

    const aliases = new Set();
    getLevelIdAliases(quiz?.levelId).forEach((a) => aliases.add(a));

    const quizId = String(quiz?.quizId || '').toLowerCase();
    if (quizId) {
      aliases.add(quizId);
      const fromQuizId = quizId.replace(/^quiz_/, '').replace(/_quiz$/, '');
      getLevelIdAliases(fromQuizId).forEach((a) => aliases.add(a));
    }

    MAP_BADGES.forEach((badge) => {
      const levelKey = `${badge.module.toLowerCase()}_${badge.afterLevel}`;
      if (aliases.has(levelKey)) {
        const prev = badgePassTimes[badge.id] || 0;
        if (completedAtMs > prev) badgePassTimes[badge.id] = completedAtMs;
      }
    });
  });

  return MAP_BADGES
    .map((badge) => ({ ...badge, earnedAtMs: badgePassTimes[badge.id] || 0 }))
    .filter((badge) => badge.earnedAtMs > 0)
    .sort((a, b) => b.earnedAtMs - a.earnedAtMs);
};

const AchievementsRewards = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child' } };
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Achievement type to icon/color mapping
  const achievementStyles = {
    first_lesson: { icon: '📖', color: ['#7B1FA2', '#6A1B9A'] },
    week_streak: { icon: '🔥', color: ['#E53935', '#C62828'] },
    perfect_score: { icon: '🏆', color: ['#FFD700', '#FFA000'] },
    surah_completed: { icon: '⭐', color: ['#1976D2', '#1565C0'] },
    dua_master: { icon: '🤲', color: ['#0A7D4F', '#087F4F'] },
    qaida_complete: { icon: '✅', color: ['#0A7D4F', '#087F4F'] },
    quiz_champion: { icon: '🎯', color: ['#F57C00', '#EF6C00'] },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    if (child?._id) {
      fetchAchievements();
    } else {
      setLoading(false);
    }
  }, [child?._id]);

  const fetchAchievements = async () => {
    if (!child?._id) return;
    try {
      setLoading(true);
      const [achievementsRes, quizzesRes] = await Promise.all([
        parentService.getChildAchievements(child._id),
        parentService.getChildQuizzes(child._id),
      ]);

      const backendAchievements = achievementsRes?.data?.achievements || [];
      const quizzes = quizzesRes?.data?.quizzes || [];

      const formattedBackend = backendAchievements.map((achievement, index) => ({
          id: achievement._id || index,
          icon: achievementStyles[achievement.badgeType]?.icon || '🏅',
          title: achievement.title,
          description: achievement.description,
          dateEarned: formatDate(achievement.earnedAt),
          color: achievementStyles[achievement.badgeType]?.color || ['#0A7D4F', '#087F4F'],
          earnedAtMs: new Date(achievement.earnedAt || achievement.createdAt || 0).getTime() || 0,
        }));

      const formattedDerived = getMapBadgesFromQuizzes(quizzes).map((badge) => ({
        id: `derived-${badge.id}`,
        icon: badge.icon,
        title: badge.title,
        description: badge.description,
        dateEarned: formatDate(badge.earnedAtMs),
        color: ['#F59E0B', '#D97706'],
        earnedAtMs: badge.earnedAtMs,
      }));

      const seenTitles = new Set();
      const merged = [...formattedDerived, ...formattedBackend].filter((item) => {
        const key = String(item.title || '').toLowerCase();
        if (!key || seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      });

      merged.sort((a, b) => (b.earnedAtMs || 0) - (a.earnedAtMs || 0));
      setAchievements(merged);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>{child.name}'s Badges & Rewards</Text>
        </View>

        {/* Total Badges */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#FFFFFF', '#FFF9C4']}
            style={styles.totalBadgeCard}
          >
            <Text style={styles.totalBadgeCount}>{achievements.length}</Text>
            <Text style={styles.totalBadgeLabel}>Total Badges Earned</Text>
            <Text style={styles.totalBadgeSubtext}>Keep up the great work!</Text>
          </LinearGradient>
        </View>

        {/* Achievements Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Achievements</Text>
          {achievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏅</Text>
              <Text style={styles.emptyText}>No achievements yet</Text>
            </View>
          ) : (
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <LinearGradient
                key={achievement.id}
                colors={achievement.color}
                style={styles.achievementCard}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Earned:</Text>
                  <Text style={styles.dateValue}>{achievement.dateEarned}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
          )}
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  totalBadgeCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  totalBadgeCount: {
    fontSize: 56,
    fontWeight: '900',
    color: '#F57C00',
    marginBottom: 8,
  },
  totalBadgeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 6,
  },
  totalBadgeSubtext: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  achievementsGrid: {
    gap: 15,
  },
  achievementCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
  },
  achievementIcon: {
    fontSize: 36,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 15,
    opacity: 0.95,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  dateValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default AchievementsRewards;
