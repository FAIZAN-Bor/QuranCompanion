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

const ActivityTimeline = ({ route }) => {
  const childFromParams = route?.params?.child;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, lessons: 0, badges: 0 });
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(childFromParams || null);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const dateMs = date.getTime();
    if (!Number.isFinite(dateMs)) return 'Unknown';

    const now = new Date(nowMs);
    const diffMs = Math.max(0, now.getTime() - dateMs);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const exactTime = date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (diffMinutes < 1) return `Less than a minute ago (${exactTime})`;
    if (diffMinutes < 60) return `${diffMinutes} min ago (${exactTime})`;
    if (diffHours < 24) {
      const mins = diffMinutes % 60;
      return `${diffHours}h ${mins}m ago (${exactTime})`;
    }
    if (diffDays === 1) return `Yesterday (${exactTime})`;
    return `${diffDays} days ago (${exactTime})`;
  };

  const getDateLabel = (dateString) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const dateMs = date.getTime();
    if (!Number.isFinite(dateMs)) return 'Unknown';

    const now = new Date(nowMs);
    const diffDays = Math.floor((now.getTime() - dateMs) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getLevelLabel = (levelId, module) => {
    const raw = String(levelId || '').toLowerCase();
    const match = raw.match(/(qaida|quran|dua)(?:_level)?_(\d+)/);
    if (match) {
      const name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      return `${name} Level ${Number(match[2])}`;
    }
    return module || 'Lesson';
  };

  const getLessonLabel = (lesson) => {
    const contentName = lesson?.contentId?.name || lesson?.contentId?.title;
    if (contentName) return contentName;

    const lessonId = String(lesson?.lessonId || '').trim();
    if (!lessonId) return 'Lesson';

    return lessonId
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    if (!childFromParams) {
      fetchChildren();
    } else {
      setSelectedChild(childFromParams);
    }
  }, [childFromParams]);

  useEffect(() => {
    if (selectedChild?._id) {
      fetchActivities();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await parentService.getChildren();
      // response is { success, data: { children: [{ child: {...} }, ...] } }
      if (response.success && response.data?.children?.length > 0) {
        const childrenList = response.data.children.map(link => ({
          _id: link.child._id,
          name: link.child.name,
          email: link.child.email,
          ...link.child
        }));
        setChildren(childrenList);
        setSelectedChild(childrenList[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching children:', err);
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!selectedChild?._id) return;
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [progressRes, quizzesRes, achievementsRes, recitationsRes] = await Promise.all([
        parentService.getChildProgress(selectedChild._id),
        parentService.getChildQuizzes(selectedChild._id),
        parentService.getChildAchievements(selectedChild._id),
        parentService.getChildRecitations(selectedChild._id),
      ]);

      const allActivities = [];

      // Add lessons from progress and collapse duplicates by module+level+lessonId.
      if (progressRes.data?.progress) {
        const lessonEventsByKey = new Map();

        progressRes.data.progress.forEach((lesson, index) => {
          const activityTime = lesson.lastAccessedAt || lesson.completedAt || lesson.updatedAt || lesson.createdAt;
          if (!activityTime) return;

          const lessonKey = `${lesson.module || 'Lesson'}_${normalizeLevelId(lesson.levelId || 'unknown')}_${lesson.lessonId || 'lesson'}`;
          const event = {
            id: `lesson-${index}`,
            type: 'lesson',
            title: `${lesson.status === 'completed' ? 'Completed' : 'Practiced'} ${getLevelLabel(lesson.levelId, lesson.module)}`,
            subtitle: `${getLessonLabel(lesson)} • Accuracy: ${Math.round(lesson.accuracy || 0)}%`,
            time: formatTimeAgo(activityTime),
            date: getDateLabel(activityTime),
            timestamp: new Date(activityTime),
            icon: lesson.module === 'Quran' ? '📖' : lesson.module === 'Dua' ? '🤲' : '📚',
            color: ['#0A7D4F', '#15B872'],
          };

          const existing = lessonEventsByKey.get(lessonKey);
          if (!existing || event.timestamp.getTime() > existing.timestamp.getTime()) {
            lessonEventsByKey.set(lessonKey, event);
          }
        });

        lessonEventsByKey.forEach((event) => allActivities.push(event));
      }

      // Add quizzes (quizzesRes.data is { quizzes })
      if (quizzesRes.data?.quizzes) {
        quizzesRes.data.quizzes.forEach((quiz, index) => {
          const activityTime = quiz.completedAt || quiz.createdAt || quiz.updatedAt;
          if (!activityTime) return;

          allActivities.push({
            id: `quiz-${index}`,
            type: 'quiz',
            title: `Quiz ${getLevelLabel(quiz.levelId, quiz.module)}`,
            subtitle: `Score: ${quiz.percentage || quiz.score || 0}%`,
            time: formatTimeAgo(activityTime),
            date: getDateLabel(activityTime),
            timestamp: new Date(activityTime),
            icon: '✍️',
            color: ['#7B1FA2', '#AB47BC'],
          });
        });

        const derivedBadgeEvents = getMapBadgesFromQuizzes(quizzesRes.data.quizzes).map((badge) => {
          const activityTime = badge.earnedAtMs;
          return {
            id: `derived-badge-${badge.id}-${activityTime}`,
            type: 'badge',
            title: `Earned ${badge.title}`,
            subtitle: badge.description,
            time: formatTimeAgo(activityTime),
            date: getDateLabel(activityTime),
            timestamp: new Date(activityTime),
            icon: badge.icon,
            color: ['#FFD700', '#F59E0B'],
          };
        });

        derivedBadgeEvents.forEach((event) => allActivities.push(event));
      }

      // Add achievements (achievementsRes.data is { achievements })
      if (achievementsRes.data?.achievements) {
        const existingBadgeTitles = new Set(
          allActivities
            .filter((a) => a.type === 'badge')
            .map((a) => String(a.title || '').toLowerCase())
        );

        achievementsRes.data.achievements.forEach((achievement, index) => {
          const activityTime = achievement.earnedAt || achievement.createdAt;
          if (!activityTime) return;

           const badgeTitle = `Earned ${achievement.title || 'Badge'}`;
           const badgeTitleKey = badgeTitle.toLowerCase();
           if (existingBadgeTitles.has(badgeTitleKey)) return;

          allActivities.push({
            id: `badge-${index}`,
            type: 'badge',
            title: badgeTitle,
            subtitle: achievement.description,
            time: formatTimeAgo(activityTime),
            date: getDateLabel(activityTime),
            timestamp: new Date(activityTime),
            icon: '🏆',
            color: ['#FFD700', '#FFA000'],
          });

          existingBadgeTitles.add(badgeTitleKey);
        });
      }

      // Add recitation attempts (independent dynamic events).
      if (recitationsRes.data?.recitations) {
        recitationsRes.data.recitations.forEach((recitation, index) => {
          const activityTime = recitation.createdAt;
          if (!activityTime) return;

          allActivities.push({
            id: `recitation-${index}`,
            type: 'recitation',
            title: `Recited ${getLevelLabel(recitation.levelId, recitation.module)}`,
            subtitle: `Overall: ${Math.round(recitation.overallScore || 0)}%`,
            time: formatTimeAgo(activityTime),
            date: getDateLabel(activityTime),
            timestamp: new Date(activityTime),
            icon: '🎤',
            color: ['#0284C7', '#0EA5E9'],
          });
        });
      }

      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Calculate stats
      const lessonCount = Number(progressRes.data?.summary?.completedLessons || 0);
      const badgeCount = allActivities.filter(a => a.type === 'badge').length;

      setStats({
        total: allActivities.length,
        lessons: lessonCount,
        badges: badgeCount,
      });

      setActivities(allActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {});

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!selectedChild) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>👶</Text>
          <Text style={styles.emptyText}>No child linked yet</Text>
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
          <Text style={styles.title}>Activity Timeline</Text>
          <Text style={styles.subtitle}>{selectedChild.name}'s Recent Activities</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#E3F2FD']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Activities</Text>
            <Text style={styles.summarySubtext}>Last 7 days</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{stats.lessons}</Text>
            <Text style={styles.summaryLabel}>Lessons</Text>
            <Text style={styles.summarySubtext}>Completed</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#FCE4EC']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{stats.badges}</Text>
            <Text style={styles.summaryLabel}>Badges</Text>
            <Text style={styles.summarySubtext}>Earned</Text>
          </LinearGradient>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No recent activities</Text>
            </View>
          ) : (
          Object.keys(groupedActivities).map((date) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{date}</Text>
              {groupedActivities[date].map((activity, index) => (
                <View key={activity.id} style={styles.activityWrapper}>
                  {/* Timeline Line */}
                  <View style={styles.timelineLineContainer}>
                    <View style={styles.timelineDot} />
                    {index < groupedActivities[date].length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  {/* Activity Card */}
                  <LinearGradient
                    colors={activity.color}
                    style={styles.activityCard}
                  >
                    <View style={styles.iconCircle}>
                      <Text style={styles.activityIcon}>{activity.icon}</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          ))
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  timelineContainer: {
    paddingHorizontal: 20,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  activityWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineLineContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0A7D4F',
    elevation: 3,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#C8E6C9',
    marginVertical: 6,
  },
  activityCard: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 15,
    padding: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.95,
  },
  activityTime: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.85,
  },
});

export default ActivityTimeline;
