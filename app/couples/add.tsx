import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';
import { Couple } from '@/types/bird';

export default function AddCoupleScreen() {
  const router = useRouter();
  const { birds, addCouple } = useBirdStore();
  
  const [selectedMaleId, setSelectedMaleId] = useState<string | null>(null);
  const [selectedFemaleId, setSelectedFemaleId] = useState<string | null>(null);
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const males = birds.filter(bird => bird.gender === 'male' && bird.status === 'active');
  const females = birds.filter(bird => bird.gender === 'female' && bird.status === 'active');

  const handleSubmit = () => {
    if (!selectedMaleId) {
      Alert.alert('Error', 'Please select a male bird');
      return;
    }
    
    if (!selectedFemaleId) {
      Alert.alert('Error', 'Please select a female bird');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newCouple: Couple = {
        id: Date.now().toString(),
        maleId: selectedMaleId,
        femaleId: selectedFemaleId,
        season,
        active: true,
        notes: notes || undefined,
      };
      
      addCouple(newCouple);
      router.back();
    } catch (error) {
      console.error('Error adding couple:', error);
      Alert.alert('Error', 'Failed to add couple. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Male</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.birdList}>
          {males.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No male birds available</Text>
            </View>
          ) : (
            males.map(bird => (
              <TouchableOpacity
                key={bird.id}
                style={[
                  styles.birdCard,
                  selectedMaleId === bird.id && styles.selectedBirdCard,
                  selectedMaleId === bird.id && { borderColor: Colors.male },
                ]}
                onPress={() => setSelectedMaleId(bird.id)}
                testID={`select-male-${bird.id}`}
              >
                {bird.imageUri ? (
                  <View style={styles.birdImageContainer}>
                    <View style={[styles.genderIndicator, { backgroundColor: Colors.male }]} />
                    <View style={styles.birdImage}>
                      {/* Image would go here */}
                    </View>
                  </View>
                ) : (
                  <View style={styles.birdImagePlaceholder}>
                    <View style={[styles.genderIndicator, { backgroundColor: Colors.male }]} />
                    <Heart size={24} color={Colors.textLighter} />
                  </View>
                )}
                <Text style={styles.birdRingNumber}>{bird.ringNumber}</Text>
                <Text style={styles.birdSpecies} numberOfLines={1}>{bird.species}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Female</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.birdList}>
          {females.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No female birds available</Text>
            </View>
          ) : (
            females.map(bird => (
              <TouchableOpacity
                key={bird.id}
                style={[
                  styles.birdCard,
                  selectedFemaleId === bird.id && styles.selectedBirdCard,
                  selectedFemaleId === bird.id && { borderColor: Colors.female },
                ]}
                onPress={() => setSelectedFemaleId(bird.id)}
                testID={`select-female-${bird.id}`}
              >
                {bird.imageUri ? (
                  <View style={styles.birdImageContainer}>
                    <View style={[styles.genderIndicator, { backgroundColor: Colors.female }]} />
                    <View style={styles.birdImage}>
                      {/* Image would go here */}
                    </View>
                  </View>
                ) : (
                  <View style={styles.birdImagePlaceholder}>
                    <View style={[styles.genderIndicator, { backgroundColor: Colors.female }]} />
                    <Heart size={24} color={Colors.textLighter} />
                  </View>
                )}
                <Text style={styles.birdRingNumber}>{bird.ringNumber}</Text>
                <Text style={styles.birdSpecies} numberOfLines={1}>{bird.species}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Season</Text>
          <View style={styles.seasonContainer}>
            <TouchableOpacity
              style={[
                styles.seasonButton,
                season === (new Date().getFullYear() - 1).toString() && styles.selectedSeasonButton,
              ]}
              onPress={() => setSeason((new Date().getFullYear() - 1).toString())}
              testID="season-previous"
            >
              <Text style={[
                styles.seasonButtonText,
                season === (new Date().getFullYear() - 1).toString() && styles.selectedSeasonButtonText,
              ]}>
                {new Date().getFullYear() - 1}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.seasonButton,
                season === new Date().getFullYear().toString() && styles.selectedSeasonButton,
              ]}
              onPress={() => setSeason(new Date().getFullYear().toString())}
              testID="season-current"
            >
              <Text style={[
                styles.seasonButtonText,
                season === new Date().getFullYear().toString() && styles.selectedSeasonButtonText,
              ]}>
                {new Date().getFullYear()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.seasonButton,
                season === (new Date().getFullYear() + 1).toString() && styles.selectedSeasonButton,
              ]}
              onPress={() => setSeason((new Date().getFullYear() + 1).toString())}
              testID="season-next"
            >
              <Text style={[
                styles.seasonButtonText,
                season === (new Date().getFullYear() + 1).toString() && styles.selectedSeasonButtonText,
              ]}>
                {new Date().getFullYear() + 1}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          type="outline"
          testID="button-cancel"
        />
        <Button
          title="Create Couple"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!selectedMaleId || !selectedFemaleId}
          testID="button-submit"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginBottom: 24,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  birdList: {
    flexDirection: 'row',
  },
  birdCard: {
    width: 120,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBirdCard: {
    borderWidth: 2,
  },
  birdImageContainer: {
    position: 'relative',
    width: '100%',
    height: 100,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  birdImagePlaceholder: {
    position: 'relative',
    width: '100%',
    height: 100,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  genderIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 4,
    zIndex: 1,
  },
  birdImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  birdRingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  birdSpecies: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emptyState: {
    width: '100%',
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  seasonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seasonButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedSeasonButton: {
    backgroundColor: Colors.primary,
  },
  seasonButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedSeasonButtonText: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 40,
  },
});