import { View, FlatList, StyleSheet, Text } from 'react-native';
import React from 'react';
import NotificationItem from '../component/Notificatioitem';
import LinearGradient from 'react-native-linear-gradient';

const NotificationScreen = () => {

const notifications = [
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            icon={item.icon}
            title={item.title}
            message={item.message}
            time={item.time}
          />
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
