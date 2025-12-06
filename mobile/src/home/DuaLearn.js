// DuaLearn.js
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import contentService from '../services/contentService';

const DuaLearn = ({ route, navigation }) => {
  const [duaData, setDuaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const category = route.params?.category || 'daily';

  useEffect(() => {
    fetchDuas();
  }, []);

  const fetchDuas = async () => {
    try {
      setLoading(true);
      const response = await contentService.getDuas({ category });
      setDuaData(response.data?.content || []);
    } catch (error) {
      console.error('Dua fetch error:', error);
      Alert.alert('Error', 'Failed to load Duas. Using local data.');
      // Fallback to route params if API fails
      if (route.params?.data) {
        setDuaData(route.params.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDuas();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={{flex: 1}}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading Duas...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('DuaDetail', { dua: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F1F8E9']}
        style={styles.card}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.nameArabic}>{item.nameArabic}</Text>
            <View style={styles.duaContainer}>
              <Text style={styles.dua} numberOfLines={2}>{item.arabicText}</Text>
            </View>
            <Text style={styles.purpose}>✨ {item.category}</Text>
          </View>

          {/* Play Button */}
          <View style={styles.playButton}>
            <LinearGradient
              colors={['#0A7D4F', '#15B872']}
              style={styles.playGradient}
            >
              <Image style={styles.playIcon} source={require('../assests/play.png')} />
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={{flex: 1}}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>All Duas</Text>
          <Text style={styles.subtitle}>Daily Islamic Supplications</Text>
        </View>
        <FlatList
          data={duaData}
          renderItem={renderItem}
          keyExtractor={(item) => (item._id || item.id)?.toString() || Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DuaLearn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0A7D4F',
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontWeight: '600',
  },
  card: {
    padding: 18,
    marginBottom: 15,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 125, 79, 0.1)',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  nameArabic: {
    fontSize: 22,
    fontWeight: '700',
    color: '#143b2c',
    textAlign: 'right',
    marginBottom: 10,
  },
  duaContainer: {
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  dua: {
    fontSize: 20,
    color: '#2b624c',
    textAlign: 'right',
    lineHeight: 32,
    fontWeight: '600',
  },
  purpose: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  playButton: {
    marginLeft: 10,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
  },
  playGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
});
