import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Home, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import EmptyState from '@/components/EmptyState';
import { Aviary } from '@/types/bird';

export default function AviariesScreen() {
  const router = useRouter();
  const { aviaries, getBirdsByAviary } = useBirdStore();

  const renderAviaryItem = ({ item }: { item: Aviary }) => {
    const birdsInAviary = getBirdsByAviary(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.aviaryCard}
        onPress={() => router.push(`/aviaries/${item.id}`)}
        testID={`aviary-card-${item.id}`}
      >
        <View style={styles.aviaryHeader}>
          <Text style={styles.aviaryName}>{item.name}</Text>
          <View style={styles.capacityContainer}>
            <Text style={styles.capacityText}>
              {birdsInAviary.length}/{item.capacity}
            </Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color={Colors.textLight} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Birds:</Text>
            <Text style={styles.statValue}>{birdsInAviary.length}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Available:</Text>
            <Text style={styles.statValue}>{Math.max(0, item.capacity - birdsInAviary.length)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Capacity:</Text>
            <Text style={styles.statValue}>{item.capacity}</Text>
          </View>
        </View>
        
        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {aviaries.length === 0 ? (
        <EmptyState
          title="No Aviaries Yet"
          message="Add your first aviary to organize your birds by location."
          icon={<Home size={40} color={Colors.info} />}
          actionLabel="Add Aviary"
          onAction={() => router.push('/aviaries/add')}
        />
      ) : (
        <FlatList
          data={aviaries}
          renderItem={renderAviaryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/aviaries/add')}
        testID="add-aviary-fab"
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
  listContent: {
    padding: 16,
  },
  aviaryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aviaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aviaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  capacityContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  notes: {
    fontSize: 14,
    color: Colors.textLight,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});