import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { mockChildren, mockDashboardStats, mockQuickAccess } from './mockData';

const ParentDashboard = () => {
  const navigation = useNavigation();
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);

  const handleQuickAccessPress = (item) => {
    if (item.isTab) {
      // Navigate to tab within bottom tab navigator
      navigation.navigate(item.screen);
    } else {
      // Navigate to stack screen (needs to go through parent navigator)
      navigation.getParent()?.navigate(item.screen, { child: selectedChild });
    }
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <LinearGradient
          colors={['#0A7D4F', '#0F9D63', '#15B872']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
              <Text style={styles.headerTitle}>Parent Dashboard</Text>
              <Text style={styles.headerSubtitle}>Monitor your children's progress</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ParentProfile')}
              activeOpacity={0.8}
            >
              <View style={styles.profileIconContainer}>
                <Text style={styles.profileIcon}>👤</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Child List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Children</Text>
            <View style={styles.childCountBadge}>
              <Text style={styles.childCountText}>{mockChildren.length}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childList}>
            {mockChildren.map((child) => (
              <TouchableOpacity
                key={child.id}
                activeOpacity={0.8}
                onPress={() => setSelectedChild(child)}
              >
                <LinearGradient
                  colors={selectedChild.id === child.id ? ['#0A7D4F', '#15B872'] : ['#FFFFFF', '#E8F5E9']}
                  style={styles.childCard}
                >
                  <View style={styles.childImageContainer}>
                    <Image source={child.photo} style={styles.childImage} />
                  </View>
                  <Text style={[
                    styles.childName,
                    selectedChild.id === child.id && styles.childNameSelected
                  ]}>
                    {child.name}
                  </Text>
                  <Text style={[
                    styles.childLevel,
                    selectedChild.id === child.id && styles.childLevelSelected
                  ]}>
                    {child.level}
                  </Text>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${child.progress}%` }]} />
                  </View>
                  <Text style={[
                    styles.progressText,
                    selectedChild.id === child.id && styles.progressTextSelected
                  ]}>
                    {child.progress}% Complete
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            
            <LinearGradient colors={['#FFFFFF', '#E3F2FD']} style={styles.statCard}>
              <Text style={styles.statValue}>{mockDashboardStats.todayActivity} min</Text>
              <Text style={styles.statLabel}>Today's Activity</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#F1F8E9']} style={styles.statCard}>
              <Text style={styles.statValue}>{mockDashboardStats.weekPerformance}%</Text>
              <Text style={styles.statLabel}>Week Performance</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#FFEBEE']} style={styles.statCard}>
              <Text style={styles.statValue}>{mockDashboardStats.totalMistakes}</Text>
              <Text style={styles.statLabel}>Total Mistakes</Text>
            </LinearGradient>

            <LinearGradient colors={['#FFFFFF', '#FFF9C4']} style={styles.statCard}>
              <Text style={styles.statValue}>🏆</Text>
              <Text style={styles.statLabel}>{mockDashboardStats.latestAchievement}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Current Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Activity</Text>
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.activityCard}
          >
            <Text style={styles.activityTitle}>{selectedChild.name} is learning:</Text>
            <Text style={styles.activityContent}>{selectedChild.currentActivity}</Text>
            <Text style={styles.activityTime}>Last active: {mockDashboardStats.lastActive}</Text>
          </LinearGradient>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {mockQuickAccess.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleQuickAccessPress(item)}
                style={styles.quickAccessTouchable}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#E8F5E9']}
                  style={styles.quickAccessCard}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Text style={styles.quickAccessIconEmoji}>{item.icon}</Text>
                  </View>
                  <Text 
                    style={styles.quickAccessTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF9C4',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E8F5E9',
    letterSpacing: 0.2,
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 4,
  },
  profileIcon: {
    fontSize: 24,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.3,
  },
  childCountBadge: {
    backgroundColor: '#0A7D4F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
  },
  childCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  childList: {
    flexDirection: 'row',
  },
  childCard: {
    width: 180,
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: 'center',
  },
  childImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  childImage: {
    width: 50,
    height: 50,
    tintColor: '#0A7D4F',
  },
  childName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 5,
  },
  childNameSelected: {
    color: '#FFFFFF',
  },
  childLevel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
  },
  childLevelSelected: {
    color: '#E8F5E9',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF9C4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A7D4F',
  },
  progressTextSelected: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: 15,
    padding: 20,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  activityContent: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 10,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessTouchable: {
    width: '48%',
    marginBottom: 12,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    paddingVertical: 18,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  quickAccessIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF',
  },
  quickAccessIconEmoji: {
    fontSize: 30,
  },
  quickAccessTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0A7D4F',
    textAlign: 'center',
    lineHeight: 14,
    width: '100%',
  },
});

export default ParentDashboard;
