import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LinearGradient from 'react-native-linear-gradient';

// Validation Schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid Email Format")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login({navigation}) {
  return (
    <LinearGradient
      colors={['#E8F5E9', '#F1F8E9', '#FFF9C4']}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
           <Image style={{ alignSelf:'center', marginTop:5, marginBottom:5, width:70,height:70,borderRadius:10}} source={require('../assests/Logo.jpg')}/>
          <Text style={styles.title}>Quran Companion</Text>
          <Text style={styles.subtitle}>Login to Continue</Text>

          {/* --- Formik Form --- */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={(values) => {
              console.log("Login Values:", values);
              navigation.navigate('Home');
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                {/* Email */}
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6C8A7A"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
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
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry={true}
                />
                {errors.password && touched.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TouchableOpacity onPress={()=> navigation.navigate('ForgetPassword')}>
                  <Text style={styles.forgot}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity onPress={() => navigation.navigate('Otp')} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#0A7D4F', '#0F9D63', '#15B872']}
                    style={styles.btn}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    <Text style={styles.btnText}>Login</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Signup Redirect */}
                
                  <View style={styles.loginRow}>
                                  <Text>Already have an account? </Text>
                                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                    <Text style={styles.loginText}>SignUp</Text>
                                  </TouchableOpacity>
                                </View>
                
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

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
    color: '#666',
    textAlign: 'center',
    marginBottom: 35,
    fontWeight: '500',
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
  forgot: {
    textAlign: 'right',
    color: '#0A7D4F',
    marginBottom: 25,
    fontWeight: '700',
    fontSize: 14,
  },
  btn: {
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  signup: {
    textAlign: 'center',
    marginTop: 20,
    color: '#0A7D4F',
  },
  signupLink: {
    color: '#007F5F',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E53935',
    marginBottom: 12,
    marginLeft: 5,
    fontSize: 13,
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
