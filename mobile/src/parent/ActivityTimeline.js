import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import parentService from '../services/parentService';

const ActivityTimeline = ({ route }) => {
  const childFromParams = route?.params?.child;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, lessons: 0, badges: 0 });
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(childFromParams || null);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
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
      const [progressRes, quizzesRes, achievementsRes] = await Promise.all([
        parentService.getChildProgress(selectedChild._id),
        parentService.getChildQuizzes(selectedChild._id),
        parentService.getChildAchievements(selectedChild._id),
      ]);

      const allActivities = [];

      // Add lessons from progress (progressRes.data is { progress, summary })
      // Use progress array which has completedAt dates
      if (progressRes.data?.progress) {
        progressRes.data.progress.forEach((lesson, index) => {
          if (lesson.completedAt) {
            allActivities.push({
              id: `lesson-${index}`,
              type: 'lesson',
              title: `Completed ${lesson.module || 'Lesson'}`,
              subtitle: `Accuracy: ${lesson.accuracy || 0}%`,
              time: formatTimeAgo(lesson.completedAt),
              date: getDateLabel(lesson.completedAt),
              timestamp: new Date(lesson.completedAt),
              icon: lesson.module === 'Quran' ? '📖' : lesson.module === 'Dua' ? '🤲' : '📚',
              color: ['#0A7D4F', '#15B872'],
            });
          }
        });
      }

      // Add quizzes (quizzesRes.data is { quizzes })
      if (quizzesRes.data?.quizzes) {
        quizzesRes.data.quizzes.forEach((quiz, index) => {
          allActivities.push({
            id: `quiz-${index}`,
            type: 'quiz',
            title: `Completed ${quiz.module || 'Quiz'}`,
            subtitle: `Score: ${quiz.score}%`,
            time: formatTimeAgo(quiz.completedAt),
            date: getDateLabel(quiz.completedAt),
            timestamp: new Date(quiz.completedAt),
            icon: '✍️',
            color: ['#7B1FA2', '#AB47BC'],
          });
        });
      }

      // Add achievements (achievementsRes.data is { achievements })
      if (achievementsRes.data?.achievements) {
        achievementsRes.data.achievements.forEach((achievement, index) => {
          allActivities.push({
            id: `badge-${index}`,
            type: 'badge',
            title: `Earned ${achievement.title}`,
            subtitle: achievement.description,
            time: formatTimeAgo(achievement.earnedAt),
            date: getDateLabel(achievement.earnedAt),
            timestamp: new Date(achievement.earnedAt),
            icon: '🏆',
            color: ['#FFD700', '#FFA000'],
          });
        });
      }

      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);

      // Calculate stats
      const lessonCount = allActivities.filter(a => a.type === 'lesson').length;
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

        {/* Load More */}
        <View style={styles.loadMoreContainer}>
          <LinearGradient
            colors={['#0A7D4F', '#15B872']}
            style={styles.loadMoreButton}
          >
            <Text style={styles.loadMoreText}>Load More Activities</Text>
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
  loadMoreContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default ActivityTimeline;
