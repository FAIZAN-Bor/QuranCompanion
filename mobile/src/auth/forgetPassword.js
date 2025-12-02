// ForgetPassword.js

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LinearGradient from 'react-native-linear-gradient';

// Validation Schema
const ForgetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

const ForgetPassword = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']}
      style={styles.wrapper}
    >
      <View style={styles.container}>
         <Image style={{ alignSelf:'center', marginTop:5, marginBottom:5, width:70,height:70,borderRadius:10}} source={require('../assests/Logo.jpg')}/>
        <Text style={styles.title}>Quran Companion</Text>
        <Text style={styles.subtitle}>Reset Your Password</Text>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgetPasswordSchema}
          onSubmit={(values) => {
            console.log('Reset Password Email:', values.email);
            Alert.alert(
              'Password Reset',
              `A password reset link has been sent to ${values.email}`,
              [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
               placeholderTextColor="#6C8A7A"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && touched.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#0A7D4F', '#0F9D63', '#15B872']}
                  style={styles.button}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                >
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLogin}>
                  Back to <Text style={{ fontWeight: 'bold', color: '#0A7D4F' }}>Login</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </LinearGradient>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 40,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    padding: 15,
    borderRadius: 15,
    marginBottom: 8,
    color: '#0A7D4F',
    fontSize: 16,
    elevation: 2,
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
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  error: {
    color: '#E53935',
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 5,
    fontWeight: '600',
  },
  backToLogin: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
