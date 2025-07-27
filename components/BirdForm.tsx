import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Calendar, X } from 'lucide-react-native';
import { Bird, Gender, BirdStatus } from '@/types/bird';
import Colors from '@/constants/colors';
import Button from './Button';
import { useBirdStore } from '@/hooks/bird-store';
import { TouchableOpacity } from 'react-native-gesture-handler';

type BirdFormProps = {
  initialBird?: Bird;
  onSubmit: (bird: Bird) => void;
};

const BirdForm: React.FC<BirdFormProps> = ({ initialBird, onSubmit }) => {
  const router = useRouter();
  const { aviaries, birds } = useBirdStore();
  
  const [ringNumber, setRingNumber] = useState(initialBird?.ringNumber || '');
  const [species, setSpecies] = useState(initialBird?.species || '');
  const [subspecies, setSubspecies] = useState(initialBird?.subspecies || '');
  const [gender, setGender] = useState<Gender>(initialBird?.gender || 'unknown');
  const [colorMutation, setColorMutation] = useState(initialBird?.colorMutation || '');
  const [birthDate, setBirthDate] = useState(initialBird?.birthDate ? new Date(initialBird.birthDate) : new Date());
  const [origin, setOrigin] = useState<'purchased' | 'bred' | 'rescue'>(initialBird?.origin || 'purchased');
  const [status, setStatus] = useState<BirdStatus>(initialBird?.status || 'active');
  const [aviaryId, setAviaryId] = useState(initialBird?.aviaryId || '');
  const [notes, setNotes] = useState(initialBird?.notes || '');
  const [imageUri, setImageUri] = useState(initialBird?.imageUri || '');
  const [fatherId, setFatherId] = useState(initialBird?.fatherId || '');
  const [motherId, setMotherId] = useState(initialBird?.motherId || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!ringNumber.trim()) {
      newErrors.ringNumber = 'Ringnummer is verplicht';
    }
    
    if (!species.trim()) {
      newErrors.species = 'Soort is verplicht';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const birdData: Bird = {
        id: initialBird?.id || Date.now().toString(),
        ringNumber,
        species,
        subspecies: subspecies || undefined,
        gender,
        colorMutation: colorMutation || undefined,
        birthDate,
        origin,
        status,
        aviaryId: aviaryId || undefined,
        notes: notes || undefined,
        imageUri: imageUri || undefined,
        fatherId: fatherId || undefined,
        motherId: motherId || undefined,
      };
      
      onSubmit(birdData);
    } catch (error) {
      console.error('Error submitting bird form:', error);
      Alert.alert('Fout', 'Kon vogelgegevens niet opslaan. Probeer opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Toestemming Vereist', 'Geef toegang tot fotobibliotheek om een afbeelding te uploaden.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Toestemming Vereist', 'Geef cameratoegang om een foto te maken.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri('');
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ringnummer *</Text>
        <TextInput
          style={[styles.input, errors.ringNumber && styles.inputError]}
          value={ringNumber}
          onChangeText={setRingNumber}
          placeholder="Voer ringnummer in"
          testID="input-ring-number"
        />
        {errors.ringNumber && (
          <Text style={styles.errorText}>{errors.ringNumber}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Soort *</Text>
        <TextInput
          style={[styles.input, errors.species && styles.inputError]}
          value={species}
          onChangeText={setSpecies}
          placeholder="Voer soort in"
          testID="input-species"
        />
        {errors.species && (
          <Text style={styles.errorText}>{errors.species}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ondersoort</Text>
        <TextInput
          style={styles.input}
          value={subspecies}
          onChangeText={setSubspecies}
          placeholder="Voer ondersoort in (optioneel)"
          testID="input-subspecies"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Geslacht</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              gender === 'male' && styles.selectedOption,
              gender === 'male' && { backgroundColor: Colors.male },
            ]}
            onPress={() => setGender('male')}
            testID="option-gender-male"
          >
            <Text style={[
              styles.optionText,
              gender === 'male' && styles.selectedOptionText,
            ]}>
              Man
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              gender === 'female' && styles.selectedOption,
              gender === 'female' && { backgroundColor: Colors.female },
            ]}
            onPress={() => setGender('female')}
            testID="option-gender-female"
          >
            <Text style={[
              styles.optionText,
              gender === 'female' && styles.selectedOptionText,
            ]}>
              Vrouw
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              gender === 'unknown' && styles.selectedOption,
              gender === 'unknown' && { backgroundColor: Colors.unknown },
            ]}
            onPress={() => setGender('unknown')}
            testID="option-gender-unknown"
          >
            <Text style={[
              styles.optionText,
              gender === 'unknown' && styles.selectedOptionText,
            ]}>
              Onbekend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kleurmutatie</Text>
        <TextInput
          style={styles.input}
          value={colorMutation}
          onChangeText={setColorMutation}
          placeholder="Voer kleurmutatie in (optioneel)"
          testID="input-color-mutation"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Geboortedatum</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            value={formatDate(birthDate)}
            onChangeText={(text) => {
              try {
                const newDate = new Date(text);
                if (!isNaN(newDate.getTime())) {
                  setBirthDate(newDate);
                }
              } catch (e) {
                console.log('Invalid date format');
              }
            }}
            placeholder="YYYY-MM-DD"
            testID="input-birth-date"
          />
          <Calendar size={20} color={Colors.textLight} />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Herkomst</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              origin === 'purchased' && styles.selectedOption,
            ]}
            onPress={() => setOrigin('purchased')}
            testID="option-origin-purchased"
          >
            <Text style={[
              styles.optionText,
              origin === 'purchased' && styles.selectedOptionText,
            ]}>
              Gekocht
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              origin === 'bred' && styles.selectedOption,
            ]}
            onPress={() => setOrigin('bred')}
            testID="option-origin-bred"
          >
            <Text style={[
              styles.optionText,
              origin === 'bred' && styles.selectedOptionText,
            ]}>
              Gefokt
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              origin === 'rescue' && styles.selectedOption,
            ]}
            onPress={() => setOrigin('rescue')}
            testID="option-origin-rescue"
          >
            <Text style={[
              styles.optionText,
              origin === 'rescue' && styles.selectedOptionText,
            ]}>
              Gered
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              status === 'active' && styles.selectedOption,
            ]}
            onPress={() => setStatus('active')}
            testID="option-status-active"
          >
            <Text style={[
              styles.optionText,
              status === 'active' && styles.selectedOptionText,
            ]}>
              Actief
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              status === 'deceased' && styles.selectedOption,
            ]}
            onPress={() => setStatus('deceased')}
            testID="option-status-deceased"
          >
            <Text style={[
              styles.optionText,
              status === 'deceased' && styles.selectedOptionText,
            ]}>
              Overleden
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              status === 'sold' && styles.selectedOption,
            ]}
            onPress={() => setStatus('sold')}
            testID="option-status-sold"
          >
            <Text style={[
              styles.optionText,
              status === 'sold' && styles.selectedOptionText,
            ]}>
              Verkocht
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              status === 'exchanged' && styles.selectedOption,
            ]}
            onPress={() => setStatus('exchanged')}
            testID="option-status-exchanged"
          >
            <Text style={[
              styles.optionText,
              status === 'exchanged' && styles.selectedOptionText,
            ]}>
              Geruild
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Vogelafbeelding</Text>
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.removeImageButton} 
              onPress={removeImage}
              testID="button-remove-image"
            >
              <X size={20} color={Colors.cardBackground} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageButtonsContainer}>
            <Button
              title="Kies uit Galerij"
              onPress={pickImage}
              type="outline"
              icon={<ImageIcon size={20} color={Colors.primary} />}
              testID="button-pick-image"
            />
            <Button
              title="Maak Foto"
              onPress={takePhoto}
              type="outline"
              icon={<Camera size={20} color={Colors.primary} />}
              testID="button-take-photo"
            />
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Notities</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Voer notities over deze vogel in"
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
          title={initialBird ? "Vogel Bijwerken" : "Vogel Toevoegen"}
          onPress={handleSubmit}
          loading={isSubmitting}
          testID="button-submit"
        />
      </View>
    </ScrollView>
  );
};

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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: Colors.cardBackground,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionText: {
    color: Colors.text,
    fontSize: 14,
  },
  selectedOptionText: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingRight: 12,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.danger,
    borderRadius: 20,
    padding: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
});

export default BirdForm;