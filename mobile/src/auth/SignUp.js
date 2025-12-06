// SignUp.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validation Schema
const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Full Name is required'),

  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),

  confirmPass: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),

  role: Yup.string().required('Please select a role'),
});

const SignUp = ({ navigation }) => {
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const roleData = [
    { label: 'Child', value: 'child' },
    { label: 'Parent', value: 'parent' },
  ];

  const handleSignup = async (values) => {
    try {
      setIsLoading(true);
      const { confirmPass, ...signupData } = values; // Remove confirmPass from API call
      
      const response = await signup(signupData);
      
      // Store email and role for OTP verification
      await AsyncStorage.setItem('pendingEmail', values.email);
      await AsyncStorage.setItem('pendingRole', values.role);
      
      Alert.alert('Success', response.message || 'OTP sent to your email!');
      navigation.navigate('Otp', { email: values.email, role: values.role });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
        password: '',
        confirmPass: '',
        role: '',
      }}
      validationSchema={SignupSchema}
      onSubmit={handleSignup}
    >
      {({
        handleChange,
        handleSubmit,
        handleBlur,
        values,
        errors,
        touched,
        setFieldValue,
      }) => (
        <LinearGradient
          colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']}
          style={styles.wrapper}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
               <Image style={{ alignSelf:'center', marginTop:5, marginBottom:5, width:70,height:70,borderRadius:10}} source={require('../assests/Logo.jpg')}/>
              <Text style={styles.title}>Quran Companion</Text>
             
              <Text style={styles.subtitle}>Create Your Account</Text>

              {/* Name */}
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#6C8A7A"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
              />
              {errors.name && touched.name && (
                <Text style={styles.error}>{errors.name}</Text>
              )}

              {/* Email */}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6C8A7A"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
              />
              {errors.email && touched.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              {/* Password */}
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6C8A7A"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              {errors.password && touched.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              {/* Confirm Password */}
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#6C8A7A"
                secureTextEntry
                value={values.confirmPass}
                onChangeText={handleChange('confirmPass')}
                onBlur={handleBlur('confirmPass')}
              />
              {errors.confirmPass && touched.confirmPass && (
                <Text style={styles.error}>{errors.confirmPass}</Text>
              )}

              {/* Dropdown */}
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelected}
                data={roleData}
                labelField="label"
                valueField="value"
                placeholder="Select Role"
                value={values.role}
                onChange={(item) => setFieldValue('role', item.value)}
              />
              {errors.role && touched.role && (
                <Text style={styles.error}>{errors.role}</Text>
              )}

              {/* Submit Button */}
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
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      )}
    </Formik>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  container: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 35,
    borderRadius: 30,
    elevation: 15,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },

  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 30,
  },

  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    color: '#0A7D4F',
    fontSize: 16,
    elevation: 2,
  },

  dropdown: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },

  dropdownPlaceholder: {
    color: '#6C8A7A',
    fontSize: 16,
  },

  dropdownSelected: {
    color: '#0A7D4F',
    fontSize: 16,
    fontWeight: '700',
  },

  button: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
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

  error: {
    color: '#E53935',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 5,
    fontWeight: '600',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  loginText: {
    color: '#0A7D4F',
    fontWeight: '800',
    fontSize: 15,
  },
});
