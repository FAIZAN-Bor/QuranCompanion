// SplashScreen.js
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import LinearGradient from 'react-native-linear-gradient';

export default function Splash({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#0A7D4F', '#0F9D63', '#15B872', '#1ED760']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../assests/Logo.jpg")}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Quran Companion</Text>
      <Text style={styles.subtitle}>Your Digital Islamic Learning Partner</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0F2F1',
    textAlign: 'center',
    marginTop: 10,
  },
});
