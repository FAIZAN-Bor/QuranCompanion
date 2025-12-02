import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import LinearGradient from 'react-native-linear-gradient';

// Validation schema
const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required("Current password is required")
    .min(6, "Password must be at least 6 characters"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export default function ChangePasswordScreen() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (values, { resetForm }) => {
    // Call API to verify current password and update with new password
    Alert.alert("Success", "Password changed successfully!");
    resetForm();
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={{flex: 1}}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.imageWrapper}>
            <Image
              style={styles.profileImage}
              source={require("../assests/profile.jpeg")}
            />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.name}>Farhan Akhtar</Text>
            <Text style={styles.email}>m.farhanAkhtar04@gmail.com</Text>
          </View>
        </View>

        {/* Change Password Form */}
        <Text style={styles.title}>Change Password</Text>

        <Formik
          initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
          validationSchema={ChangePasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                secureTextEntry={!showCurrent}
                onChangeText={handleChange("currentPassword")}
                onBlur={handleBlur("currentPassword")}
                value={values.currentPassword}
                placeholderTextColor="#566360ff"
              />
              {errors.currentPassword && touched.currentPassword && (
                <Text style={styles.error}>{errors.currentPassword}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry={!showNew}
                onChangeText={handleChange("newPassword")}
                onBlur={handleBlur("newPassword")}
                value={values.newPassword}
                placeholderTextColor="#566360ff"
              />
              {errors.newPassword && touched.newPassword && (
                <Text style={styles.error}>{errors.newPassword}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirm}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                value={values.confirmPassword}
                placeholderTextColor="#566360ff"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#0A7D4F', '#0F9D63', '#15B872']}
                  style={styles.button}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                >
                  <Text style={styles.buttonText}>Reset Password</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageWrapper: {
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#0A7D4F",
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 15,
    elevation: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileImage: {
    width: 130,
    height: 130,
    resizeMode: "cover",
    borderRadius: 65,
  },
  textWrapper: {
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0A7D4F",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 25,
    color: "#0A7D4F",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    elevation: 3,
  },
  button: {
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 15,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 1,
  },
  error: {
    color: "#E53935",
    marginBottom: 12,
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
  },
});
