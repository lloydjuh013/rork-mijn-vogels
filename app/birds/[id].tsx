import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar, MapPin, Edit, Trash2, Heart, TreePine } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';

export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getBirdById, deleteBird, getHealthRecordsByBird, getParents } = useBirdStore();

  const bird = getBirdById(id);
  const healthRecords = getHealthRecordsByBird(id);
  const { father, mother } = getParents(id);

  if (!bird) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Vogel niet gevonden</Text>
        <Button title="Ga Terug" onPress={() => router.back()} type="outline" />
      </View>
    );
  }

  const handleEdit = () => {
    router.push(`/birds/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Vogel Verwijderen',
      'Weet je zeker dat je deze vogel wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: () => {
            deleteBird(id);
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('nl-NL');
  };

  const handlePedigree = () => {
    Alert.alert('Stamboom', 'Deze functie wordt beschikbaar in een toekomstige update.');
  };

  const getGenderColor = () => {
    switch (bird.gender) {
      case 'male':
        return Colors.male;
      case 'female':
        return Colors.female;
      default:
        return Colors.unknown;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: bird.name || bird.ringNumber }} />
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        {bird.imageUri ? (
          <Image source={{ uri: bird.imageUri }} style={styles.birdImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Heart size={40} color={Colors.textLighter} />
          </View>
        )}
        
        <View style={[styles.genderBadge, { backgroundColor: getGenderColor() }]}>
          <Text style={styles.genderText}>
            {bird.gender === 'male' ? 'M' : bird.gender === 'female' ? 'F' : '?'}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.ringNumber}>{bird.ringNumber}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: bird.status === 'active' ? Colors.success : Colors.textLighter 
          }]}>
            <Text style={styles.statusText}>{bird.status}</Text>
          </View>
        </View>
        
        <Text style={styles.species}>{bird.species}</Text>
        {bird.subspecies && (
          <Text style={styles.subspecies}>{bird.subspecies}</Text>
        )}
        
        {bird.colorMutation && (
          <Text style={styles.colorMutation}>{bird.colorMutation}</Text>
        )}
        
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.textLight} />
            <Text style={styles.detailLabel}>Geboortedatum:</Text>
            <Text style={styles.detailValue}>{formatDate(bird.birthDate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={20} color={Colors.textLight} />
            <Text style={styles.detailLabel}>Herkomst:</Text>
            <Text style={styles.detailValue}>{bird.origin}</Text>
          </View>
          
          {bird.aviaryId && (
            <View style={styles.detailRow}>
              <MapPin size={20} color={Colors.textLight} />
              <Text style={styles.detailLabel}>Kooi:</Text>
              <Text style={styles.detailValue}>{bird.aviaryId}</Text>
            </View>
          )}
        </View>
        
        {(father || mother) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ouders</Text>
            <View style={styles.parentsContainer}>
              {father && (
                <TouchableOpacity 
                  style={styles.parentCard}
                  onPress={() => router.push(`/birds/${father.id}`)}
                >
                  <View style={[styles.parentGenderIndicator, { backgroundColor: Colors.male }]} />
                  <Text style={styles.parentTitle}>Vader</Text>
                  <Text style={styles.parentValue}>{father.ringNumber}</Text>
                </TouchableOpacity>
              )}
              
              {mother && (
                <TouchableOpacity 
                  style={styles.parentCard}
                  onPress={() => router.push(`/birds/${mother.id}`)}
                >
                  <View style={[styles.parentGenderIndicator, { backgroundColor: Colors.female }]} />
                  <Text style={styles.parentTitle}>Moeder</Text>
                  <Text style={styles.parentValue}>{mother.ringNumber}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {healthRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gezondheidsgegevens</Text>
            {healthRecords.map(record => (
              <View key={record.id} style={styles.healthRecord}>
                <View style={styles.healthRecordHeader}>
                  <Text style={styles.healthRecordDate}>{formatDate(record.date)}</Text>
                  <Text style={styles.healthRecordType}>{record.type}</Text>
                </View>
                <Text style={styles.healthRecordDescription}>{record.description}</Text>
                {record.notes && (
                  <Text style={styles.healthRecordNotes}>{record.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        {bird.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notities</Text>
            <Text style={styles.notes}>{bird.notes}</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <Button 
            title="Stamboom" 
            onPress={handlePedigree} 
            type="secondary"
            icon={<TreePine size={20} color={Colors.cardBackground} />}
            testID="pedigree-button"
          />
        </View>
        
        <View style={styles.actionButtons}>
          <Button 
            title="Bewerken" 
            onPress={handleEdit} 
            type="primary"
            icon={<Edit size={20} color={Colors.cardBackground} />}
            testID="edit-bird-button"
          />
          <Button 
            title="Verwijderen" 
            onPress={handleDelete} 
            type="danger"
            icon={<Trash2 size={20} color={Colors.cardBackground} />}
            testID="delete-bird-button"
          />
        </View>
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
    position: 'relative',
  },
  birdImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  genderText: {
    color: Colors.cardBackground,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ringNumber: {
    fontSize: 24,
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
    textTransform: 'capitalize',
  },
  species: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subspecies: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  colorMutation: {
    fontSize: 16,
    color: Colors.accent,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  parentsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parentCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  parentGenderIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 4,
  },
  parentTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  parentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  healthRecord: {
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
  healthRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthRecordDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  healthRecordType: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  healthRecordDescription: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  healthRecordNotes: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
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
    marginTop: 24,
    marginBottom: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    textAlign: 'center',
    marginVertical: 24,
  },
});