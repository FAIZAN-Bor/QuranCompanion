import { StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 1.1;

const QuidaTaqkti = ({ navigation, route }) => {
  const { data } = route.params || {};
  const list = data?.characters;
  console.log('Received data:', data);

  if (!Array.isArray(list)) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red' }}>❌ Error: No characters found!</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => (
    <LinearGradient
      colors={['#FFFFFF', '#F1F8E9']}
      style={styles.card}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <Text style={styles.index}>#{index + 1}</Text>

      <View style={styles.characterRow}>
        <View style={{ flex: 1, alignItems: 'center' }}>
           <Text style={styles.text}>{typeof item === 'string' ? item : item.arabic || item.english}</Text>
           {item.english && (
             <Text style={styles.englishText}>{item.english}</Text>
           )}
        </View>
       
        <TouchableOpacity style={styles.playButton} activeOpacity={0.7}>
          <LinearGradient
            colors={['#0A7D4F', '#15B872']}
            style={styles.playGradient}
          >
            <Image
              source={require('../assests/play.png')}
              style={styles.playIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('QuidaDetail', { data: {item, number: index + 1} })} activeOpacity={0.8}>
        <LinearGradient
          colors={['#0A7D4F', '#15B872']}
          style={styles.practiceBtn}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Text style={styles.practiceText}>Practice (Recite) ▶</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={{flex: 1}}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>{data?.arabicName} ({data?.name})</Text>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={1}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      </View>
    </LinearGradient>
  );
};

export default QuidaTaqkti;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  card: {
    width: CARD_WIDTH,
    paddingVertical: 18,
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(10, 125, 79, 0.1)',
  },
  index: {
    fontSize: 18,
    color: '#0A7D4F',
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginBottom: 8,
  },
  characterRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '90%',
    marginVertical: 10,
  },
  text: {
    fontSize: 48,
    color: '#0A7D4F',
    fontWeight: '700',
    textAlign: 'center',
  },
  englishText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  playButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
  },
  playGradient: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  practiceBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 15,
    elevation: 5,
  },
  practiceText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
