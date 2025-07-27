import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, Alert, TouchableOpacity, Share, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Trash2, Download, Upload, Bell, TreePine, Mail, Globe } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useBirdStore } from '@/hooks/bird-store';
import { useAuth } from '@/hooks/auth-store';

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const { birds, couples, aviaries, nests } = useBirdStore();
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportData = async () => {
    setIsExporting(true);
    try {
      // Create comprehensive backup data
      const backupData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          createdAt: user?.createdAt
        },
        data: {
          birds: birds,
          couples: couples,
          aviaries: aviaries,
          nests: nests
        },
        statistics: {
          totalBirds: birds.length,
          totalCouples: couples.length,
          totalAviaries: aviaries.length,
          totalNests: nests.length,
          activeBirds: birds.filter(b => b.status === 'active').length,
          activeCouples: couples.filter(c => c.active).length
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const fileName = `MyBird_Backup_${new Date().toISOString().split('T')[0]}.json`;
      
      if (Platform.OS === 'web') {
        // Web: Download as file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Gelukt', 'Backup bestand is gedownload.');
      } else {
        // Mobile: Share the data
        await Share.share({
          message: `MyBird Data Backup\n\nGebruiker: ${user?.name}\nExport Datum: ${new Date().toLocaleDateString('nl-NL')}\n\nData:\n${jsonString}`,
          title: 'MyBird Data Backup'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Fout', 'Kon gegevens niet exporteren. Probeer opnieuw.');
    } finally {
      setIsExporting(false);
    }
  };

  const importData = () => {
    Alert.alert(
      'Gegevens Importeren',
      'Voor het importeren van gegevens, neem contact op met info@mybird.app. Stuur je backup bestand mee en wij helpen je bij het herstellen van je gegevens.',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Contact Opnemen', 
          onPress: () => {
            const email = 'info@mybird.app';
            const subject = 'MyBird Data Import Verzoek';
            const body = `Hallo,\n\nIk wil graag mijn MyBird gegevens importeren.\n\nGebruiker: ${user?.name}\nEmail: ${user?.email}\n\nIk heb mijn backup bestand bijgevoegd.\n\nMet vriendelijke groet`;
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            Linking.openURL(mailtoUrl).catch(() => {
              Alert.alert('Fout', 'Kon email app niet openen. Stuur handmatig een email naar info@mybird.app');
            });
          }
        }
      ]
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
        
        <TouchableOpacity 
          style={[styles.dataButton, isExporting && styles.disabledButton]} 
          onPress={exportData} 
          disabled={isExporting}
          testID="export-button"
        >
          <Download size={20} color={isExporting ? Colors.textLight : Colors.text} />
          <Text style={[styles.dataButtonText, isExporting && styles.disabledText]}>
            {isExporting ? 'Exporteren...' : 'Gegevens Exporteren'}
          </Text>
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
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gebruiker</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data Locatie</Text>
            <Text style={styles.infoValue}>Lokaal Apparaat (AsyncStorage)</Text>
          </View>
        </View>
        
        <View style={styles.dataLocationInfo}>
          <Text style={styles.dataLocationTitle}>📍 Waar worden mijn gegevens opgeslagen?</Text>
          <Text style={styles.dataLocationText}>
            Je gegevens worden lokaal op je apparaat opgeslagen in AsyncStorage. Dit betekent:
          </Text>
          <Text style={styles.dataLocationBullet}>• Gegevens blijven privé op jouw apparaat</Text>
          <Text style={styles.dataLocationBullet}>• Geen cloud synchronisatie</Text>
          <Text style={styles.dataLocationBullet}>• Bij app verwijdering gaan gegevens verloren</Text>
          <Text style={styles.dataLocationBullet}>• Maak regelmatig een backup via &apos;Gegevens Exporteren&apos;</Text>
          
          <Text style={styles.dataLocationRestore}>
            💡 Gegevens kwijt? Stuur je backup bestand naar info@mybird.app voor herstel.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={() => Alert.alert('Stamboom', 'Deze functie wordt beschikbaar in een toekomstige update.')} 
          testID="pedigree-button"
        >
          <TreePine size={20} color={Colors.primary} />
          <Text style={styles.helpButtonText}>Stamboom Genereren</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={() => {
            const email = 'info@mybird.app';
            const subject = 'MyBird Help & Ondersteuning';
            const body = `Hallo,\n\nIk heb hulp nodig met MyBird.\n\nGebruiker: ${user?.name}\nEmail: ${user?.email}\n\nMijn vraag:\n[Beschrijf hier je vraag]\n\nMet vriendelijke groet`;
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            Linking.openURL(mailtoUrl).catch(() => {
              Alert.alert('Fout', 'Kon email app niet openen. Stuur handmatig een email naar info@mybird.app');
            });
          }}
          testID="help-button"
        >
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={styles.helpButtonText}>Help & Ondersteuning</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={() => {
            Linking.openURL('https://mybird.app').catch(() => {
              Alert.alert('Fout', 'Kon website niet openen. Ga handmatig naar www.mybird.app');
            });
          }}
          testID="website-button"
        >
          <Globe size={20} color={Colors.primary} />
          <Text style={styles.helpButtonText}>Bezoek Website</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={() => {
            const email = 'info@mybird.app';
            const subject = 'MyBird Contact';
            const body = `Hallo,\n\nGebruiker: ${user?.name}\nEmail: ${user?.email}\n\nMijn bericht:\n[Schrijf hier je bericht]\n\nMet vriendelijke groet`;
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            Linking.openURL(mailtoUrl).catch(() => {
              Alert.alert('Fout', 'Kon email app niet openen. Stuur handmatig een email naar info@mybird.app');
            });
          }}
          testID="contact-button"
        >
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
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: Colors.textLight,
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
  dataLocationInfo: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  dataLocationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  dataLocationText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  dataLocationBullet: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    lineHeight: 18,
  },
  dataLocationRestore: {
    fontSize: 14,
    color: Colors.info,
    marginTop: 12,
    fontWeight: '600',
    lineHeight: 18,
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