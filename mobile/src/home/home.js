import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ScrollView, Dimensions } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';

// Import your data
import { duaData } from '../assests/data/duaData';
import { QuranData } from '../assests/data/QuranData';
import { QuidaData } from '../assests/data/QuidaData';

const { width: screenWidth } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [40, 60, 75, 50, 90], strokeWidth: 2 }],
  };

  const pieData = [
    { name: 'Quran Lessons', population: 40, color: '#0A7D4F', legendFontColor: '#2b624c', legendFontSize: 12 },
    { name: 'Dua Lessons', population: 30, color: '#62B26F', legendFontColor: '#2b624c', legendFontSize: 12 },
    { name: 'Quaida Lessons', population: 20, color: '#A3D39C', legendFontColor: '#2b624c', legendFontSize: 12 },
    { name: 'Quiz Lessons', population: 10, color: '#DFF0D8', legendFontColor: '#2b624c', legendFontSize: 12 },
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

  const cards = [
    { id: '1', title: 'Learn Quran Lesson', image: require('../assests/quaida.png'), screen: 'Quran', data: QuranData },
    { id: '2', title: 'Learn Dua Lesson', image: require('../assests/dua.png'), screen: 'DuaLearn', data: duaData },
    { id: '3', title: 'Learn Quaida Lesson', image: require('../assests/quran.png'), screen: 'Quaida', data: QuidaData },
    { id: '4', title: 'Learn Quiz Lesson', image: require('../assests/quiz.png'), screen: 'Quiz', data: QuidaData },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { width: (screenWidth / 2) - 30 }]}
      onPress={() => navigation.navigate(item.screen, { data: item.data })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FFFFFF', '#E8F5E9']}
        style={styles.cardGradient}
      >
        <View style={styles.iconContainer}>
          <Image source={item.image} style={styles.logo} />
        </View>
        <Text style={styles.title}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

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

        {/* Pie Chart */}
        <Text style={styles.chartLabel}>Lesson Distribution (Pie Chart)</Text>
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

        {/* Line Chart */}
        <Text style={styles.chartLabel}>Weekly Progress (Line Chart)</Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{ ...chartConfig, propsForDots: { r: '6', strokeWidth: '2', stroke: '#0A7D4F', fill: '#2b624c' } }}
          bezier
          style={{ borderRadius: 16, marginVertical: 8 }}
        />

        {/* Cards Section */}
        <FlatList
          data={cards}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ marginTop: 30, paddingHorizontal: 10 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FFF5' },
  row: { justifyContent: 'space-between', marginBottom: 20 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  welcomeHighlight: {
    color: '#F57F17',
    fontSize: screenWidth * 0.06,
  },
  logo: { width: 42, height: 42, resizeMode: 'contain' },
  title: { fontSize: 13, fontWeight: '700', color: '#0A7D4F', textAlign: 'center', lineHeight: 18 },

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
