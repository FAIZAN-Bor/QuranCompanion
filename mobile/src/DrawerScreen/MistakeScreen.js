import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import mistakeService from '../services/mistakeService';

export default function MistakeScreen() {
  const navigation = useNavigation();
  const [mistakes, setMistakes] = useState([]);
  const [groupedMistakes, setGroupedMistakes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'resolved', 'unresolved'

  useEffect(() => {
    fetchMistakes();
  }, [filter]);

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter === 'resolved') filters.isResolved = 'true';
      if (filter === 'unresolved') filters.isResolved = 'false';
      
      const response = await mistakeService.getMistakes(filters);
      console.log('Mistakes response:', response);
      
      if (response.success) {
        setMistakes(response.data?.mistakes || []);
        setGroupedMistakes(response.data?.groupedByWeek || {});
      } else {
        setMistakes([]);
        setGroupedMistakes({});
      }
    } catch (error) {
      console.error('Error fetching mistakes:', error);
      Alert.alert('Error', 'Failed to load mistakes');
      setMistakes([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMistakes();
    setRefreshing(false);
  }, [filter]);

  const handleResolveMistake = async (mistakeId) => {
    try {
      const response = await mistakeService.resolveMistake(mistakeId);
      if (response.success) {
        Alert.alert('Success', 'Mistake marked as resolved! You earned coins!');
        fetchMistakes(); // Refresh the list
      } else {
        Alert.alert('Error', response.message || 'Failed to resolve mistake');
      }
    } catch (error) {
      console.error('Error resolving mistake:', error);
      Alert.alert('Error', 'Failed to resolve mistake');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getWeekCategory = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const mistakeDate = new Date(timestamp);
    const diffTime = now - mistakeDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return 'This Week';
    if (diffDays < 14) return 'Last Week';
    if (diffDays < 21) return '2 Weeks Ago';
    return 'Earlier';
  };
  const renderItem = ({ item }) => (
    <LinearGradient
      colors={item.isResolved ? ['#E8F5E9', '#C8E6C9'] : ['#FFFFFF', '#F1F8E9']}
      style={[styles.card, item.isResolved && styles.resolvedCard]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <View>
      
      <View style={styles.row}>
        <View style={{flex: 1}}>
          {/* Title + Time */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: 'wrap' }}>
            <Text style={styles.title}>{item.title || `${item.module} Mistake`}</Text>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            {item.isResolved && (
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedBadgeText}>✓ Resolved</Text>
              </View>
            )}
          </View>

          {/* WEEK TAG */}
          <Text style={styles.weekTag}>{item.weekCategory || getWeekCategory(item.timestamp)}</Text>

          {/* Mistake Type */}
          {item.mistakeType && (
            <Text style={styles.mistakeType}>{item.mistakeType.replace('_', ' ')}</Text>
          )}

          {/* Description */}
          <Text style={styles.description}>{item.description || 'No description available'}</Text>
          
          {/* Module & Severity */}
          <View style={styles.metaRow}>
            {item.module && (
              <View style={styles.moduleBadge}>
                <Text style={styles.moduleBadgeText}>{item.module}</Text>
              </View>
            )}
            {item.severity && (
              <View style={[styles.severityBadge, 
                item.severity === 'high' && styles.severityHigh,
                item.severity === 'medium' && styles.severityMedium
              ]}>
                <Text style={styles.severityText}>{item.severity}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Play Button - show if audio available */}
        {item.audioUrl && (
          <TouchableOpacity>
            <View style={styles.playBox}>
              <Image 
                style={styles.playIcon} 
                source={require('../assests/play.png')}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

        {/* Action Buttons - only show if not resolved */}
        {!item.isResolved && (
          <View style={styles.actionButtonsRow}>
            {/* Practice Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.practiceButtonWrapper}
              onPress={() => navigation.navigate('MistakePractice', { mistake: item })}
            >
              <LinearGradient
                colors={['#1976D2', '#42A5F5']}
                style={styles.practiceBtn}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.practiceBtnText}>🎤 Practice</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Mark as Resolved Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.resolveButtonWrapper}
              onPress={() => handleResolveMistake(item._id)}
            >
              <LinearGradient
                colors={['#0A7D4F', '#15B872']}
                style={styles.reciteBtn}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.reciteText}>✓ Resolved</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎉</Text>
      <Text style={styles.emptyTitle}>No Mistakes Found</Text>
      <Text style={styles.emptyText}>
        {filter === 'unresolved' 
          ? "Great job! You've resolved all your mistakes!" 
          : "Keep practicing to track your learning journey!"}
      </Text>
    </View>
  );

  if (loading && mistakes.length === 0) {
    return (
      <LinearGradient colors={['#F4FFF5', '#E8F5E9']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A7D4F" />
          <Text style={styles.loadingText}>Loading mistakes...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Your Mistakes</Text>
        <Text style={styles.subtitle}>Review & Improve</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'unresolved' && styles.filterTabActive]}
          onPress={() => setFilter('unresolved')}
        >
          <Text style={[styles.filterText, filter === 'unresolved' && styles.filterTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'resolved' && styles.filterTabActive]}
          onPress={() => setFilter('resolved')}
        >
          <Text style={[styles.filterText, filter === 'resolved' && styles.filterTextActive]}>Resolved</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {mistakes.length} mistake{mistakes.length !== 1 ? 's' : ''} 
          {filter !== 'all' && ` (${filter})`}
        </Text>
      </View>

      <FlatList
        data={mistakes}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A7D4F']}
            tintColor="#0A7D4F"
          />
        }
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
    marginBottom: 15,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#0A7D4F',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
  filterTabActive: {
    backgroundColor: '#0A7D4F',
  },
  filterText: {
    color: '#0A7D4F',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsRow: {
    marginBottom: 10,
    alignItems: 'center',
  },
  statsText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
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
  resolvedCard: {
    opacity: 0.85,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  resolvedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  resolvedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  mistakeType: {
    marginTop: 5,
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
    maxWidth: 250,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  moduleBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moduleBadgeText: {
    color: '#1976D2',
    fontSize: 11,
    fontWeight: '600',
  },
  severityBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityHigh: {
    backgroundColor: '#FFEBEE',
  },
  severityMedium: {
    backgroundColor: '#FFF8E1',
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#E65100',
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
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
    flex: 1,
  },
  reciteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  practiceButtonWrapper: {
    flex: 1,
  },
  resolveButtonWrapper: {
    flex: 1,
  },
  practiceBtn: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
  },
  practiceBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A7D4F',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
