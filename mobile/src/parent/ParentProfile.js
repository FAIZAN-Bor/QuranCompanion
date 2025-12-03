import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ParentProfile = ({ navigation }) => {
  // Mock parent data
  const parentData = {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '+92 300 1234567',
    joinedDate: 'January 2024',
    linkedChildren: [
      { id: 1, name: 'Fatima Khan', level: 12, progress: 65 },
      { id: 2, name: 'Hassan Khan', level: 8, progress: 42 },
    ],
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Navigate back to login
            navigation.navigate('ParentLogin');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddChild = () => {
    Alert.alert(
      'Add Child',
      'This feature will allow you to link another child account.',
      [{ text: 'OK' }]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
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
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#0A7D4F', '#15B872']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {parentData.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </LinearGradient>
            </View>

            <Text style={styles.profileName}>{parentData.name}</Text>
            <Text style={styles.profileEmail}>{parentData.email}</Text>

            <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
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
              <Text style={styles.infoValue}>{parentData.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Phone</Text>
              <Text style={styles.infoValue}>{parentData.phone}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Member Since</Text>
              <Text style={styles.infoValue}>{parentData.joinedDate}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Linked Children */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linked Children</Text>
            <Text style={styles.childCount}>{parentData.linkedChildren.length}</Text>
          </View>

          {parentData.linkedChildren.map((child) => (
            <LinearGradient
              key={child.id}
              colors={['#FFFFFF', '#FFF9C4']}
              style={styles.childCard}
            >
              <View style={styles.childIconContainer}>
                <LinearGradient
                  colors={['#7B1FA2', '#AB47BC']}
                  style={styles.childIcon}
                >
                  <Text style={styles.childIconText}>{child.name[0]}</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childLevel}>Level {child.level}</Text>
                <View style={styles.childProgressBar}>
                  <LinearGradient
                    colors={['#0A7D4F', '#15B872']}
                    style={[styles.childProgressFill, { width: `${child.progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.childProgressText}>{child.progress}% overall progress</Text>
              </View>

              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}

          {/* Add Child Button */}
          <TouchableOpacity onPress={handleAddChild}>
            <LinearGradient
              colors={['#1976D2', '#42A5F5']}
              style={styles.addChildButton}
            >
              <Text style={styles.addChildIcon}>➕</Text>
              <Text style={styles.addChildText}>Link Another Child</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.settingsCard}
          >
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>🔔 Notifications</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>🔒 Privacy</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>❓ Help & Support</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>ℹ️ About</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <LinearGradient
              colors={['#E53935', '#EF5350']}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
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
  },
  childIconText: {
    fontSize: 22,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
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
  settingsCard: {
    borderRadius: 15,
    padding: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingLabel: {
    fontSize: 15,
    color: '#0A7D4F',
    fontWeight: '700',
  },
  settingArrow: {
    fontSize: 24,
    color: '#0A7D4F',
    fontWeight: '300',
  },
  logoutButton: {
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
});

export default ParentProfile;
