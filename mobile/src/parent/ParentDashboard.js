import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import parentService from '../services/parentService';
import { useAuth } from '../context/AuthContext';

// Quick access menu items
const quickAccessItems = [
  { id: 1, title: 'Progress Overview', icon: require('../assests/ProgressOverview.png'), screen: 'Progress', isTab: true, color: '#42A5F5' },
  { id: 2, title: 'Lesson Details', icon: require('../assests/LessonDetails.png'), screen: 'LessonActivityDetails', isTab: false, color: '#7B1FA2' },
  { id: 3, title: 'Mistake Log', icon: require('../assests/MistakeLog.png'), screen: 'MistakeLog', isTab: false, color: '#EF5350' },
  { id: 4, title: 'Quiz Results', icon: require('../assests/QuizResult.png'), screen: 'QuizResults', isTab: false, color: '#FFA726' },
  { id: 5, title: 'Achievements', icon: require('../assests/Achievements.png'), screen: 'AchievementsRewards', isTab: false, color: '#FFD700' },
  { id: 6, title: 'Activity Timeline', icon: require('../assests/ActivitTimeline.png'), screen: 'Activity', isTab: true, color: '#26C6DA' },
];

const QUIZ_PASS_THRESHOLD = 60;
const MAP_BADGES = [
  { id: 'badge-qaida-2', levelId: 'qaida_2', emoji: '🅰️', title: 'Alphabet Master' },
  { id: 'badge-qaida-4', levelId: 'qaida_4', emoji: '📖', title: 'Takhti Scholar' },
  { id: 'badge-qaida-7', levelId: 'qaida_7', emoji: '🎓', title: 'Qaida Graduate' },
  { id: 'badge-quran-3', levelId: 'quran_3', emoji: '🌙', title: 'Quran Beginner' },
  { id: 'badge-quran-7', levelId: 'quran_7', emoji: '🏆', title: 'Quran Champion' },
];

