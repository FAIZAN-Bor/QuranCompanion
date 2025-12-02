import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import LinearGradient from 'react-native-linear-gradient';

const mistakes = [
  { id: '1', title: 'Mistake 1', description: 'Incorrect recitation of Ayah 2 in Surah Al-Fatiha', time: '10:23 AM', week: 'This Week' },
  { id: '2', title: 'Mistake 2', description: 'Mispronounced the letter “ق” in Surah Al-Ikhlas', time: '10:25 AM', week: 'This Week' },
  { id: '3', title: 'Mistake 3', description: 'Skipped a verse in Surah Al-Baqarah during recitation', time: '10:28 AM', week: 'Last Week' },
  { id: '4', title: 'Mistake 4', description: 'Incorrect Madd (prolongation) in Surah An-Nas', time: '10:32 AM', week: 'Last Week' },
  { id: '5', title: 'Mistake 5', description: 'Sukun was not properly applied in Surah Al-Falaq', time: '10:40 AM', week: '2 Weeks Ago' },
];

export default function MistakeScreen() {
  const renderItem = ({ item }) => (
    <LinearGradient
      colors={['#FFFFFF', '#F1F8E9']}
      style={styles.card}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <View>
      
      <View style={styles.row}>
        <View>
          {/* Title + Time */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>

          {/* WEEK TAG */}
          <Text style={styles.weekTag}>{item.week}</Text>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Play Button */}
        <TouchableOpacity>
          <View style={styles.playBox}>
            <Image 
              style={styles.playIcon} 
              source={require('../assests/play.png')}
            />
          </View>
        </TouchableOpacity>
      </View>

        {/* Recite Again Button */}
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={['#0A7D4F', '#15B872']}
            style={styles.reciteBtn}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Text style={styles.reciteText}>Recite Again ▶</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Your Mistakes</Text>
        <Text style={styles.subtitle}>Review & Improve</Text>
      </View>
      <FlatList
        data={mistakes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </LinearGradient>
  );
}

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
    fontSize: 30,
    fontWeight: "900",
    color: "#0A7D4F",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
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
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A7D4F",
  },

  time: {
    fontSize: 12,
    color: "#6b6b6b",
    backgroundColor: "#e1e8e5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },

  weekTag: {
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "#e4f2ec",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#0A7D4F",
    fontSize: 12,
    fontWeight: "600",
  },

  description: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
    width: 200,
  },

  playBox: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#0A7D4F',
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  playIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: '#FFFFFF',
  },

  reciteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
  },

  reciteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

});
