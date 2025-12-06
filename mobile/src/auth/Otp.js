// OtpScreen.js

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Keyboard, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Otp({ navigation, route }) {
  const [otp, setOtp] = useState(['', '', '', '']); // 4 digits for OTP
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('child');
  const { verifyOTP } = useAuth();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email and role from route params or AsyncStorage
    const getEmail = async () => {
      const emailParam = route.params?.email;
      const roleParam = route.params?.role || 'child';
      if (emailParam) {
        setEmail(emailParam);
        setUserRole(roleParam);
      } else {
        const storedEmail = await AsyncStorage.getItem('pendingEmail');
        const storedRole = await AsyncStorage.getItem('pendingRole');
        if (storedEmail) {
          setEmail(storedEmail);
          setUserRole(storedRole || 'child');
        }
      }
    };
    getEmail();
  }, [route.params]);

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

  const handleSubmit = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please sign up again.');
      navigation.navigate('SignUp');
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyOTP(email, enteredOtp);
      
      // Clear pending email and role
      await AsyncStorage.removeItem('pendingEmail');
      await AsyncStorage.removeItem('pendingRole');
      
      Alert.alert('Success', 'Account verified successfully!');
      
      // Navigate based on user role
      if (userRole === 'parent') {
        // Parent goes directly to parent dashboard (skip ParentLogin screen)
        navigation.replace('ParentNavigator', {
          screen: 'ParentMain'
        });
      } else {
        // Child/Learner goes to survey first
        navigation.replace('LearnerSurvey');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please sign up again.');
      return;
    }

    try {
      setIsResending(true);
      const response = await authService.resendOTP(email);
      Alert.alert('Success', 'OTP has been resent to your email');
      // Clear OTP input
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']}
      style={styles.wrapper}
    >
      <View style={styles.container}>
         <Image style={{ alignSelf:'center', marginTop:5, marginBottom:5, width:70,height:70,borderRadius:10}} source={require('../assests/Logo.jpg')}/>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the 4-digit code sent to your email</Text>
        {email ? (
          <Text style={styles.emailText}>{email}</Text>
        ) : null}

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
              editable={!isLoading}
            />
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleSubmit} 
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#0A7D4F', '#0F9D63', '#15B872']}
            style={styles.button}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
          <Text style={styles.resend}>
            {isResending ? 'Sending...' : 'Resend OTP'}
          </Text>
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
    width: '80%',
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
