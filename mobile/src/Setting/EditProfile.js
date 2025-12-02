import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import LinearGradient from 'react-native-linear-gradient';

const EditProfile = () => {
  const [name, setName] = useState("Farhan Akhtar");
  const [email, setEmail] = useState("m.farhanAkhtar04@gmail.com");

  const handleReset = () => {
    if (!name || !email) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Here you can call API to update profile
    Alert.alert("Success", "Profile updated successfully!");
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >

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
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Text style={styles.cardLabel}>Name</Text>
        <Text style={styles.cardValue}>{name}</Text>
        <Text style={styles.cardLabel}>Email</Text>
        <Text style={styles.cardValue}>{email}</Text>
      </View>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Change Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Change Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Reset / Save Button */}
      <TouchableOpacity onPress={handleReset} activeOpacity={0.8}>
        <LinearGradient
          colors={['#0A7D4F', '#0F9D63', '#15B872']}
          style={styles.button}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 12,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A7D4F",
    marginTop: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    elevation: 3,
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
  button: {
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
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
});
