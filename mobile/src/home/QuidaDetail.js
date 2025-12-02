import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const AyaDetail = ({ route }) => {
  const { data } = route.params;
  console.log(data);

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.screen}
    >
      <Text style={{ fontSize: 28, fontWeight: '900', color: '#0A7D4F', textAlign: 'center', marginBottom: 20, letterSpacing: 0.5 }}>
        Recitation Practice
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#666', textAlign: 'center', marginBottom: 20 }}>
        Character {data.number}
      </Text>

      {/* Main Rounded Container */}
      <LinearGradient
        colors={['#FFFFFF', '#E8F5E9']}
        style={styles.mainContainer}
      >

        {/* Quran Header Card */}
        <LinearGradient
          colors={['#FFF9C4', '#FFF59D']}
          style={styles.topCard}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <Text style={styles.arabicHeader}>{data.item.arabic}</Text>
          <Text style={styles.translationHeader}>{data.item.english}</Text>
        </LinearGradient>

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
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.smallBtnText}>Stop</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Big Mic Button */}
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#0A7D4F', '#0F9D63', '#15B872']}
              style={styles.bigMic}
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
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
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

  mainContainer: {
    borderRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#0A7D4F',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },

  // -----------------
  // TOP CARD
  // -----------------
  topCard: {
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 6,
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  arabicHeader: {
    fontSize: 40,
    color: '#D84315',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '900',
  },

  translationHeader: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
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
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 15,
    textAlign: 'center',
  },

  feedbackBar: {
    height: 12,
    width: '100%',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    justifyContent: 'center',
  },

  progressFill: {
    height: 12,
    width: '45%', // dummy progress
    backgroundColor: '#0A7D4F',
    borderRadius: 10,
  },

  // ECG SECTION
  ecg: {
    width: '100%',
    height: 80,
    marginBottom: 30,
    tintColor: '#0A7D4F',
    opacity: 0.7,
  },

  // -----------------
  // ACTION BUTTONS
  // -----------------
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallButton: {
    width: 80,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  smallBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // BIG MIC BUTTON
  bigMic: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A7D4F',
    shadowRadius: 12,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  bigMicIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },

});

