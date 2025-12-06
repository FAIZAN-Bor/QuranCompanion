import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, Platform } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleReset = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const profileData = { 
        name, 
        email,
        ...(profileImage && { profileImage })
      };
      const response = await userService.updateProfile(profileData);
      
      console.log('Update profile response:', response);
      
      // Update context with the returned user data
      if (updateUser && response.data && response.data.user) {
        await updateUser(response.data.user);
        
        // Also persist to AsyncStorage to preserve across app restarts
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >

      <View style={styles.profileHeader}>
                <TouchableOpacity onPress={handleImagePicker} activeOpacity={0.7}>
                  <View style={styles.imageWrapper}>
                    <Image
                      style={styles.profileImage}
                      source={profileImage ? { uri: profileImage } : require("../assests/profile.jpeg")}
                    />
                    <View style={styles.editIconContainer}>
                      <Text style={styles.editIconText}>✏️</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.textWrapper}>
                  <Text style={styles.name}>{user?.name || 'User'}</Text>
                  <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
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
      <TouchableOpacity onPress={handleReset} activeOpacity={0.8} disabled={loading}>
        <LinearGradient
          colors={['#0A7D4F', '#0F9D63', '#15B872']}
          style={styles.button}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
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
    position: 'relative',
  },
  profileImage: {
    width: 130,
    height: 130,
    resizeMode: "cover",
    borderRadius: 65,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#0A7D4F',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editIconText: {
    fontSize: 18,
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
