import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Bird as BirdIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import BirdCard from '@/components/BirdCard';

import EmptyState from '@/components/EmptyState';
import { Bird } from '@/types/bird';

export default function BirdsScreen() {
  const router = useRouter();
  const { birds } = useBirdStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredBirds = birds.filter(bird => {
    const matchesSearch = 
      bird.ringNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bird.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bird.subspecies && bird.subspecies.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter ? bird.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app with a server, we would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderBirdItem = ({ item }: { item: Bird }) => (
    <BirdCard bird={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search birds..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} testID="clear-search">
              <View style={styles.clearButton}>
                <Text style={styles.clearButtonText}>×</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === null && styles.activeFilterButton,
          ]}
          onPress={() => setStatusFilter(null)}
          testID="filter-all"
        >
          <Text style={[
            styles.filterButtonText,
            statusFilter === null && styles.activeFilterButtonText,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'active' && styles.activeFilterButton,
          ]}
          onPress={() => setStatusFilter('active')}
          testID="filter-active"
        >
          <Text style={[
            styles.filterButtonText,
            statusFilter === 'active' && styles.activeFilterButtonText,
          ]}>
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'deceased' && styles.activeFilterButton,
          ]}
          onPress={() => setStatusFilter('deceased')}
          testID="filter-deceased"
        >
          <Text style={[
            styles.filterButtonText,
            statusFilter === 'deceased' && styles.activeFilterButtonText,
          ]}>
            Deceased
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'sold' && styles.activeFilterButton,
          ]}
          onPress={() => setStatusFilter('sold')}
          testID="filter-sold"
        >
          <Text style={[
            styles.filterButtonText,
            statusFilter === 'sold' && styles.activeFilterButtonText,
          ]}>
            Sold
          </Text>
        </TouchableOpacity>
      </View>

      {birds.length === 0 ? (
        <EmptyState
          title="No Birds Yet"
          message="Add your first bird to get started with your collection."
          icon={<BirdIcon size={40} color={Colors.primary} />}
          actionLabel="Add Bird"
          onAction={() => router.push('/birds/add')}
        />
      ) : (
        <FlatList
          data={filteredBirds}
          renderItem={renderBirdItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No birds match your search criteria</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/birds/add')}
        testID="add-bird-fab"
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
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: Colors.textLight,
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
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});