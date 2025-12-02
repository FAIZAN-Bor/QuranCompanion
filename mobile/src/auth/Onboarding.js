import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import LinearGradient from 'react-native-linear-gradient';

const slides = [
  {
    key: 'one',
    title: 'Welcome to Quran Companion',
    text: 'Learn Qaida, Tajweed, Recitation & Duas — all with AI-powered feedback.',
    image: require('../assests/image1.png'),
    bg: '#F4FFF5',
  },
  {
    key: 'two',
    title: 'Perfect Your Recitation',
    text: 'Upload or recite your audio and get instant AI correction for every letter.',
    image: require('../assests/image1.png'),
    bg: '#F4FFF5',
  },
  {
    key: 'three',
    title: 'Grow Spiritually',
    text: 'Track your progress, earn badges, and build a strong Quran connection.',
    image: require('../assests/image1.png'),
    bg: '#F4FFF5',
  },
];

const Onboarding = ({ navigation }) => {
  const renderItem = ({ item }) => {
    return (
      <LinearGradient
        colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']}
        style={styles.slide}
      >
        <View style={styles.iconContainer}>
          <Image source={item.image} style={styles.image} />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </LinearGradient>
    );
  };

  const onDone = () => {
    navigation.replace('SignUp');
  };

  // --- Custom Buttons ---
  const renderNextButton = () => (
    <LinearGradient
      colors={['#0A7D4F', '#15B872']}
      style={styles.buttonContainer}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
    >
      <Text style={styles.buttonText}>Next →</Text>
    </LinearGradient>
  );

  const renderSkipButton = () => (
    <View style={styles.skipButton}>
      <Text style={styles.skipText}>Skip</Text>
    </View>
  );

  const renderDoneButton = () => (
    <LinearGradient
      colors={['#0A7D4F', '#15B872']}
      style={styles.buttonContainer}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
    >
      <Text style={styles.buttonText}>Get Started ✓</Text>
    </LinearGradient>
  );

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={()=>navigation.replace('SignUp')}
      renderDoneButton={renderDoneButton}
      renderNextButton={renderNextButton}
      renderSkipButton={renderSkipButton}
      showSkipButton={true}
      dotStyle={{ backgroundColor: '#B6E2C2' }}       // light green
      activeDotStyle={{ backgroundColor: '#0A7D4F' }}  // dark green
    />
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  text: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },

  // Buttons
  buttonContainer: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  skipButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  skipText: {
    color: '#0A7D4F',
    fontWeight: '700',
    fontSize: 16,
  },
});
