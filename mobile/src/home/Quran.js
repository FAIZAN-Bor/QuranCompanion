import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const Quran = ({ route, navigation }) => {
  const { data } = route.params;

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.surahTitle}>Quran Surah</Text>
        <Text style={styles.subtitle}>Explore the Holy Quran</Text>
      </View>

      {/* Wrap ALL surah cards in one ScrollView */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AllAya", { data: item })}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F1F8E9']}
              style={styles.surahCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <View style={styles.cardNumber}>
                <Text style={styles.numberText}>{item.id}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.englishName}>{item.name}</Text>
                  <Text style={styles.arabicName}>{item.arabicName}</Text>
                </View>
                <Text style={styles.totalAyahs}>📖 {item.totalAyahs} Ayahs</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

export default Quran;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },

  surahTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0A7D4F",
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    fontWeight: "600",
  },

  surahCard: {
    flexDirection: 'row',
    padding: 18,
    marginBottom: 15,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#0A7D4F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 125, 79, 0.1)',
  },

  cardNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0A7D4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 4,
  },

  numberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  englishName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A7D4F",
  },

  arabicName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2b624c",
  },

  totalAyahs: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
});
