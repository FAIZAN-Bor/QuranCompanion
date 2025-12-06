import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const DuaDetail = ({ route }) => {
  const { dua } = route.params;

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{dua.name}</Text>
        
        {/* Arabic Name */}
        <View style={styles.arabicNameContainer}>
          <Text style={styles.arabicName}>{dua.nameArabic}</Text>
        </View>

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>✨ {dua.category}</Text>
        </View>

        {/* Arabic Text Card */}
        <LinearGradient
          colors={['#FFFFFF', '#F1F8E9']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Arabic Text</Text>
          <Text style={styles.arabicText}>{dua.arabicText}</Text>
        </LinearGradient>

        {/* Transliteration Card */}
        {dua.transliteration && (
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Transliteration</Text>
            <Text style={styles.transliteration}>{dua.transliteration}</Text>
          </LinearGradient>
        )}

        {/* Translation Card */}
        {dua.translation && (
          <LinearGradient
            colors={['#FFFFFF', '#F1F8E9']}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Translation</Text>
            <Text style={styles.translation}>{dua.translation}</Text>
          </LinearGradient>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default DuaDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  arabicNameContainer: {
    backgroundColor: 'rgba(10, 125, 79, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  arabicName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#143b2c',
    textAlign: 'center',
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F57F17',
  },
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A7D4F',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  arabicText: {
    fontSize: 24,
    color: '#2b624c',
    textAlign: 'right',
    lineHeight: 40,
    fontWeight: '600',
  },
  transliteration: {
    fontSize: 18,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  translation: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
  },
});
