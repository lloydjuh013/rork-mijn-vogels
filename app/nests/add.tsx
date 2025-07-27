import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Egg } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import Button from '@/components/Button';
import { Nest } from '@/types/bird';

export default function AddNestScreen() {
  const router = useRouter();
  const { coupleId } = useLocalSearchParams<{ coupleId?: string }>();
  const { addNest, getCoupleById, getBirdById } = useBirdStore();
  
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [eggCount, setEggCount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  
  const couple = coupleId ? getCoupleById(coupleId) : null;
  const male = couple ? getBirdById(couple.maleId) : null;
  const female = couple ? getBirdById(couple.femaleId) : null;
  
  const handleSubmit = () => {
    if (!coupleId) {
      Alert.alert('Fout', 'Geen koppel geselecteerd');
      return;
    }
    
    if (!startDate) {
      Alert.alert('Fout', 'Startdatum is verplicht');
      return;
    }
    
    const newNest: Nest = {
      id: Date.now().toString(),
      coupleId,
      startDate: new Date(startDate),
      active: true,
      eggCount: parseInt(eggCount) || 0,
      notes: notes.trim() || undefined,
    };
    
    addNest(newNest);
    Alert.alert('Succes', 'Nest succesvol toegevoegd', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Nieuw Nest Toevoegen</Text>
        {couple && (
          <View style={styles.coupleInfo}>
            <Text style={styles.coupleText}>
              Koppel: {male?.ringNumber || 'Onbekend'} & {female?.ringNumber || 'Onbekend'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Startdatum</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            testID="start-date-input"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aantal Eieren</Text>
          <TextInput
            style={styles.input}
            value={eggCount}
            onChangeText={setEggCount}
            placeholder="0"
            keyboardType="numeric"
            testID="egg-count-input"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notities (optioneel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Voeg notities toe..."
            multiline
            numberOfLines={4}
            testID="notes-input"
          />
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button
          title="Annuleren"
          onPress={() => router.back()}
          type="outline"
          testID="cancel-button"
        />
        <Button
          title="Nest Toevoegen"
          onPress={handleSubmit}
          type="primary"
          icon={<Egg size={20} color={Colors.cardBackground} />}
          testID="submit-button"
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
    marginBottom: 8,
  },
  coupleInfo: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
  },
  coupleText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});