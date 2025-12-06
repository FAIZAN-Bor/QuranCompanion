import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import NotificationItem from '../component/Notificatioitem';
import LinearGradient from 'react-native-linear-gradient';
import notificationService from '../services/notificationService';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(1, 20);
      setNotifications(response.data.notifications || getMockNotifications());
    } catch (error) {
      console.error('Notifications fetch error:', error);
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getMockNotifications = () => [
  {
    id: '1',
    icon: require('../assests/bell.png'),
    title: 'New Surah Reminder',
    message: 'It’s time to continue your Surah Al-Baqarah recitation.',
    time: '2 min ago',
  },
  {
    id: '2',
    icon: require('../assests/bell.png'),
    title: 'Daily Progress',
    message: 'You completed 5 verses today. Keep going!',
    time: '10 min ago',
  },
  {
    id: '3',
    icon: require('../assests/bell.png'),
    title: 'Practice Tajweed',
    message: 'Your tajweed score improved by 20%. MashAllah!',
    time: '1 hour ago',
  },
  {
    id: '4',
    icon: require('../assests/bell.png'),
    title: 'Dua of the Day',
    message: 'Your daily dua is ready. Don’t forget to recite it.',
    time: '1 hour ago',
  },
  {
    id: '5',
    icon: require('../assests/bell.png'),
    title: 'Surah Completed',
    message: 'Congratulations! You completed Surah Al-Fatihah.',
    time: '3 hours ago',
  },
  {
    id: '6',
    icon: require('../assests/bell.png'),
    title: 'New Lesson Unlocked',
    message: 'Your Qaida Lesson 4 is now available to study.',
    time: '5 hours ago',
  },
  {
    id: '7',
    icon: require('../assests/bell.png'),
    title: 'Streak Reminder',
    message: 'You’re on a 7-day streak. Keep your Quran habit alive!',
    time: 'Yesterday',
  },
  {
    id: '8',
    icon: require('../assests/bell.png'),
    title: 'Night Reminder',
    message: 'Recite Surah Mulk before sleeping for Barakah.',
    time: 'Yesterday',
  },
  {
    id: '9',
    icon: require('../assests/bell.png'),
    title: 'Practice Recitation',
    message: 'Your AI recitation feedback for Surah Ikhlas is ready.',
    time: '2 days ago',
  },
  {
    id: '10',
    icon: require('../assests/bell.png'),
    title: 'Weekly Report',
    message: 'You recited 34 verses this week. Excellent progress!',
    time: '3 days ago',
  },
  ];

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </LinearGradient>
    );
  }


  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Notifications</Text>
        <Text style={styles.subtitle}>Stay Updated</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id || item._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View key={item.id || item._id}>
            <NotificationItem
              icon={item.icon}
              title={item.title}
              message={item.message}
              time={item.time}
            />
          </View>
        )}
      />
    </LinearGradient>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontWeight: '600',
  },
});
