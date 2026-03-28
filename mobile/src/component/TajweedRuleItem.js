// Individual Tajweed rule score item
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TajweedRuleItem = ({ rule, score }) => {
  const getColor = (s) => {
    if (s >= 80) return '#0A7D4F';
    if (s >= 60) return '#FFA726';
    return '#E53935';
  };

  const getBgColor = (s) => {
    if (s >= 80) return '#E8F5E9';
    if (s >= 60) return '#FFF3E0';
    return '#FFEBEE';
  };

  const getIcon = (ruleName) => {
    const icons = {
      'Madd': '〰️',
      'Ghunnah': '🔔',
      'Shaddah': '⚡',
      'Idgham': '🔗',
      'Ikhfa': '🤫',
      'Iqlab': '🔄',
      'Izhar': '🔊',
      'Qalqalah': '💫',
    };
    return icons[ruleName] || '📖';
  };

  const color = getColor(score);
  const bgColor = getBgColor(score);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.icon}>{getIcon(rule)}</Text>
      <View style={styles.info}>
        <Text style={styles.ruleName}>{rule}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${Math.min(score, 100)}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Text style={[styles.score, { color }]}>{score}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  barContainer: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
  },
  bar: {
    height: 6,
    borderRadius: 3,
  },
  score: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 12,
    minWidth: 45,
    textAlign: 'right',
  },
});

export default TajweedRuleItem;
