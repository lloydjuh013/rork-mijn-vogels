import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar, Trash2, Heart, Egg, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';

export default function CoupleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getCoupleById, getBirdById, deleteCouple, getNestsByCouple, getOffspring, updateCouple, couples } = useBirdStore();

  const couple = getCoupleById(id);
  const coupleIndex = couples.findIndex(c => c.id === id) + 1;
  
  if (!couple) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Koppel niet gevonden</Text>
        <Button title="Ga Terug" onPress={() => router.back()} type="outline" />
      </View>
    );
  }

  const male = getBirdById(couple.maleId);
  const female = getBirdById(couple.femaleId);
  const nests = getNestsByCouple(id);
  const offspring = getOffspring(id);

  const handleDelete = () => {
    Alert.alert(
      'Koppel Verwijderen',
      'Weet je zeker dat je dit koppel wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: () => {
            deleteCouple(id);
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleActive = () => {
    updateCouple({
      ...couple,
      active: !couple.active,
    });
  };

  const addNest = () => {
    router.push(`/nests/add?coupleId=${id}` as any);
  };

  return (
    <>
      <Stack.Screen options={{ title: `Koppel #${coupleIndex}` }} />
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.coupleInfo}>
          <Text style={styles.coupleTitle}>Koppel #{coupleIndex}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: couple.active ? Colors.success : Colors.textLighter 
          }]}>
            <Text style={styles.statusText}>{couple.active ? 'Actief' : 'Inactief'}</Text>
          </View>
        </View>
        <Text style={styles.season}>{couple.season} Seizoen</Text>
      </View>
      
      <View style={styles.birdPairContainer}>
        <TouchableOpacity 
          style={styles.birdCard}
          onPress={() => male && router.push(`/birds/${male.id}`)}
          disabled={!male}
        >
          <View style={[styles.genderIndicator, { backgroundColor: Colors.male }]} />
          <View style={styles.birdImagePlaceholder}>
            <Heart size={24} color={Colors.textLighter} />
          </View>
          <Text style={styles.birdTitle}>Mannetje</Text>
          <Text style={styles.birdValue}>{male ? male.ringNumber : 'Onbekend'}</Text>
          {male && (
            <Text style={styles.birdSpecies}>{male.species}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.birdCard}
          onPress={() => female && router.push(`/birds/${female.id}`)}
          disabled={!female}
        >
          <View style={[styles.genderIndicator, { backgroundColor: Colors.female }]} />
          <View style={styles.birdImagePlaceholder}>
            <Heart size={24} color={Colors.textLighter} />
          </View>
          <Text style={styles.birdTitle}>Vrouwtje</Text>
          <Text style={styles.birdValue}>{female ? female.ringNumber : 'Onbekend'}</Text>
          {female && (
            <Text style={styles.birdSpecies}>{female.species}</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nesten</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addNest}
            testID="add-nest-button"
          >
            <Plus size={16} color={Colors.cardBackground} />
            <Text style={styles.addButtonText}>Nest Toevoegen</Text>
          </TouchableOpacity>
        </View>
        
        {nests.length === 0 ? (
          <View style={styles.emptyState}>
            <Egg size={24} color={Colors.textLight} />
            <Text style={styles.emptyText}>Geen nesten geregistreerd voor dit koppel</Text>
          </View>
        ) : (
          nests.map(nest => (
            <TouchableOpacity 
              key={nest.id} 
              style={styles.nestCard}
              onPress={() => router.push(`/nests/${nest.id}` as any)}
            >
              <View style={styles.nestHeader}>
                <Text style={styles.nestId}>Nest #{nest.id.slice(0, 8)}</Text>
                <View style={[styles.nestStatusBadge, { 
                  backgroundColor: nest.active ? Colors.success : Colors.textLighter 
                }]}>
                  <Text style={styles.nestStatusText}>{nest.active ? 'Actief' : 'Inactief'}</Text>
                </View>
              </View>
              
              <View style={styles.nestInfo}>
                <Calendar size={16} color={Colors.textLight} />
                <Text style={styles.nestDate}>
                  Gestart: {new Date(nest.startDate).toLocaleDateString('nl-NL')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      
      {offspring.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nakomelingen</Text>
          <Text style={styles.offspringCount}>{offspring.length} vogels</Text>
          
          {offspring.map(bird => (
            <TouchableOpacity 
              key={bird.id} 
              style={styles.offspringCard}
              onPress={() => router.push(`/birds/${bird.id}`)}
            >
              <View style={[styles.offspringGenderIndicator, { 
                backgroundColor: bird.gender === 'male' ? Colors.male : 
                                bird.gender === 'female' ? Colors.female : 
                                Colors.unknown 
              }]} />
              <View style={styles.offspringInfo}>
                <Text style={styles.offspringRingNumber}>{bird.ringNumber}</Text>
                <Text style={styles.offspringSpecies}>{bird.species}</Text>
                <Text style={styles.offspringBirthDate}>
                  {new Date(bird.birthDate).toLocaleDateString('nl-NL')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {couple.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notities</Text>
          <Text style={styles.notes}>{couple.notes}</Text>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <Button 
          title={couple.active ? "Inactief Maken" : "Actief Maken"} 
          onPress={toggleActive} 
          type={couple.active ? "outline" : "primary"}
          testID="toggle-active-button"
        />
        <Button 
          title="Verwijderen" 
          onPress={handleDelete} 
          type="danger"
          icon={<Trash2 size={20} color={Colors.cardBackground} />}
          testID="delete-couple-button"
        />
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coupleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coupleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: Colors.cardBackground,
    fontSize: 14,
    fontWeight: '600',
  },
  season: {
    fontSize: 16,
    color: Colors.textLight,
  },
  birdPairContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  birdCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  genderIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 4,
  },
  birdImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  birdTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  birdValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  birdSpecies: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: Colors.cardBackground,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    padding: 24,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  nestId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  nestStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  nestStatusText: {
    color: Colors.cardBackground,
    fontSize: 12,
    fontWeight: '600',
  },
  nestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nestDate: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  offspringCount: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  offspringCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  offspringGenderIndicator: {
    width: 6,
    height: '100%',
  },
  offspringInfo: {
    padding: 12,
  },
  offspringRingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  offspringSpecies: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  offspringBirthDate: {
    fontSize: 12,
    color: Colors.textLighter,
  },
  notes: {
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    textAlign: 'center',
    marginVertical: 24,
  },
});