import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import React, { useState } from "react";
import CustomModal from "../Setting/CustomModal";
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import parentService from '../services/parentService';
import userService from '../services/userService';

export default function SettingScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "logout" or "delete" or "linkParent"
  const [linkCode, setLinkCode] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
    if (type === "linkParent") {
      setLinkCode("");
      setLinkError("");
    }
  };

  const handleConfirm = async () => {
    if (actionLoading) return;

    if (modalType === "linkParent") {
      handleLinkToParent();
      return;
    }

    setModalVisible(false);

    try {
      setActionLoading(true);

      if (modalType === "logout") {
        await logout();
        navigation.replace("Login");
      } else if (modalType === "delete") {
        await userService.deleteAccount();
        await logout().catch(() => null);
        navigation.replace("SignUp");
      }
    } catch (error) {
      Alert.alert(
        'Action Failed',
        error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkToParent = async () => {
    if (!linkCode || linkCode.length !== 6) {
      setLinkError("Please enter a valid 6-character code");
      return;
    }

    try {
      setLinkLoading(true);
      setLinkError("");
      const response = await parentService.linkToParent(linkCode);
      setModalVisible(false);
      alert("Success! You have been linked to your parent's account.");
    } catch (error) {
      const msg = error?.message || "Invalid or expired link code";
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connect')) {
        setLinkError('Cannot reach server. Make sure backend is running and phone/emulator is on the same network.');
      } else {
        setLinkError(msg);
      }
    } finally {
      setLinkLoading(false);
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
      case "linkParent":
        openModal("linkParent");
        break;
      case "logout":
        openModal("logout");
        break;
      case "deleteAccount":
        openModal("delete");
        break;
    }
  };

  // Check if user is a child (learner) - only show link parent option for children
  const isLearner = user?.role === 'child' || !user?.role || user?.role !== 'parent';

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileHeader}>
        <View style={styles.imageWrapper}>
          {user?.profileImage ? (
            <Image
              style={styles.profileImage}
              source={{ uri: user.profileImage }}
            />
          ) : (
            <View style={[styles.profileImage, styles.initialsContainer]}>
              <Text style={styles.initialsText}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
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

      {/* Link to Parent - Only show for learners */}
      {isLearner && (
        <TouchableOpacity onPress={() => handleOptionPress("linkParent")} activeOpacity={0.8}>
          <LinearGradient colors={['#FFFFFF', '#E3F2FD']} style={styles.option}>
            <Text style={[styles.icon, { fontSize: 24, marginRight: 15 }]}>👨‍👧</Text>
            <Text style={styles.optionText}>Link to Parent</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

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

      {/* Custom Modal for Logout/Delete */}
      {(modalType === "logout" || modalType === "delete") && (
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
      )}

      {/* Link to Parent Modal */}
      {modalType === "linkParent" && modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.linkModal}>
            <Text style={styles.linkModalTitle}>Link to Parent</Text>
            <Text style={styles.linkModalSubtitle}>
              Enter the 6-character code your parent shared with you
            </Text>
            
            <TextInput
              style={styles.linkCodeInput}
              placeholder="ABC123"
              placeholderTextColor="#6C8A7A"
              value={linkCode}
              onChangeText={setLinkCode}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            
            {linkError ? (
              <Text style={styles.linkError}>{linkError}</Text>
            ) : null}
            
            <View style={styles.linkModalButtons}>
              <TouchableOpacity 
                style={styles.linkCancelBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.linkCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkConfirmBtn} 
                onPress={handleLinkToParent}
                disabled={linkLoading}
              >
                {linkLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.linkConfirmText}>Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 20 },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 30, color: "#0A7D4F", textAlign: 'center', letterSpacing: 0.5 },
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
  initialsContainer: {
    backgroundColor: '#0A7D4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
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
  icon: { width: 24, height: 24, marginRight: 15, tintColor: '#0A7D4F' },
  // Link to Parent Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  linkModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  linkModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 10,
  },
  linkModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  linkCodeInput: {
    borderWidth: 2,
    borderColor: '#0A7D4F',
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    width: '80%',
    marginBottom: 10,
    color: '#0A7D4F',
  },
  linkError: {
    color: '#E53935',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  linkModalButtons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
  },
  linkCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0A7D4F',
  },
  linkCancelText: {
    color: '#0A7D4F',
    fontWeight: '700',
    fontSize: 16,
  },
  linkConfirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#0A7D4F',
  },
  linkConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
