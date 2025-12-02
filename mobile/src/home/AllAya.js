import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AllAya = ({ navigation, route }) => {
  const surah = route.params.data; // The selected Surah object

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.surahTitle}>{surah.name}</Text>
        <Text style={styles.arabicTitle}>{surah.arabicName}</Text>
      </View>

      <FlatList
        data={surah.ayahs}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.ayahCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            {/* Ayah Number Badge */}
            <View style={styles.ayahBadge}>
              <Text style={styles.ayahNumber}>{item.number}</Text>
            </View>

            {/* Arabic Text */}
            <View style={styles.arabicContainer}>
              <Text style={styles.arabic}>{item.arabic}</Text>
            </View>

            {/* English Text */}
            <Text style={styles.english}>{item.english}</Text>

            {/* Practice Button */}
            <TouchableOpacity onPress={() => navigation.navigate('AyaDetail', { data: item })} activeOpacity={0.8}>
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
        )}
      />
    </LinearGradient>
  );
};

export default AllAya;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  headerContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },

  surahTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
  },

  arabicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2b624c',
    marginTop: 5,
  },

  ayahCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 125, 79, 0.1)',
  },

  ayahBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A7D4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
  },

  ayahNumber: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  arabicContainer: {
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  arabic: {
    fontSize: 24,
    textAlign: 'right',
    color: '#2b624c',
    fontWeight: 'bold',
    lineHeight: 40,
  },

  english: {
    fontSize: 15,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
    fontWeight: '500',
  },

  practiceBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    elevation: 5,
  },

  practiceText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
