import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ParentLogin = ({ navigation }) => {
  const [isParentMode, setIsParentMode] = useState(true);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const handleLogin = (values) => {
    console.log('Parent Login:', values);
    // Navigate to Parent Main (Bottom Tab Navigator)
    navigation.navigate('ParentMain');
  };

  return (
    <LinearGradient
      colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Image style={{ alignSelf:'center', marginTop:5, marginBottom:5, width:70,height:70,borderRadius:10}} source={require('../assests/Logo.jpg')}/>
          <Text style={styles.title}>Quran Companion</Text>
          <Text style={styles.subtitle}>Parent Login</Text>

          {/* --- Formik Form --- */}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                {/* Email */}
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6C8A7A"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && touched.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Password */}
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#6C8A7A"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={true}
                />
                {errors.password && touched.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TouchableOpacity onPress={()=> navigation.navigate('ForgetPassword')}>
                  <Text style={styles.forgot}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#0A7D4F', '#0F9D63', '#15B872']}
                    style={styles.btn}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    <Text style={styles.btnText}>Login as Parent</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* SignUp Redirect */}
                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupLink}>SignUp</Text>
                  </TouchableOpacity>
                </View>

                {/* Switch to Learner Login */}
                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>Not a parent? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.switchLink}>Login as Learner</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

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
    padding: 30,
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
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8F5E9',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 15,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    color: '#E53935',
    marginBottom: 12,
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
  },
  forgot: {
    color: '#0A7D4F',
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '700',
    fontSize: 14,
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  signupLink: {
    color: '#0A7D4F',
    fontWeight: '800',
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
  },
  switchText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  switchLink: {
    color: '#1976D2',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default ParentLogin;
