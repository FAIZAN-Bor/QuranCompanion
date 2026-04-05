import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Modal, Image, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Clipboard from '@react-native-clipboard/clipboard';
import parentService from '../services/parentService';
import userService from '../services/userService';
import authService from '../services/authService';
import { showAppToast } from '../utils/toast';
import CustomModal from '../Setting/CustomModal';

const ParentProfile = ({ navigation }) => {
  const [parentData, setParentData] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [addChildModal, setAddChildModal] = useState(false);
  const [viewChildModal, setViewChildModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  
  // Custom Modal for Logout/Delete
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState(null); // 'logout' or 'delete'
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get parent data from storage
      const userData = await authService.getUserData();
      setParentData(userData);
      setEditName(userData?.name || '');
      setEditEmail(userData?.email || '');
      
      // Get linked children
      const childrenRes = await parentService.getChildren();
      if (childrenRes.success) {
        setChildren(childrenRes.data.children || []);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    setConfirmModalType('logout');
    setConfirmModalVisible(true);
  };

  const handleDeleteAccount = () => {
    setConfirmModalType('delete');
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = async () => {
    setConfirmModalVisible(false);
    
    if (confirmModalType === 'logout') {
      try {
        await authService.logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } else if (confirmModalType === 'delete') {
      try {
        setIsSubmitting(true);
        const response = await userService.deleteAccount();
        if (response.success) {
          await authService.logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to delete account');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditProfile = async () => {
    setModalError('');
    if (!editName.trim()) {
      setModalError('Name cannot be empty');
      return;
    }
    if (!editEmail.trim()) {
      setModalError('Email cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await userService.updateProfile({ 
        name: editName.trim(),
        email: editEmail.trim()
      });
      
      if (response.success) {
        // Update local storage
        const updatedUser = { ...parentData, name: editName.trim(), email: editEmail.trim() };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setParentData(updatedUser);
        setEditProfileModal(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      setModalError(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePhoto = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'Failed to pick image');
        return;
      }

      const asset = response.assets?.[0];
      if (asset?.base64) {
        try {
          setIsSubmitting(true);
          const imageData = `data:${asset.type};base64,${asset.base64}`;
          
          const updateResponse = await userService.updateProfile({ 
            profileImage: imageData 
          });
          
          if (updateResponse.success) {
            const updatedUser = { ...parentData, profileImage: imageData };
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
            setParentData(updatedUser);
            Alert.alert('Success', 'Profile photo updated!');
          }
        } catch (error) {
          Alert.alert('Error', error.message || 'Failed to update photo');
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleCopyLinkCode = () => {
    if (linkCode) {
      Clipboard.setString(linkCode);
      showAppToast({
        type: 'success',
        title: 'Copied!',
        message: 'Link code copied to clipboard',
      });
    }
  };

  const handleAddChild = async () => {
    setModalError('');
    if (!childEmail.trim()) {
      setModalError('Please enter child email');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await parentService.addChildByEmail(childEmail.trim());
      
      if (response.success) {
        setLinkCode(response.data.linkCode);
      }
    } catch (error) {
      setModalError(error.message || 'Failed to add child');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewChild = async (childLink) => {
    setSelectedChild(childLink);
    setViewChildModal(true);
  };

  const handleUnlinkChild = (childLink) => {
    Alert.alert(
      'Unlink Child',
      `Are you sure you want to unlink ${childLink.child.name}? You can re-link them later using their email.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              await parentService.unlinkChild(childLink.child._id);
              setChildren(children.filter(c => c.child._id !== childLink.child._id));
              setViewChildModal(false);
              Alert.alert('Success', 'Child unlinked successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to unlink child');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7D4F" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A7D4F']} />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Parent Profile</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#FFFFFF', '#E3F2FD']}
            style={styles.profileCard}
          >
            <TouchableOpacity onPress={handleChangePhoto} style={styles.avatarContainer}>
              {parentData?.profileImage ? (
                <Image source={{ uri: parentData.profileImage }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={['#0A7D4F', '#15B872']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(parentData?.name)}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraIconText}>📷</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.profileName}>{parentData?.name || 'Parent'}</Text>
            <Text style={styles.profileEmail}>{parentData?.email || ''}</Text>

            <TouchableOpacity onPress={() => {
              setModalError('');
              setEditProfileModal(true)
            }} style={styles.editButton}>
              <LinearGradient
                colors={['#0A7D4F', '#15B872']}
                style={styles.editButtonGradient}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.infoCard}
          >
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Email</Text>
              <Text style={styles.infoValue}>{parentData?.email || 'Not set'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Role</Text>
              <Text style={styles.infoValue}>Parent</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Linked Children */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linked Children</Text>
            <Text style={styles.childCount}>{children.length}</Text>
          </View>

          {children.length === 0 ? (
            <LinearGradient
              colors={['#FFFFFF', '#F1F8E9']}
              style={styles.emptyChildCard}
            >
              <Text style={styles.emptyIcon}>👨‍👧‍👦</Text>
              <Text style={styles.emptyText}>No children linked yet</Text>
              <Text style={styles.emptySubtext}>Add a child using their email address</Text>
            </LinearGradient>
          ) : (
            children.map((childLink) => (
              <TouchableOpacity 
                key={childLink.child._id} 
                onPress={() => handleViewChild(childLink)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#FFF9C4']}
                  style={styles.childCard}
                >
                  <View style={styles.childIconContainer}>
                    {childLink.child.profileImage ? (
                      <Image 
                        source={{ uri: childLink.child.profileImage }}
                        style={styles.childProfileImage}
                      />
                    ) : (
                      <LinearGradient
                        colors={['#7B1FA2', '#AB47BC']}
                        style={styles.childIcon}
                      >
                        <Text style={styles.childIconText}>{getInitials(childLink.child.name)}</Text>
                      </LinearGradient>
                    )}
                  </View>
                  
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{childLink.child.name}</Text>
                    <Text style={styles.childLevel}>{childLink.child.currentLevel || 'Beginner'}</Text>
                    <View style={styles.childProgressBar}>
                      <LinearGradient
                        colors={['#0A7D4F', '#15B872']}
                        style={[styles.childProgressFill, { width: `${childLink.child.accuracy || 0}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={styles.childProgressText}>{childLink.child.accuracy || 0}% accuracy</Text>
                  </View>

                  <View style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View ›</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}

          {/* Add Child Button */}
          <TouchableOpacity onPress={() => {
            setModalError('');
            setChildEmail('');
            setLinkCode('');
            setAddChildModal(true);
          }}>
            <LinearGradient
              colors={['#1976D2', '#42A5F5']}
              style={styles.addChildButton}
            >
              <Text style={styles.addChildIcon}>➕</Text>
              <Text style={styles.addChildText}>Link Another Child</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <LinearGradient
              colors={['#FFB74D', '#F57C00']}
              style={styles.actionButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleDeleteAccount} style={{ marginTop: 15 }}>
            <LinearGradient
              colors={['#E53935', '#D32F2F']}
              style={styles.actionButton}
            >
              <Text style={styles.logoutText}>Delete Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />

      </ScrollView>

      {/* Custom Modal for Logout/Delete Confirmation */}
      {(confirmModalType === "logout" || confirmModalType === "delete") && (
        <CustomModal
          visible={confirmModalVisible}
          title={confirmModalType === "logout" ? "Logout" : "Delete Account"}
          message={confirmModalType === "logout" 
                    ? "Are you sure you want to logout?" 
                    : "This action cannot be undone. Continue?"}
          onCancel={() => setConfirmModalVisible(false)}
          onConfirm={handleConfirmAction}
          confirmText={confirmModalType === "logout" ? "Yes, Logout" : "Delete"}
        />
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setEditProfileModal(false);
          setModalError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {modalError ? (
              <Text style={styles.inlineError}>{modalError}</Text>
            ) : null}
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor="#6C8A7A"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter your email"
              placeholderTextColor="#6C8A7A"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setEditProfileModal(false);
                  setModalError('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleEditProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Child Modal */}
      <Modal
        visible={addChildModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setAddChildModal(false);
          setChildEmail('');
          setLinkCode('');
          setModalError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{linkCode ? "Link Code Generated!" : "Add Child"}</Text>
            
            {modalError ? (
              <Text style={styles.inlineError}>{modalError}</Text>
            ) : null}

            {linkCode ? (
              <View style={styles.linkCodeContainer}>
                <Text style={styles.linkCodeLabel}>Your Link Code:</Text>
                
                <TouchableOpacity activeOpacity={0.7} onPress={handleCopyLinkCode} style={styles.linkCodeTouchBox}>
                  <Text style={styles.linkCodeValueText}>{linkCode}</Text>
                  <Text style={styles.linkCodeCopyIcon}>📋</Text>
                </TouchableOpacity>
                <Text style={styles.linkCodeHint}>
                  Share this code with your child. They must enter it in their app to link their account. The code expires in 24 hours. (Tap code to copy)
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  Enter your child's email address to generate a link code
                </Text>
                <Text style={styles.inputLabel}>Child's Email</Text>
                <TextInput
                  style={styles.input}
                  value={childEmail}
                  onChangeText={setChildEmail}
                  placeholder="child@example.com"
                  placeholderTextColor="#6C8A7A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              {linkCode ? (
                <TouchableOpacity 
                  style={[styles.saveButton, { flex: 1 }]}
                  onPress={() => {
                    setAddChildModal(false);
                    setChildEmail('');
                    setLinkCode('');
                    setModalError('');
                  }}
                >
                  <Text style={styles.saveButtonText}>Done</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setAddChildModal(false);
                      setChildEmail('');
                      setModalError('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleAddChild}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Generate Code</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* View Child Modal */}
      <Modal
        visible={viewChildModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setViewChildModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Child Details</Text>
            
            {selectedChild && (
              <>
                <View style={styles.childDetailRow}>
                  <Text style={styles.childDetailLabel}>Name</Text>
                  <Text style={styles.childDetailValue}>{selectedChild.child.name}</Text>
                </View>
                
                <View style={styles.childDetailRow}>
                  <Text style={styles.childDetailLabel}>Email</Text>
                  <Text style={styles.childDetailValue}>{selectedChild.child.email}</Text>
                </View>
                
                <View style={styles.childDetailRow}>
                  <Text style={styles.childDetailLabel}>Level</Text>
                  <Text style={styles.childDetailValue}>{selectedChild.child.currentLevel || 'Beginner'}</Text>
                </View>
                
                <View style={styles.childDetailRow}>
                  <Text style={styles.childDetailLabel}>Accuracy</Text>
                  <Text style={styles.childDetailValue}>{selectedChild.child.accuracy || 0}%</Text>
                </View>
                
                <View style={styles.childDetailRow}>
                  <Text style={styles.childDetailLabel}>Coins</Text>
                  <Text style={styles.childDetailValue}>🪙 {selectedChild.child.coins || 0}</Text>
                </View>
                
                <View style={styles.childDetailRow}>
                  <Text style={styles.childDetailLabel}>Streak</Text>
                  <Text style={styles.childDetailValue}>🔥 {selectedChild.child.streakDays || 0} days</Text>
                </View>
                
                <View style={styles.childDetailRow}>
                  <Text style={styles.childDetailLabel}>Linked Since</Text>
                  <Text style={styles.childDetailValue}>{formatDate(selectedChild.linkedAt)}</Text>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.unlinkButton}
                onPress={() => handleUnlinkChild(selectedChild)}
              >
                <Text style={styles.unlinkButtonText}>Unlink Child</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setViewChildModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  profileCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cameraIconText: {
    fontSize: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 20,
  },
  editButton: {
    width: '80%',
  },
  editButtonGradient: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  infoCard: {
    borderRadius: 15,
    padding: 20,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '700',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    color: '#0A7D4F',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8F5E9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  childCount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A7D4F',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyChildCard: {
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A7D4F',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#666',
  },
  childCard: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
  },
  childIconContainer: {
    marginRight: 15,
  },
  childIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    overflow: 'hidden',
  },
  childProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  childIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 4,
  },
  childLevel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    marginBottom: 8,
  },
  childProgressBar: {
    height: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  childProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  childProgressText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#0A7D4F',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 2,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    padding: 18,
    marginTop: 5,
    elevation: 6,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addChildIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  addChildText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 30,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  inlineError: {
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  linkCodeContainer: {
    backgroundColor: '#F1F8E9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  linkCodeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A7D4F',
    marginBottom: 10,
  },
  linkCodeTouchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    padding: 15,
    width: '100%',
    marginBottom: 15,
  },
  linkCodeValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    letterSpacing: 2,
    marginRight: 10,
  },
  linkCodeCopyIcon: {
    fontSize: 20,
  },
  linkCodeHint: {
    fontSize: 13,
    color: '#388E3C',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A7D4F',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0A7D4F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unlinkButton: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  unlinkButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#0A7D4F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  childDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  childDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  childDetailValue: {
    fontSize: 14,
    color: '#0A7D4F',
    fontWeight: '800',
  },
});

export default ParentProfile;
