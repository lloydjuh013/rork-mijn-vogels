import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Egg, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';
import { Bird } from '@/types/bird';

export default function NestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    nests, 
    getBirdById, 
    getCoupleById, 
    updateNest, 
    addBird, 
    getEggsByNest
  } = useBirdStore();
  
  const [showHatchModal, setShowHatchModal] = useState(false);
  const [hatchedCount, setHatchedCount] = useState('0');
  const [hatchDate, setHatchDate] = useState(new Date().toISOString().split('T')[0]);

  const nest = nests.find(n => n.id === id);
  
  if (!nest) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nest niet gevonden</Text>
        <Button title="Ga Terug" onPress={() => router.back()} type="outline" />
      </View>
    );
  }

  const couple = getCoupleById(nest.coupleId);
  const male = couple ? getBirdById(couple.maleId) : undefined;
  const female = couple ? getBirdById(couple.femaleId) : undefined;
  const nestEggs = getEggsByNest(id);
  const eggCount = nest.eggCount || nestEggs.length || 0;

  const handleMarkAsHatched = () => {
    const count = parseInt(hatchedCount);
    if (count <= 0 || count > eggCount) {
      Alert.alert('Fout', `Voer een geldig aantal in tussen 1 en ${eggCount}`);
      return;
    }

    Alert.alert(
      'Bevestigen',
      `${count} eieren markeren als uitgekomen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Bevestigen',
          onPress: () => {
            // Create new birds for hatched eggs
            for (let i = 0; i < count; i++) {
              const newBird: Bird = {
                id: `bird_${Date.now()}_${i}`,
                ringNumber: `${Date.now()}_${i}`,
                species: male?.species || female?.species || 'Onbekend',
                gender: 'unknown',
                birthDate: new Date(hatchDate),
                origin: 'bred',
                status: 'active',
                fatherId: male?.id,
                motherId: female?.id,
                notes: `Uitgekomen uit nest ${nest.id.slice(-6)} op ${new Date(hatchDate).toLocaleDateString('nl-NL')}`
              };
              addBird(newBird);
            }

            // Update nest status
            updateNest({
              ...nest,
              active: false,
              notes: `${nest.notes || ''} - ${count} eieren uitgekomen op ${new Date(hatchDate).toLocaleDateString('nl-NL')}`
            });

            setShowHatchModal(false);
            Alert.alert('Succes', `${count} nieuwe vogels toegevoegd!`);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.nestTitle}>Nest #{nest.id.slice(-6)}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: nest.active ? Colors.success : Colors.textLighter 
        }]}>
          <Text style={styles.statusText}>{nest.active ? 'Actief' : 'Uitgekomen'}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Koppel Informatie</Text>
        <View style={styles.coupleContainer}>
          <View style={styles.birdInfo}>
            <View style={[styles.genderIndicator, { backgroundColor: Colors.male }]} />
            <Text style={styles.birdLabel}>Mannetje</Text>
            <Text style={styles.birdValue}>{male?.ringNumber || 'Onbekend'}</Text>
            {male && <Text style={styles.birdSpecies}>{male.species}</Text>}
          </View>
          
          <View style={styles.birdInfo}>
            <View style={[styles.genderIndicator, { backgroundColor: Colors.female }]} />
            <Text style={styles.birdLabel}>Vrouwtje</Text>
            <Text style={styles.birdValue}>{female?.ringNumber || 'Onbekend'}</Text>
            {female && <Text style={styles.birdSpecies}>{female.species}</Text>}
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nest Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.textLight} />
            <Text style={styles.detailLabel}>Startdatum:</Text>
            <Text style={styles.detailValue}>
              {new Date(nest.startDate).toLocaleDateString('nl-NL')}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Egg size={20} color={Colors.textLight} />
            <Text style={styles.detailLabel}>Aantal eieren:</Text>
            <Text style={styles.detailValue}>{eggCount}</Text>
          </View>
        </View>
      </View>
      
      {nest.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notities</Text>
          <Text style={styles.notes}>{nest.notes}</Text>
        </View>
      )}
      
      {nest.active && eggCount > 0 && (
        <View style={styles.actionSection}>
          <Button 
            title="Markeer als Uitgekomen" 
            onPress={() => setShowHatchModal(true)} 
            type="primary"
            icon={<Check size={20} color={Colors.cardBackground} />}
            testID="mark-hatched-button"
          />
        </View>
      )}
      
      {/* Hatch Modal */}
      <Modal visible={showHatchModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Eieren Uitgekomen</Text>
            <TouchableOpacity onPress={() => setShowHatchModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Hoeveel eieren zijn er uitgekomen uit dit nest?
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Aantal uitgekomen eieren</Text>
              <TextInput 
                style={styles.input}
                value={hatchedCount}
                onChangeText={setHatchedCount}
                placeholder={`Max ${eggCount} eieren`}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Uitkomstdatum</Text>
              <TextInput 
                style={styles.input}
                value={hatchDate}
                onChangeText={setHatchDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.modalActions}>
              <Button 
                title="Annuleren" 
                onPress={() => setShowHatchModal(false)} 
                type="outline"
              />
              <Button 
                title="Bevestigen" 
                onPress={handleMarkAsHatched} 
                type="primary"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: Colors.cardBackground,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  coupleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  birdInfo: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
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
  birdLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    marginTop: 8,
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
  detailsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  notes: {
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  actionSection: {
    padding: 16,
    marginBottom: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    textAlign: 'center',
    marginVertical: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});