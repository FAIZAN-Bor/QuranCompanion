import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const MistakeLog = ({ route }) => {
  const { child } = route.params || { child: { name: 'Child' } };

  const mistakes = [
    { id: 1, word: 'قَلْقَلَة', rule: 'Qalqalah', count: 5, lastOccurred: 'Yesterday', severity: 'high' },
    { id: 2, word: 'إِخْفَاء', rule: 'Ikhfa', count: 8, lastOccurred: '2 days ago', severity: 'high' },
    { id: 3, word: 'إِدْغَام', rule: 'Idgham', count: 3, lastOccurred: '3 days ago', severity: 'medium' },
    { id: 4, word: 'مَدّ', rule: 'Madd', count: 4, lastOccurred: 'Today', severity: 'high' },
    { id: 5, word: 'غُنَّة', rule: 'Ghunna', count: 2, lastOccurred: '1 week ago', severity: 'low' },
    { id: 6, word: 'تَفْخِيم', rule: 'Tafkheem', count: 3, lastOccurred: '4 days ago', severity: 'medium' },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#E53935';
      case 'medium': return '#F57C00';
      case 'low': return '#FDD835';
      default: return '#666';
    }
  };

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mistake Log</Text>
          <Text style={styles.subtitle}>{child.name}'s Common Errors</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#FFFFFF', '#FFEBEE']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryTitle}>Total Mistakes This Week</Text>
            <Text style={styles.summaryCount}>25</Text>
            <Text style={styles.summaryNote}>Focus on Ikhfa and Qalqalah rules</Text>
          </LinearGradient>
        </View>

        {/* Mistakes Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Mistake Log</Text>
          
          {mistakes.map((mistake) => (
            <LinearGradient
              key={mistake.id}
              colors={['#FFFFFF', '#F9F9F9']}
              style={styles.mistakeCard}
            >
              <View style={styles.mistakeHeader}>
                <View style={styles.wordContainer}>
                  <Text style={styles.arabicWord}>{mistake.word}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(mistake.severity) }]}>
                    <Text style={styles.severityText}>{mistake.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{mistake.count}x</Text>
                </View>
              </View>

              <View style={styles.mistakeDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rule Violated:</Text>
                  <Text style={styles.detailValue}>{mistake.rule}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Occurred:</Text>
                  <Text style={styles.detailValue}>{mistake.lastOccurred}</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.8}>
                <LinearGradient
                  colors={['#0A7D4F', '#15B872']}
                  style={styles.practiceButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.practiceButtonText}>Practice This ▶</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A7D4F',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
  },
  summaryCount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#E53935',
    marginBottom: 10,
  },
  summaryNote: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A7D4F',
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  mistakeCard: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  mistakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arabicWord: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D84315',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: '#E53935',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  mistakeDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#0A7D4F',
    fontWeight: '800',
  },
  practiceButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  practiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default MistakeLog;
