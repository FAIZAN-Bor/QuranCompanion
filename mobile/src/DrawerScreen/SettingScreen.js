import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import CustomModal from "../Setting/CustomModal";
import LinearGradient from 'react-native-linear-gradient';

export default function SettingScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "logout" or "delete"

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    if (modalType === "logout") {
      navigation.replace("Login");
    } else if (modalType === "delete") {
      navigation.replace("SignUp");
    }
  };

  const handleOptionPress = (option) => {
    switch(option) {
      case "editProfile":
        navigation.navigate("EditProfile");
        break;
      case "changePassword":
        navigation.navigate("ChangePasswordScreen");
        break;
      case "logout":
        openModal("logout");
        break;
      case "deleteAccount":
        openModal("delete");
        break;
    }
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <Text style={styles.title}>Settings</Text>

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

      <TouchableOpacity onPress={() => handleOptionPress("editProfile")} activeOpacity={0.8}>
        <LinearGradient colors={['#FFFFFF', '#E8F5E9']} style={styles.option}>
          <Image source={require('../assests/edit.png')} style={styles.icon} />
          <Text style={styles.optionText}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ChangPasswordScreen")} activeOpacity={0.8}>
        <LinearGradient colors={['#FFFFFF', '#E8F5E9']} style={styles.option}>
          <Image source={require('../assests/password.png')} style={styles.icon} />
          <Text style={styles.optionText}>Change Password</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleOptionPress("logout")} activeOpacity={0.8}>
        <LinearGradient colors={['#FFFFFF', '#E8F5E9']} style={styles.option}>
          <Image source={require("../assests/logout.png")} style={styles.icon} />
          <Text style={styles.optionText}>Logout</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleOptionPress("deleteAccount")} activeOpacity={0.8}>
        <LinearGradient colors={['#E53935', '#D32F2F']} style={styles.option}>
          <Image source={require("../assests/delete.png")} style={[styles.icon, {tintColor: '#FFFFFF'}]} />
          <Text style={[styles.optionText, { color: "#fff" }]}>Delete Account</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Custom Modal */}
      <CustomModal
        visible={modalVisible}
        title={modalType === "logout" ? "Logout" : "Delete Account"}
        message={modalType === "logout" 
                  ? "Are you sure you want to logout?" 
                  : "This action cannot be undone. Continue?"}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleConfirm}
        confirmText={modalType === "logout" ? "Yes, Logout" : "Delete"}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 20 },
  title: { fontSize: 32, fontWeight: "900", marginBottom: 30, color: "#0A7D4F", textAlign: 'center', letterSpacing: 0.5 },
  profileHeader: { alignItems: "center", marginBottom: 30 },
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
  profileImage: { width: 130, height: 130, resizeMode: "cover", borderRadius: 65 },
  textWrapper: { alignItems: "center" },
  name: { fontSize: 22, fontWeight: "900", color: "#0A7D4F" },
  email: { fontSize: 14, color: "#666", marginTop: 6, fontWeight: '600' },
  option: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 15, 
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  optionText: { fontSize: 17, fontWeight: "800", color: "#0A7D4F", flex: 1 },
  icon: { width: 24, height: 24, marginRight: 15, tintColor: '#0A7D4F' }
});
