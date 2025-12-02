// OtpScreen.js

import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function Otp({ navigation }) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Focus next input
      if (index < 3) {
        inputRefs.current[index + 1].focus();
      } else {
        Keyboard.dismiss(); // dismiss keyboard after last digit
      }
    } else if (text === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join('');
    console.log('Entered OTP:', enteredOtp);
    // Add your verification logic here
  };

  return (
    <LinearGradient
      colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']}
      style={styles.wrapper}
    >
      <View style={styles.container}>
         <Image style={{ alignSelf:'center', marginTop:5, marginBottom:5, width:70,height:70,borderRadius:10}} source={require('../assests/Logo.jpg')}/>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the 4-digit code sent to your phone</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              ref={(ref) => (inputRefs.current[index] = ref)}
            />
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('BottomTabNavigator')} activeOpacity={0.8}>
          <LinearGradient
            colors={['#0A7D4F', '#0F9D63', '#15B872']}
            style={styles.button}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.resend}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    elevation: 15,
    alignItems: 'center',
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 35,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginBottom: 35,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 24,
    color: '#0A7D4F',
    backgroundColor: '#FAFAFA',
    fontWeight: '700',
    elevation: 3,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    width: '85%',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  resend: {
    color: '#0A7D4F',
    fontWeight: '700',
    fontSize: 15,
  },
});
