import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';
import { Aviary } from '@/types/bird';

export default function AddAviaryScreen() {
  const router = useRouter();
  const { addAviary } = useBirdStore();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Locatie is verplicht';
    }
    
    if (!capacity.trim()) {
      newErrors.capacity = 'Capaciteit is verplicht';
    } else if (isNaN(Number(capacity)) || Number(capacity) <= 0) {
      newErrors.capacity = 'Capaciteit moet een positief getal zijn';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const aviaryData: Aviary = {
        id: Date.now().toString(),
        name,
        location,
        capacity: Number(capacity),
        notes: notes || undefined,
      };
      
      addAviary(aviaryData);
      router.back();
    } catch (error) {
      console.error('Error submitting aviary form:', error);
      Alert.alert('Fout', 'Kon kooi gegevens niet opslaan. Probeer opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Voeg kooi toe' }} />
      <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Naam *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="Voer kooi naam in"
          testID="input-name"
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Locatie *</Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          value={location}
          onChangeText={setLocation}
          placeholder="Voer locatie in"
          testID="input-location"
        />
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Capaciteit *</Text>
        <TextInput
          style={[styles.input, errors.capacity && styles.inputError]}
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Voer capaciteit in"
          keyboardType="numeric"
          testID="input-capacity"
        />
        {errors.capacity && (
          <Text style={styles.errorText}>{errors.capacity}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Notities</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Voer notities over deze kooi in"
          multiline
          numberOfLines={4}
          testID="input-notes"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Annuleren"
          onPress={() => router.back()}
          type="outline"
          testID="button-cancel"
        />
        <Button
          title="Kooi Toevoegen"
          onPress={handleSubmit}
          loading={isSubmitting}
          testID="button-submit"
        />
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
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
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
});