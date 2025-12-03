import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ScrollView, Dimensions, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';

// Import your data
import { duaData } from '../assests/data/duaData';
import { QuranData } from '../assests/data/QuranData';
import { QuidaData } from '../assests/data/QuidaData';

const { width: screenWidth } = Dimensions.get('window');

const Home = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const chartDataAnim = useRef(new Animated.Value(0)).current;

  // Animated chart data states
  const [animatedLineData, setAnimatedLineData] = React.useState([0, 0, 0, 0, 0]);
  const [animatedPieData, setAnimatedPieData] = React.useState([0, 0, 0, 0]);

  // Final values
  const finalLineData = [40, 60, 75, 50, 90];
  const finalPieData = [40, 30, 20, 10];

  useEffect(() => {
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

    // Listen to animation value changes
    const lineDataListener = chartDataAnim.addListener(({ value }) => {
      setAnimatedLineData(finalLineData.map(val => Math.round(val * value)));
      setAnimatedPieData(finalPieData.map(val => Math.round(val * value)));
    });

    return () => {
      chartDataAnim.removeListener(lineDataListener);
    };
  }, []);

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

  // Analytics dashboard cards data
  const dashboardCards = [
    { id: 1, title: 'Total Coins', value: 1200, image: require('../assests/coin.png') },
    { id: 2, title: 'Your Level', value: 'Intermediate', image: require('../assests/volume.png') },
    { id: 3, title: 'Accuracy', value: '85%', image: require('../assests/accuracy.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Section */}
        <LinearGradient
          colors={['#0A7D4F', '#0F9D63', '#15B872']}
          style={styles.profileContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={styles.profileImageContainer}>
              <Image source={require('../assests/profile.jpeg')} style={styles.profileImage} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>Farhan Akhtar</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assests/email.png')} style={styles.emailIcon} />
                <Text style={styles.profileEmail}>farhanakhtar04@gmail.com</Text>
              </View>
            </View>
          </View>

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
            onPress={() => navigation.navigate('DuaLearn', { data: duaData })}
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
                  <Text style={styles.duaBadgeText}>📖 {duaData.length} Duas Available</Text>
                </View>
              </View>
              <View style={styles.duaArrow}>
                <Text style={styles.duaArrowText}>›</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FFF5' },
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
