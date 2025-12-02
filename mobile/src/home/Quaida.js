import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const Quaida = ({ route, navigation }) => {
  const { data } = route.params; // receiving quaida data array

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Quaida Lessons</Text>
        <Text style={styles.subtitle}>Learn Arabic Alphabet</Text>
      </View>
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
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
              <Text style={styles.arabicName}>{item.arabicName}</Text>
            </View>
            <Text style={styles.taqti}>
              📖 Characters: <Text style={{ fontWeight: '800' }}>{item.characters.length}</Text>
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );
};

export default Quaida;

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
});
