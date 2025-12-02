// DuaLearn.js
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const DuaLearn = ({ route }) => {
  const { data } = route.params;

  const renderItem = ({ item }) => (
    <LinearGradient
      colors={['#FFFFFF', '#F1F8E9']}
      style={styles.card}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.duaContainer}>
            <Text style={styles.dua}>{item.dua}</Text>
          </View>
          <Text style={styles.purpose}>✨ {item.purpose}</Text>
        </View>

        {/* Play Button */}
        <TouchableOpacity style={styles.playButton} activeOpacity={0.7}>
          <LinearGradient
            colors={['#0A7D4F', '#15B872']}
            style={styles.playGradient}
          >
            <Image style={styles.playIcon} source={require('../assests/play.png')} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
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
