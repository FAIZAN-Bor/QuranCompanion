import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ScrollView, Dimensions, Animated, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import progressService from '../services/progressService';
import achievementService from '../services/achievementService';

const { width: screenWidth } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const { user } = useAuth();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const chartDataAnim = useRef(new Animated.Value(0)).current;

  // Animated chart data states
  const [animatedLineData, setAnimatedLineData] = React.useState([0, 0, 0, 0, 0]);
  const [animatedPieData, setAnimatedPieData] = React.useState([0, 0, 0, 0]);

  // Final values - will be updated from API (use refs to avoid stale closure in animation listener)
  const [finalLineData, setFinalLineData] = React.useState([1, 1, 1, 1, 1]);
  const [finalPieData, setFinalPieData] = React.useState([1, 1, 1, 1]);
  const finalLineDataRef = useRef([1, 1, 1, 1, 1]);
  const finalPieDataRef = useRef([1, 1, 1, 1]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [dashboardRes, progressRes, coinsRes] = await Promise.all([
        userService.getDashboard(),
        progressService.getProgressSummary(),
        achievementService.getCoinStats()
      ]);
      
      console.log('Dashboard response:', dashboardRes);
      console.log('Progress response:', progressRes);
      console.log('Coins response:', coinsRes);
      
      // Set dashboard data
      setDashboardData({
        ...dashboardRes.data,
        progress: progressRes.data?.summary || progressRes.summary || {},
        coins: coinsRes.data || coinsRes
      });
      
      // Update chart data if available from progress
      const progressData = progressRes.data?.summary || progressRes.summary || {};
      
      // Map weeklyProgress from API format [{date, lessonsCompleted, accuracy}] to array of numbers
      if (progressData.weeklyProgress && Array.isArray(progressData.weeklyProgress)) {
        // Take last 5 days or pad with zeros if less
        const weeklyData = progressData.weeklyProgress.map(day => day.lessonsCompleted || 0);
        // Ensure we have at least 5 values, take last 5 if more
        const last5Days = weeklyData.slice(-5);
        while (last5Days.length < 5) {
          last5Days.unshift(0); // Pad with zeros at the beginning
        }
        // Ensure no zero values for chart display (use 1 as minimum)
        const chartData = last5Days.map(val => Math.max(val, 1));
        setFinalLineData(chartData);
        finalLineDataRef.current = chartData; // Update ref for animation
        console.log('Weekly progress chart data:', chartData);
      }
      
      // Update pie chart data - map from {Quran: {completed, total}} to array of completed counts
      if (progressData.lessonsByType) {
        const typeData = progressData.lessonsByType;
        const pieValues = [
          typeData.Quran?.completed || typeData.Quran || 0,
          typeData.Dua?.completed || typeData.Dua || 0,
          typeData.Qaida?.completed || typeData.Qaida || 0,
          0 // Quiz - not tracked separately in lessonsByType
        ];
        // Ensure at least some values for pie chart display
        const hasSomeData = pieValues.some(v => v > 0);
        const finalPieValues = hasSomeData ? pieValues.map(v => Math.max(v, 1)) : [1, 1, 1, 1];
        setFinalPieData(finalPieValues);
        finalPieDataRef.current = finalPieValues; // Update ref for animation
        console.log('Pie chart data:', pieValues);
      }
      
      // Animate charts
      animateCharts();
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      Alert.alert('Info', 'Using sample data. Complete lessons to see your real analytics!');
      // Still animate with default values
      animateCharts();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const animateCharts = () => {
    // Animate charts on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(chartDataAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();

    // Listen to animation value changes - use refs to get current values
    const lineDataListener = chartDataAnim.addListener(({ value }) => {
      setAnimatedLineData(finalLineDataRef.current.map(val => Math.round(val * value)));
      setAnimatedPieData(finalPieDataRef.current.map(val => Math.round(val * value)));
    });

    return () => {
      chartDataAnim.removeListener(lineDataListener);
    };
  };

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: animatedLineData.map(val => val || 1), strokeWidth: 2 }],
  };

  const pieData = [
    { name: 'Quran Lessons', population: animatedPieData[0] || 1, color: '#0A7D4F', legendFontColor: '#2b624c', legendFontSize: 12 },
    { name: 'Dua Lessons', population: animatedPieData[1] || 1, color: '#62B26F', legendFontColor: '#2b624c', legendFontSize: 12 },
    { name: 'Quaida Lessons', population: animatedPieData[2] || 1, color: '#A3D39C', legendFontColor: '#2b624c', legendFontSize: 12 },
    { name: 'Quiz Lessons', population: animatedPieData[3] || 1, color: '#DFF0D8', legendFontColor: '#2b624c', legendFontSize: 12 },
  ];

  const chartConfig = {
    backgroundColor: '#d0dad2ff',
    backgroundGradientFrom: '#f4fff5',
    backgroundGradientTo: '#f4fff5',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(43, 98, 76, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#0A7D4F' },
  };

  // Analytics dashboard cards data - use real data from API
  const dashboardCards = [
    { 
      id: 1, 
      title: 'Total Coins', 
      value: dashboardData?.coins?.currentBalance || 0, 
      image: require('../assests/coin.png') 
    },
    { 
      id: 2, 
      title: 'Your Level', 
      value: dashboardData?.progress?.currentLevel || user?.currentLevel || 'Beginner', 
      image: require('../assests/volume.png') 
    },
    { 
      id: 3, 
      title: 'Accuracy', 
      value: dashboardData?.progress?.accuracy ? `${Math.round(dashboardData.progress.accuracy)}%` : '0%', 
      image: require('../assests/accuracy.png') 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {loading && !dashboardData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
        >
        {/* Profile Section */}
        <LinearGradient
          colors={['#0A7D4F', '#0F9D63', '#15B872']}
          style={styles.profileContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileImageContainer}>
              <Image source={user?.profileImage ? { uri: user.profileImage } : require('../assests/profile.jpeg')} style={styles.profileImage} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assests/email.png')} style={styles.emailIcon} />
                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('NotificationScreen')}>
            <Image source={require('../assests/bell1.png')} style={styles.rightIcon} />
          </TouchableOpacity>
        </LinearGradient>
        <LinearGradient
          colors={['#FFF9C4', '#FFF59D']}
          style={styles.welcomeBanner}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Text style={styles.welcomeText}>
            <Text style={styles.welcomeHighlight}>Welcome</Text> to Quran Companion
          </Text>
        </LinearGradient>

        {/* Analytics Section moved to Home */}
        <Text style={styles.sectionHeader}>Analytics</Text>
        {/* Analytics Dashboard Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
          {dashboardCards.map((card) => (
            <LinearGradient key={card.id} colors={['#FFFFFF', '#E8F5E9']} style={styles.metricCard}>
              <Image source={card.image} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
            </LinearGradient>
          ))}
        </ScrollView>
        <Text style={styles.chartLabel}>Lesson Distribution</Text>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          }}
        >
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={{ borderRadius: 16, marginVertical: 8 }}
          />
        </Animated.View>

        <Text style={styles.chartLabel}>Weekly Progress</Text>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          }}
        >
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{ ...chartConfig, propsForDots: { r: '6', strokeWidth: '2', stroke: '#0A7D4F', fill: '#2b624c' } }}
            bezier
            style={{ borderRadius: 16, marginVertical: 8 }}
          />
        </Animated.View>

        {/* Continue Progress Section */}
        <TouchableOpacity 
          style={styles.continueCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ProgressMap')}
        >
          <LinearGradient
            colors={['#0A7D4F', '#10B981']}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../assests/analysis.png')} style={styles.continueIcon} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.continueTitle}>Continue Your Progress</Text>
                <Text style={styles.continueSubtitle}>🚀 View your learning journey</Text>
              </View>
              <View style={styles.continueArrow}>
                <Text style={styles.continueArrowText}>→</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Dua Lesson Banner */}
        <View style={styles.duaSection}>
          <Text style={styles.sectionHeader}>Daily Practice</Text>
          <TouchableOpacity
            style={styles.duaBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('DuaLearn')}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F0FDF4']}
              style={styles.duaBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.duaIconContainer}>
                <Image source={require('../assests/dua.png')} style={styles.duaIcon} />
              </View>
              <View style={styles.duaContent}>
                <Text style={styles.duaTitle}>Learn Essential Duas</Text>
                <Text style={styles.duaSubtitle}>Master daily prayers and supplications</Text>
                <View style={styles.duaBadge}>
                  <Text style={styles.duaBadgeText}>📖 Islamic Duas</Text>
                </View>
              </View>
              <View style={styles.duaArrow}>
                <Text style={styles.duaArrowText}>›</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FFF5' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FFF5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  welcomeBanner: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#F9A825',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: screenWidth * 0.055,
    fontWeight: '700',
    color: '#0A7D4F',
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: '800',
    color: '#0A7D4F',
  },
  welcomeHighlight: {
    color: '#F57F17',
    fontSize: screenWidth * 0.06,
  },
  continueCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueGradient: {
    padding: 18,
    borderRadius: 20,
  },
  continueIcon: { 
    width: 42, 
    height: 42, 
    resizeMode: 'contain',
    tintColor: '#FFF',
  },
  continueTitle: { 
    fontSize: 17, 
    fontWeight: '900', 
    color: '#FFF',
    marginBottom: 3,
  },
  continueSubtitle: { 
    fontSize: 13, 
    color: '#D1FAE5',
    fontWeight: '600',
  },
  continueArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueArrowText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  duaSection: {
    marginTop: 25,
    marginBottom: 20,
  },
  duaBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  duaBannerGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  duaIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0A7D4F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  duaIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#FFF',
  },
  duaContent: {
    flex: 1,
    marginLeft: 16,
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 4,
  },
  duaSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  duaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  duaBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  duaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A7D4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  duaArrowText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  cardsContainer: { flexDirection: 'row', marginTop: 8, paddingHorizontal: 20 },
  metricCard: {
    width: screenWidth * 0.42,
    marginRight: 15,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 25,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardIcon: { width: 45, height: 45, marginBottom: 12, resizeMode: 'contain', tintColor: '#0A7D4F' },
  cardTitle: { fontSize: 13, color: '#666', fontWeight: '700' },
  cardValue: { fontSize: 22, fontWeight: '900', color: '#0A7D4F', marginTop: 8 },

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  profileImageContainer: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: screenWidth * 0.09,
    padding: 3,
    marginRight: 15,
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  profileImage: { width: screenWidth * 0.15, height: screenWidth * 0.15, borderRadius: screenWidth * 0.075 },
  profileText: { flexDirection: 'column', flexShrink: 1 },
  profileName: { fontSize: screenWidth * 0.045, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  profileEmail: { fontSize: screenWidth * 0.032, color: '#E0F2F1', fontWeight: '500' },
  emailIcon: { width: screenWidth * 0.04, height: screenWidth * 0.04, marginRight: 6, resizeMode: 'contain', tintColor: '#E0F2F1' },
  notificationBtn: { 
    padding: 10, 
    borderRadius: 15, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  rightIcon: { width: screenWidth * 0.065, height: screenWidth * 0.065, resizeMode: 'contain', tintColor: '#FFFFFF' },
  chartLabel: { fontSize: screenWidth * 0.04, fontWeight: '800', color: '#0A7D4F', marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
});
