import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import parentService from '../services/parentService';

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
      const response = await parentService.getChildAchievements(child._id);
      if (response.success && response.data?.achievements) {
        const formattedAchievements = response.data.achievements.map((achievement, index) => ({
          id: achievement._id || index,
          icon: achievementStyles[achievement.type]?.icon || '🏅',
          title: achievement.title,
          description: achievement.description,
          dateEarned: formatDate(achievement.earnedAt),
          color: achievementStyles[achievement.type]?.color || ['#0A7D4F', '#087F4F'],
        }));
        setAchievements(formattedAchievements);
      }
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

        {/* Upcoming Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.upcomingCard}
          >
            <Text style={styles.upcomingIcon}>🎓</Text>
            <Text style={styles.upcomingTitle}>Quran Expert</Text>
            <Text style={styles.upcomingDescription}>
              Complete 10 Surahs with 95%+ accuracy
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#0A7D4F', '#15B872']}
                  style={[styles.progressFill, { width: '40%' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>4/10 completed</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.upcomingCard}
          >
            <Text style={styles.upcomingIcon}>💯</Text>
            <Text style={styles.upcomingTitle}>Perfect Week</Text>
            <Text style={styles.upcomingDescription}>
              Practice every day for 30 days
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#E53935', '#D32F2F']}
                  style={[styles.progressFill, { width: '70%' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>21/30 days</Text>
            </View>
          </LinearGradient>
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
  upcomingCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
  },
  upcomingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  upcomingDescription: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#0A7D4F',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default AchievementsRewards;
