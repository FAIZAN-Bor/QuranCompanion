import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import contentService from '../services/contentService';

const Quaida = ({ route, navigation }) => {
  const [qaidaData, setQaidaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQaida();
  }, []);

  const fetchQaida = async () => {
    try {
      setLoading(true);
      const response = await contentService.getQaidaLessons();
      setQaidaData(response.data?.content || []);
    } catch (error) {
      console.error('Qaida fetch error:', error);
      Alert.alert('Error', 'Failed to load Qaida lessons.');
      // Fallback to route params if API fails
      if (route.params?.data) {
        setQaidaData(route.params.data);
      } else {
        setQaidaData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQaida();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading Qaida...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Quaida Lessons</Text>
        <Text style={styles.subtitle}>Learn Arabic Alphabet</Text>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {qaidaData && qaidaData.length > 0 ? qaidaData.map((item) => (
        <TouchableOpacity
          key={item._id || item.id}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('QuidaTaqkti', { data: item })}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.card}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <View style={styles.row}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.arabicName}>{item.nameArabic}</Text>
            </View>
            <Text style={styles.taqti}>
              📖 {item.characters?.length || 0} Characters
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Qaida lessons available</Text>
        </View>
      )}
      </ScrollView>
    </LinearGradient>
  );
};

export default Quaida;

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
    marginVertical: 10,
    padding: 18,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 125, 79, 0.1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A7D4F',
  },
  arabicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2b624c',
  },
  taqti: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
