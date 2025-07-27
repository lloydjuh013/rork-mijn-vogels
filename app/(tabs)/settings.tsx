import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { Info, HelpCircle, Trash2, Download, Upload, Bell, TreePine, Mail, Globe } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const toggleNotifications = () => {
    setNotificationsEnabled(previous => !previous);
  };

  const resetAllData = async () => {
    Alert.alert(
      'Alle Gegevens Resetten',
      'Weet je zeker dat je alle gegevens wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Resetten',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await AsyncStorage.clear();
              queryClient.invalidateQueries();
              Alert.alert('Gelukt', 'Alle gegevens zijn gereset.');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Fout', 'Kon gegevens niet resetten. Probeer opnieuw.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const exportData = () => {
    Alert.alert(
      'Gegevens Exporteren',
      'Deze functie wordt beschikbaar in een toekomstige update.',
      [{ text: 'OK' }]
    );
  };

  const importData = () => {
    Alert.alert(
      'Gegevens Importeren',
      'Deze functie wordt beschikbaar in een toekomstige update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voorkeuren</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Bell size={20} color={Colors.text} />
            <Text style={styles.settingLabel}>Meldingen</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.cardBackground}
            testID="notifications-switch"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gegevensbeheer</Text>
        
        <TouchableOpacity style={styles.dataButton} onPress={exportData} testID="export-button">
          <Download size={20} color={Colors.text} />
          <Text style={styles.dataButtonText}>Gegevens Exporteren</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dataButton} onPress={importData} testID="import-button">
          <Upload size={20} color={Colors.text} />
          <Text style={styles.dataButtonText}>Gegevens Importeren</Text>
        </TouchableOpacity>
        
        <Button
          title="Alle Gegevens Resetten"
          onPress={resetAllData}
          type="danger"
          icon={<Trash2 size={20} color={Colors.cardBackground} />}
          loading={isResetting}
          testID="reset-button"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Over</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Naam</Text>
            <Text style={styles.infoValue}>MyBird</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Versie</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website</Text>
            <Text style={styles.infoValue}>www.mybird.app</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact</Text>
            <Text style={styles.infoValue}>info@mybird.app</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.helpButton} onPress={() => Alert.alert('Stamboom', 'Deze functie wordt beschikbaar in een toekomstige update.')} testID="pedigree-button">
          <TreePine size={20} color={Colors.primary} />
          <Text style={styles.helpButtonText}>Stamboom Genereren</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpButton} testID="help-button">
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={styles.helpButtonText}>Help & Ondersteuning</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpButton} testID="website-button">
          <Globe size={20} color={Colors.primary} />
          <Text style={styles.helpButtonText}>Bezoek Website</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpButton} testID="contact-button">
          <Mail size={20} color={Colors.primary} />
          <Text style={styles.helpButtonText}>Contact Opnemen</Text>
        </TouchableOpacity>
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
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dataButtonText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  helpButtonText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 12,
  },
});