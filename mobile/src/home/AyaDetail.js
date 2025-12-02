import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const AyaDetail = ({ route }) => {
  const { data } = route.params;

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.screen}
    >
      <Text style={styles.practiceTitle}>
        Recitation Practice for <Text style={styles.ayahHighlight}>Ayah {data.number}</Text>
      </Text>

      {/* Main Rounded Container */}
      <LinearGradient
        colors={['#FFFFFF', '#E8F5E9']}
        style={styles.mainContainer}
      >

        {/* Quran Header Card */}
        <View style={styles.topCard}>
          <Text style={styles.arabicHeader}>{data.arabic}</Text>
          <Text style={styles.translationHeader}>{data.english}</Text>
        </View>

        {/* Tajweed Feedback Section */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>AI Tajweed Feedback</Text>

          {/* Feedback Bar */}
          <View style={styles.feedbackBar}>
            <View style={styles.progressFill}></View>
          </View>
        </View>

        {/* ECG Wave */}
        <Image 
          source={require('../assests/ecg.png')} 
          style={styles.ecg}
          resizeMode="contain"
        />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          
          {/* Stop Button */}
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#E53935', '#D32F2F']}
              style={styles.smallButton}
            >
              <Text style={styles.smallBtnText}>Stop</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Big Mic Button */}
          <TouchableOpacity style={styles.bigMic} activeOpacity={0.8}>
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={styles.bigMicGradient}
            >
              <Image 
                source={require('../assests/mic.png')} 
                style={styles.bigMicIcon} 
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={styles.smallButton}
            >
              <Text style={styles.smallBtnText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </LinearGradient>
    </LinearGradient>
  );
};

export default AyaDetail;


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  practiceTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  ayahHighlight: {
    color: '#F57F17',
  },

  mainContainer: {
    borderRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 25,
    elevation: 15,
    shadowColor: '#0A7D4F',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
  },

  // -----------------
  // TOP CARD
  // -----------------
  topCard: {
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
  },

  arabicHeader: {
    fontSize: 28,
    color: '#2b624c',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    lineHeight: 42,
  },

  translationHeader: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },

  // -----------------
  // FEEDBACK SECTION
  // -----------------
  feedbackContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    elevation: 6,
    marginBottom: 25,
  },

  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 15,
    textAlign: 'center',
  },

  feedbackBar: {
    height: 14,
    width: '100%',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    justifyContent: 'center',
  },

  progressFill: {
    height: 14,
    width: '45%',
    backgroundColor: '#0A7D4F',
    borderRadius: 10,
  },

  ecg: {
    width: '100%',
    height: 80,
    marginBottom: 30,
    tintColor: '#0A7D4F',
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  smallBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },

  bigMic: {
    borderRadius: 70,
    overflow: 'hidden',
    elevation: 12,
  },

  bigMicGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bigMicIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },

});

