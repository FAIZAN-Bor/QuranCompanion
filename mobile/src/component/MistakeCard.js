// Mistake detail card for the result screen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MistakeCard = ({ mistake, index }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'major': return { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' };
      case 'moderate': return { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' };
      case 'minor': return { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' };
      default: return { bg: '#F5F5F5', text: '#666', border: '#E0E0E0' };
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'missing': 'Missing Word',
      'substitution': 'Wrong Word',
      'insertion': 'Extra Word',
      'tajweed': 'Tajweed Issue',
      'pronunciation': 'Pronunciation',
    };
    return labels[type] || type;
  };

  const colors = getSeverityColor(mistake.severity);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={styles.index}>#{index + 1}</Text>
        <View style={[styles.typeBadge, { backgroundColor: colors.border }]}>
          <Text style={[styles.typeText, { color: colors.text }]}>{getTypeLabel(mistake.type)}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: colors.text }]}>
          <Text style={styles.severityText}>{mistake.severity}</Text>
        </View>
      </View>
      
      {(mistake.expected || mistake.got) && (
        <View style={styles.comparison}>
          {mistake.expected ? (
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>Expected:</Text>
              <Text style={styles.compArabic}>{mistake.expected}</Text>
            </View>
          ) : null}
          {mistake.got ? (
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>Got:</Text>
              <Text style={[styles.compArabic, { color: '#E53935' }]}>{mistake.got}</Text>
            </View>
          ) : null}
        </View>
      )}
      
      {mistake.suggestion && (
        <Text style={styles.suggestion}>{mistake.suggestion}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  index: {
    fontSize: 13,
    fontWeight: '800',
    color: '#999',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  comparison: {
    marginBottom: 8,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    width: 70,
  },
  compArabic: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  suggestion: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default MistakeCard;