const normalizeLevelId = (value) => {
  if (!value) return '';
  const raw = String(value).toLowerCase();
  const qaidaMatch = raw.match(/qaida(?:_level)?_(\d+)/);
  if (qaidaMatch) return `qaida_${Number(qaidaMatch[1])}`;

  const quranMatch = raw.match(/quran_(\d+)/);
  if (quranMatch) return `quran_${Number(quranMatch[1])}`;

  const duaMatch = raw.match(/dua_(\d+)/);
  if (duaMatch) return `dua_${Number(duaMatch[1])}`;

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

const ParentDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childStats, setChildStats] = useState(null);
  const [childSummaryMap, setChildSummaryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      setChildStats(null);
      fetchChildStats(selectedChild.child._id);
    }
  }, [selectedChild]);

  const fetchChildrenSummaries = async (childLinks = []) => {
    try {
      const summaryEntries = await Promise.all(
        childLinks.map(async (childLink) => {
          try {
            const childId = childLink?.child?._id;
            if (!childId) return null;
            const response = await parentService.getChildProgress(childId);
            return [childId, response?.data?.summary || null];
          } catch (_) {
            return null;
          }
        })
      );

      const nextMap = {};
      summaryEntries.forEach((entry) => {
        if (entry && entry[0] && entry[1]) {
          nextMap[entry[0]] = entry[1];
        }
      });
      setChildSummaryMap(nextMap);
    } catch (error) {
      console.error('Error fetching children summaries:', error);
    }
  };

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await parentService.getChildren();
      console.log('Children response:', JSON.stringify(response, null, 2));
      if (response.success && response.data.children.length > 0) {
        setChildren(response.data.children);
        setSelectedChild(response.data.children[0]);
        fetchChildrenSummaries(response.data.children);
        // Log profile images for debugging
        response.data.children.forEach(childLink => {
          console.log(`Child ${childLink.child.name} profileImage:`, childLink.child.profileImage);
        });
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      Alert.alert('Error', 'Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildStats = async (childId) => {
    try {
      const response = await parentService.getChildDashboard(childId);
      if (response.success) {
        setChildStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching child stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    setRefreshing(false);
  };

  const handleQuickAccessPress = (item) => {
    if (!selectedChild) return;

    const selectedSummary =
      childStats?.progress?.summary ||
      childSummaryMap[selectedChild?.child?._id] ||
      null;
    
    const childData = {
      _id: selectedChild.child._id,
      name: selectedChild.child.name,
      email: selectedChild.child.email,
      progress: Math.round(selectedSummary?.accuracy ?? selectedChild.child.accuracy ?? 0),
      level: selectedChild.child.currentLevel || 'Beginner',
      coins: selectedChild.child.coins || 0,
      streakDays: selectedChild.child.streakDays || 0
    };
    
    if (item.isTab) {
      navigation.navigate(item.screen, { child: childData });
    } else {
      navigation.getParent()?.navigate(item.screen, { child: childData });
    }
  };

  const getLastActive = (lastActiveDate) => {
    if (!lastActiveDate) return 'No activity yet';
    const now = new Date(nowMs);
    const lastActive = new Date(lastActiveDate);
    const lastActiveMs = lastActive.getTime();
    if (!Number.isFinite(lastActiveMs)) return 'No activity yet';

    const diffMs = Math.max(0, now.getTime() - lastActiveMs);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const exactTime = lastActive.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    if (diffMinutes < 1) return `Less than a minute ago (${exactTime})`;
    if (diffMinutes < 60) return `${diffMinutes} min ago (${exactTime})`;
    if (diffHours < 24) {
      const minutesPart = diffMinutes % 60;
      return `${diffHours}h ${minutesPart}m ago (${exactTime})`;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago (${exactTime})`;
  };

  const getLatestMapBadge = () => {
    const quizResults = childStats?.quizzes || [];
    if (!quizResults.length) return null;

    const badgePassTimes = {};

    quizResults.forEach((quiz) => {
      const percentage = Number(quiz?.percentage || 0);
      if (percentage < QUIZ_PASS_THRESHOLD) return;

      const completedAtMs = new Date(quiz?.completedAt || quiz?.createdAt || 0).getTime();
      const aliases = new Set();
      getLevelIdAliases(quiz?.levelId).forEach((alias) => aliases.add(alias));

      const quizId = String(quiz?.quizId || '').toLowerCase();
      if (quizId) {
        aliases.add(quizId);
        const fromQuizId = quizId.replace(/^quiz_/, '').replace(/_quiz$/, '');
        getLevelIdAliases(fromQuizId).forEach((alias) => aliases.add(alias));
      }

      MAP_BADGES.forEach((badge) => {
        if (aliases.has(badge.levelId)) {
          const prev = badgePassTimes[badge.id] || 0;
          if (completedAtMs > prev) {
            badgePassTimes[badge.id] = completedAtMs;
          }
        }
      });
    });

    const earnedBadges = MAP_BADGES
      .map((badge) => ({ ...badge, earnedAt: badgePassTimes[badge.id] || 0 }))
      .filter((badge) => badge.earnedAt > 0)
      .sort((a, b) => b.earnedAt - a.earnedAt);

    if (earnedBadges.length) return earnedBadges[0];

    const latestAchievement = childStats?.achievements?.[0] || null;
    if (!latestAchievement) return null;

    return {
      emoji: '🏅',
      title: latestAchievement.title || 'Badge Earned',
    };
  };

  const getTotalMistakes = () => {
    if (!childStats?.mistakes) return 0;
    return childStats.mistakes.filter(m => !m.isResolved).length;
  };

  const getTodayActivity = () => {
    if (!childStats?.progress?.summary) return 0;
    // Calculate minutes spent today from progress data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLessons = childStats.progress.progress?.filter(p => {
      const accessDate = new Date(p.lastAccessedAt);
      return accessDate >= today;
    }) || [];
    return Math.round(todayLessons.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60);
  };

  const getCurrentActivity = () => {
    if (!childStats?.progress?.progress || childStats.progress.progress.length === 0) {
      return 'No recent activity';
    }
    const inProgress = childStats.progress.progress.find(p => p.status === 'in_progress');
    const activeProgress = inProgress || childStats.progress.progress[0];
    const levelId = String(activeProgress?.levelId || '').toLowerCase();
    const levelMatch = levelId.match(/(qaida|quran|dua)(?:_level)?_(\d+)/);

    if (levelMatch) {
      const moduleName = levelMatch[1].charAt(0).toUpperCase() + levelMatch[1].slice(1);
      return `${moduleName} Level ${Number(levelMatch[2])}`;
    }

    if (activeProgress?.module) {
      return `${activeProgress.module} Lesson`;
    }

    return 'No recent activity';
  };

  const latestBadge = getLatestMapBadge();

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7D4F" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </LinearGradient>
    );
  }

  if (children.length === 0) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👨‍👧‍👦</Text>
        <Text style={styles.emptyTitle}>No Children Linked</Text>
        <Text style={styles.emptySubtitle}>Link your child's account to monitor their progress</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A7D4F']} />
        }
      >
        
        {/* Header */}
        <LinearGradient
          colors={['#0A7D4F', '#0F9D63', '#15B872']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
              <Text style={styles.headerTitle}>Parent Dashboard</Text>
              <Text style={styles.headerSubtitle}>Monitor your children's progress</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <View style={styles.profileIconContainer}>
                {user?.profileImage ? (
                  <Image 
                    source={{ uri: user.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Text style={styles.profileInitials}>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Child List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Children</Text>
            <View style={styles.childCountBadge}>
              <Text style={styles.childCountText}>{children.length}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childList}>
            {children.map((childLink) => {
              const childId = childLink?.child?._id;
              const summaryAccuracy = childSummaryMap[childId]?.accuracy;
              const accuracyValue = Math.round(summaryAccuracy ?? childLink?.child?.accuracy ?? 0);
              
              return (
                <TouchableOpacity
                  key={childLink.child._id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedChild(childLink)}
                >
                  <LinearGradient
                    colors={selectedChild?.child._id === childLink.child._id ? ['#0A7D4F', '#15B872'] : ['#FFFFFF', '#E8F5E9']}
                    style={styles.childCard}
                  >
                    <View style={styles.childImageContainer}>
                      {childLink.child.profileImage ? (
                        <Image 
                          source={{ uri: childLink.child.profileImage }}
                          style={styles.childProfileImage}
                        />
                      ) : (
                        <Text style={styles.childAvatarInitials}>
                          {childLink.child.name ? childLink.child.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'C'}
                        </Text>
                      )}
                    </View>
                    <Text style={[
                      styles.childName,
                      selectedChild?.child._id === childLink.child._id && styles.childNameSelected
                    ]}>
                      {childLink.child.name}
                    </Text>
                    <Text style={[
                      styles.childLevel,
                      selectedChild?.child._id === childLink.child._id && styles.childLevelSelected
                    ]}>
                      {childLink.child.currentLevel || 'Beginner'}
                    </Text>
                    
                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${accuracyValue}%` }]} />
                    </View>
                    <Text style={[
                      styles.progressText,
                      selectedChild?.child._id === childLink.child._id && styles.progressTextSelected
                    ]}>
                      {accuracyValue}% Accuracy
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            
            <LinearGradient colors={['#FFFFFF', '#E3F2FD']} style={styles.statCard}>
              <Text style={styles.statValue}>{getTodayActivity()} min</Text>
              <Text style={styles.statLabel}>Today's Activity</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#F1F8E9']} style={styles.statCard}>
              <Text style={styles.statValue}>🔥 {selectedChild?.child.streakDays || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#FFEBEE']} style={styles.statCard}>
              <Text style={styles.statValue}>{getTotalMistakes()}</Text>
              <Text style={styles.statLabel}>Unresolved Mistakes</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#FFF9C4']} style={styles.statCard}>
              <Text style={styles.statValue}>{latestBadge?.emoji || '🏆'}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>{latestBadge?.title || 'No badges yet'}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Current Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Activity</Text>
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.activityCard}
          >
            <Text style={styles.activityTitle}>{selectedChild?.child.name} is learning:</Text>
            <Text style={styles.activityContent}>{getCurrentActivity()}</Text>
            <Text style={styles.activityTime}>Last active: {getLastActive(childStats?.progress?.summary?.lastActivity || childSummaryMap[selectedChild?.child?._id]?.lastActivity || selectedChild?.child?.lastActiveDate)}</Text>
          </LinearGradient>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleQuickAccessPress(item)}
                style={styles.quickAccessTouchable}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F1F8E9']}
                  style={styles.quickAccessCard}
                >
                  <Image source={item.icon} style={styles.quickAccessIcon} />
                  <Text 
                    style={styles.quickAccessTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  childAvatarEmoji: {
    fontSize: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF9C4',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E8F5E9',
    letterSpacing: 0.2,
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 4,
    overflow: 'hidden',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  profileIcon: {
    fontSize: 24,
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.3,
  },
  childCountBadge: {
    backgroundColor: '#0A7D4F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
  },
  childCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  childList: {
    flexDirection: 'row',
  },
  childCard: {
    width: 180,
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: 'center',
  },
  childImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  childProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  childAvatarEmoji: {
    fontSize: 40,
  },
  childAvatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A7D4F',
  },
  childImage: {
    width: 50,
    height: 50,
    tintColor: '#0A7D4F',
  },
  childName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 5,
  },
  childNameSelected: {
    color: '#FFFFFF',
  },
  childLevel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
  },
  childLevelSelected: {
    color: '#E8F5E9',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF9C4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A7D4F',
  },
  progressTextSelected: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
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
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: 15,
    padding: 20,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  activityContent: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 10,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessTouchable: {
    width: '48%',
    marginBottom: 12,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    paddingVertical: 18,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  quickAccessIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  quickAccessIconEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  quickAccessTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A7D4F',
    textAlign: 'center',
    lineHeight: 16,
    width: '100%',
  },
});

export default ParentDashboard;
