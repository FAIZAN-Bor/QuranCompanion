import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ActivityTimeline = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child' } };

  const activities = [
    {
      id: 1,
      type: 'lesson',
      title: 'Completed Qaida Lesson 15',
      subtitle: 'Accuracy: 92%',
      time: '2 hours ago',
      date: 'Today',
      icon: '📚',
      color: ['#0A7D4F', '#15B872'],
    },
    {
      id: 2,
      type: 'recording',
      title: 'Recorded Surah Al-Ikhlas',
      subtitle: 'Duration: 45 seconds',
      time: '5 hours ago',
      date: 'Today',
      icon: '🎤',
      color: ['#1976D2', '#42A5F5'],
    },
    {
      id: 3,
      type: 'badge',
      title: 'Earned Daily Streak Badge',
      subtitle: '7 days consecutive practice',
      time: '8 hours ago',
      date: 'Today',
      icon: '🔥',
      color: ['#E53935', '#EF5350'],
    },
    {
      id: 4,
      type: 'quiz',
      title: 'Completed Tajweed Quiz',
      subtitle: 'Score: 85%',
      time: 'Yesterday at 6:30 PM',
      date: 'Yesterday',
      icon: '✍️',
      color: ['#7B1FA2', '#AB47BC'],
    },
    {
      id: 5,
      type: 'lesson',
      title: 'Completed Quran Lesson 8',
      subtitle: 'Accuracy: 88%',
      time: 'Yesterday at 3:15 PM',
      date: 'Yesterday',
      icon: '📖',
      color: ['#0A7D4F', '#15B872'],
    },
    {
      id: 6,
      type: 'recording',
      title: 'Recorded Dua After Wudu',
      subtitle: 'Duration: 28 seconds',
      time: 'Yesterday at 10:00 AM',
      date: 'Yesterday',
      icon: '🎤',
      color: ['#1976D2', '#42A5F5'],
    },
    {
      id: 7,
      type: 'badge',
      title: 'Earned Perfect Recitation Badge',
      subtitle: '100% accuracy achieved',
      time: '2 days ago at 4:20 PM',
      date: '2 days ago',
      icon: '🏆',
      color: ['#FFD700', '#FFA000'],
    },
    {
      id: 8,
      type: 'lesson',
      title: 'Completed Dua Lesson 5',
      subtitle: 'Accuracy: 95%',
      time: '3 days ago at 7:45 PM',
      date: '3 days ago',
      icon: '🤲',
      color: ['#0A7D4F', '#15B872'],
    },
    {
      id: 9,
      type: 'quiz',
      title: 'Completed Qaida Quiz',
      subtitle: 'Score: 90%',
      time: '4 days ago at 5:00 PM',
      date: '4 days ago',
      icon: '✍️',
      color: ['#7B1FA2', '#AB47BC'],
    },
    {
      id: 10,
      type: 'recording',
      title: 'Recorded Surah Al-Nas',
      subtitle: 'Duration: 1 minute',
      time: '5 days ago at 6:30 PM',
      date: '5 days ago',
      icon: '🎤',
      color: ['#1976D2', '#42A5F5'],
    },
  ];

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {});

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Activity Timeline</Text>
          <Text style={styles.subtitle}>{child.name}'s Recent Activities</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#E3F2FD']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>10</Text>
            <Text style={styles.summaryLabel}>Activities</Text>
            <Text style={styles.summarySubtext}>Last 7 days</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>5</Text>
            <Text style={styles.summaryLabel}>Lessons</Text>
            <Text style={styles.summarySubtext}>Completed</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#FCE4EC']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>2</Text>
            <Text style={styles.summaryLabel}>Badges</Text>
            <Text style={styles.summarySubtext}>Earned</Text>
          </LinearGradient>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {Object.keys(groupedActivities).map((date) => (
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
          ))}
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
