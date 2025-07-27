import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Egg, Plus, Calendar, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';

export default function NestsScreen() {
  const router = useRouter();
  const { nests, couples, getBirdById } = useBirdStore();

  const activeNests = nests.filter(nest => nest.active);

  const getCoupleInfo = (coupleId: string) => {
    const couple = couples.find(c => c.id === coupleId);
    if (!couple) return 'Onbekend koppel';
    
    const male = getBirdById(couple.maleId);
    const female = getBirdById(couple.femaleId);
    
    return `${male?.ringNumber || 'Onbekend'} & ${female?.ringNumber || 'Onbekend'}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('nl-NL');
  };

  if (activeNests.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState 
          icon={<Egg size={64} color={Colors.textLight} />}
          title="Geen actieve nesten"
          actionText="Ga naar Koppels"
          onAction={() => router.push('/(tabs)/couples')}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Actieve Nesten</Text>
        <Text style={styles.subtitle}>{activeNests.length} actieve nesten</Text>
      </View>

      {activeNests.map((nest) => (
        <TouchableOpacity 
          key={nest.id} 
          style={styles.nestCard}
          onPress={() => router.push(`/nests/${nest.id}` as any)}
        >
          <View style={styles.nestHeader}>
            <View style={styles.nestInfo}>
              <Text style={styles.nestTitle}>Nest #{nest.id.slice(-6)}</Text>
              <Text style={styles.coupleInfo}>{getCoupleInfo(nest.coupleId)}</Text>
            </View>
            <View style={styles.nestStatus}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>Actief</Text>
            </View>
          </View>
          
          <View style={styles.nestDetails}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.textLight} />
              <Text style={styles.detailText}>Gestart: {formatDate(nest.startDate.toString())}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Egg size={16} color={Colors.textLight} />
              <Text style={styles.detailText}>{(nest as any).eggCount || 0} eieren</Text>
            </View>
          </View>
          
          {nest.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {nest.notes}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
  },
  nestCard: {
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
  nestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nestInfo: {
    flex: 1,
  },
  nestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  coupleInfo: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  nestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  nestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 6,
  },
  notes: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    marginTop: 8,
  },
});