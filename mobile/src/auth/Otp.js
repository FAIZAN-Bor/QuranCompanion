// OtpScreen.js

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Keyboard, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const { verifyOTP } = useAuth();
  const inputRefs = useRef([]);

  const maskEmail = (value) => {
    if (!value || !value.includes('@')) return value;
    const [name, domain] = value.split('@');
    if (!name) return value;
    if (name.length <= 2) return `${name[0] || '*'}***@${domain}`;
    return `${name[0]}${'*'.repeat(Math.max(2, name.length - 2))}${name[name.length - 1]}@${domain}`;
  };

  useEffect(() => {
    // Get email, role, and password reset flag from route params or AsyncStorage
    const getEmail = async () => {
      const emailParam = route.params?.email;
      const roleParam = route.params?.role || 'child';
      const isPasswordResetParam = route.params?.isPasswordReset || false;
      
      if (emailParam) {
        setEmail(emailParam);
        setUserRole(roleParam);
        setIsPasswordReset(isPasswordResetParam);
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
      Alert.alert('Error', 'Email not found. Please try again.');
      navigation.navigate(isPasswordReset ? 'ForgetPassword' : 'SignUp');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isPasswordReset) {
        // For password reset flow
        const response = await authService.verifyResetOTP(email, enteredOtp);
        
        if (response.success) {
          Alert.alert('Success', 'OTP verified! Please set your new password.');
          navigation.navigate('ResetPassword', { 
            email: email, 
            otp: enteredOtp 
          });
        }
      } else {
        // For signup verification flow
        const response = await verifyOTP(email, enteredOtp);
        
        // Clear pending email and role
        await AsyncStorage.removeItem('pendingEmail');
        await AsyncStorage.removeItem('pendingRole');
        
        Alert.alert('Success', 'Account verified successfully!');
        
        // Navigate based on user role
        if (userRole === 'parent') {
          // Parent goes directly to parent dashboard
          navigation.replace('ParentNavigator', {
            screen: 'ParentMain'
          });
        } else {
          // Child/Learner goes to survey first
          navigation.replace('LearnerSurvey');
        }
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
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <LinearGradient
              colors={['#FFFFFF', '#F6FFF8']}
              style={styles.logoShell}
            >
              <Image
                style={styles.logo}
                source={require('../assests/Logo.jpg')}
              />
            </LinearGradient>

            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the 4-digit code sent to your email address</Text>

            {email ? (
              <View style={styles.emailPill}>
                <Text style={styles.emailIcon}>📩</Text>
                <Text style={styles.emailText}>{maskEmail(email)}</Text>
              </View>
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
                  textAlign="center"
                  selectionColor="#0A7D4F"
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isLoading}
              style={styles.buttonWrap}
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

            <View style={styles.resendRow}>
              <Text style={styles.resendHint}>Didn't receive code?</Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isResending}
                activeOpacity={0.8}
                style={styles.resendButton}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color="#0A7D4F" />
                ) : (
                  <Text style={styles.resend}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.securityNote}>For your security, this code expires shortly.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  orbTop: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(10,125,79,0.13)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -70,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,235,59,0.2)',
  },
  container: {
    width: '92%',
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    elevation: 14,
    alignItems: 'center',
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  logoShell: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#5F6F66',
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: '600',
    lineHeight: 22,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#DCECD7',
    marginBottom: 24,
  },
  emailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  emailText: {
    fontSize: 14,
    color: '#0A7D4F',
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
    gap: 10,
  },
  otpInput: {
    flex: 1,
    minWidth: 56,
    maxWidth: 70,
    height: 66,
    borderWidth: 2,
    borderColor: '#E8F5E9',
    borderRadius: 16,
    fontSize: 26,
    color: '#0A7D4F',
    backgroundColor: '#FBFEFB',
    fontWeight: '800',
    elevation: 2,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  buttonWrap: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    elevation: 7,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  resendRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  resendHint: {
    color: '#708179',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  resendButton: {
    minWidth: 130,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CFE8D9',
    backgroundColor: '#F8FFF9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  resend: {
    color: '#0A7D4F',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  securityNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#7A877F',
    textAlign: 'center',
    fontWeight: '600',
  },
});
