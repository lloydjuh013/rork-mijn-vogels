import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Users, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';

import EmptyState from '@/components/EmptyState';
import { Couple } from '@/types/bird';

export default function CouplesScreen() {
  const router = useRouter();
  const { couples, getBirdById } = useBirdStore();
  
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const filteredCouples = couples.filter(couple => {
    return activeFilter === null ? true : couple.active === activeFilter;
  });

  const renderCoupleItem = ({ item }: { item: Couple }) => {
    const male = getBirdById(item.maleId);
    const female = getBirdById(item.femaleId);
    
    return (
      <TouchableOpacity 
        style={styles.coupleCard}
        onPress={() => router.push(`/couples/${item.id}`)}
        testID={`couple-card-${item.id}`}
      >
        <View style={[styles.statusIndicator, { backgroundColor: item.active ? Colors.success : Colors.textLighter }]} />
        
        <View style={styles.coupleContent}>
          <View style={styles.coupleHeader}>
            <Text style={styles.coupleId}>Couple #{item.id.slice(0, 8)}</Text>
            <Text style={styles.season}>{item.season}</Text>
          </View>
          
          <View style={styles.birdPair}>
            <View style={styles.birdInfo}>
              <View style={[styles.genderIndicator, { backgroundColor: Colors.male }]} />
              <Text style={styles.birdName} numberOfLines={1}>
                {male ? male.ringNumber : 'Unknown Male'}
              </Text>
            </View>
            
            <Heart size={16} color={Colors.accent} />
            
            <View style={styles.birdInfo}>
              <View style={[styles.genderIndicator, { backgroundColor: Colors.female }]} />
              <Text style={styles.birdName} numberOfLines={1}>
                {female ? female.ringNumber : 'Unknown Female'}
              </Text>
            </View>
          </View>
          
          {item.notes && (
            <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === null && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter(null)}
          testID="filter-all"
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === null && styles.activeFilterButtonText,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === true && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter(true)}
          testID="filter-active"
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === true && styles.activeFilterButtonText,
          ]}>
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === false && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter(false)}
          testID="filter-inactive"
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === false && styles.activeFilterButtonText,
          ]}>
            Inactive
          </Text>
        </TouchableOpacity>
      </View>

      {couples.length === 0 ? (
        <EmptyState
          title="No Couples Yet"
          message="Create your first breeding couple to start tracking nests and offspring."
          icon={<Users size={40} color={Colors.secondary} />}
          actionLabel="Add Couple"
          onAction={() => router.push('/couples/add')}
        />
      ) : (
        <FlatList
          data={filteredCouples}
          renderItem={renderCoupleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No couples match your filter criteria</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/couples/add')}
        testID="add-couple-fab"
      >
        <Plus size={24} color={Colors.cardBackground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  activeFilterButton: {
    backgroundColor: Colors.secondary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  activeFilterButtonText: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  coupleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  statusIndicator: {
    width: 6,
    height: '100%',
  },
  coupleContent: {
    flex: 1,
    padding: 16,
  },
  coupleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  coupleId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  season: {
    fontSize: 14,
    color: Colors.textLight,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  birdPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  birdInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genderIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  birdName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  notes: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});