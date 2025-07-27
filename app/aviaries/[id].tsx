import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MapPin, Edit, Trash2, Bird as BirdIcon, Plus, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';
import BirdCard from '@/components/BirdCard';

export default function AviaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getAviaryById, deleteAviary, getBirdsByAviary, birds, updateBird, updateAviary } = useBirdStore();
  const [showAddBirdsModal, setShowAddBirdsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const aviary = getAviaryById(id);
  
  if (!aviary) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Kooi niet gevonden</Text>
        <Button title="Ga Terug" onPress={() => router.back()} type="outline" />
      </View>
    );
  }

  const birdsInAviary = getBirdsByAviary(id);
  const availableBirds = birds.filter(bird => !bird.aviaryId || bird.aviaryId === id);

  const handleEditAviary = () => {
    setEditName(aviary.name);
    setEditLocation(aviary.location);
    setEditCapacity(aviary.capacity.toString());
    setEditNotes(aviary.notes || '');
    setShowEditModal(true);
  };

  const saveAviaryChanges = () => {
    const updatedAviary = {
      ...aviary,
      name: editName,
      location: editLocation,
      capacity: parseInt(editCapacity) || aviary.capacity,
      notes: editNotes,
    };
    updateAviary(updatedAviary);
    setShowEditModal(false);
  };

  const addBirdToAviary = (birdId: string) => {
    const bird = birds.find(b => b.id === birdId);
    if (bird) {
      updateBird({ ...bird, aviaryId: id });
    }
  };

  const removeBirdFromAviary = (birdId: string) => {
    const bird = birds.find(b => b.id === birdId);
    if (bird) {
      updateBird({ ...bird, aviaryId: undefined });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Kooi Verwijderen',
      'Weet je zeker dat je deze kooi wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: () => {
            deleteAviary(id);
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: aviary.name }} />
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.aviaryName}>{aviary.name}</Text>
        <View style={styles.locationContainer}>
          <MapPin size={16} color={Colors.textLight} />
          <Text style={styles.locationText}>{aviary.location}</Text>
        </View>
      </View>
      
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{birdsInAviary.length}</Text>
          <Text style={styles.statLabel}>Vogels</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.max(0, aviary.capacity - birdsInAviary.length)}</Text>
          <Text style={styles.statLabel}>Beschikbaar</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{aviary.capacity}</Text>
          <Text style={styles.statLabel}>Capaciteit</Text>
        </View>
      </View>
      
      {aviary.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notities</Text>
          <Text style={styles.notes}>{aviary.notes}</Text>
        </View>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vogels in deze Kooi</Text>
          <Button 
            title="Vogels Toevoegen" 
            onPress={() => setShowAddBirdsModal(true)} 
            type="secondary"
            icon={<Plus size={16} color={Colors.cardBackground} />}
            testID="add-birds-button"
          />
        </View>
        
        {birdsInAviary.length === 0 ? (
          <View style={styles.emptyState}>
            <BirdIcon size={24} color={Colors.textLight} />
            <Text style={styles.emptyText}>Geen vogels in deze kooi</Text>
          </View>
        ) : (
          birdsInAviary.map(bird => (
            <View key={bird.id} style={styles.birdCardContainer}>
              <BirdCard bird={bird} />
              <Button 
                title="Verwijderen" 
                onPress={() => removeBirdFromAviary(bird.id)} 
                type="danger"
                testID={`remove-bird-${bird.id}`}
              />
            </View>
          ))
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <Button 
          title="Bewerken" 
          onPress={handleEditAviary} 
          type="primary"
          icon={<Edit size={20} color={Colors.cardBackground} />}
          testID="edit-aviary-button"
        />
        <Button 
          title="Verwijderen" 
          onPress={handleDelete} 
          type="danger"
          icon={<Trash2 size={20} color={Colors.cardBackground} />}
          testID="delete-aviary-button"
        />
      </View>
      
      {/* Add Birds Modal */}
      <Modal visible={showAddBirdsModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Vogels Toevoegen</Text>
            <TouchableOpacity onPress={() => setShowAddBirdsModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {availableBirds.length === 0 ? (
              <Text style={styles.emptyText}>Geen beschikbare vogels</Text>
            ) : (
              availableBirds.map(bird => (
                <View key={bird.id} style={styles.birdOption}>
                  <View style={styles.birdInfo}>
                    <Text style={styles.birdName}>{bird.ringNumber}</Text>
                    <Text style={styles.birdSpecies}>{bird.species}</Text>
                  </View>
                  <Button 
                    title={bird.aviaryId === id ? "Toegevoegd" : "Toevoegen"} 
                    onPress={() => addBirdToAviary(bird.id)} 
                    type={bird.aviaryId === id ? "secondary" : "primary"}
                    disabled={bird.aviaryId === id}
                  />
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
      
      {/* Edit Aviary Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kooi Bewerken</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Naam</Text>
              <TextInput 
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Kooi naam"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Locatie</Text>
              <TextInput 
                style={styles.input}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Locatie"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Capaciteit</Text>
              <TextInput 
                style={styles.input}
                value={editCapacity}
                onChangeText={setEditCapacity}
                placeholder="Capaciteit"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notities</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Notities"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.modalActions}>
              <Button 
                title="Annuleren" 
                onPress={() => setShowEditModal(false)} 
                type="outline"
              />
              <Button 
                title="Opslaan" 
                onPress={saveAviaryChanges} 
                type="primary"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  aviaryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 8,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
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
  notes: {
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  birdCardContainer: {
    marginBottom: 12,
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
  birdOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  birdInfo: {
    flex: 1,
  },
  birdName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  birdSpecies: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});