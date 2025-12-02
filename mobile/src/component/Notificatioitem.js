import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const Notificationitem = ({ icon, title, message, time }) => {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#F1F8E9']}
      style={styles.container}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      
      {/* Icon */}
      <Image source={icon} style={styles.icon} />

      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>

    </LinearGradient>
  );
};

export default Notificationitem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    elevation: 6,
    marginVertical: 6,
    marginHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  icon: {
    width: 35,
    height: 35,
    marginRight: 15,
    tintColor: '#0A7D4F',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
    lineHeight: 20,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '600',
  },
});
