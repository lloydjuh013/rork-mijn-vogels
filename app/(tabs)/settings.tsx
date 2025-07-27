import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, Alert, TouchableOpacity, Share, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Trash2, Download, Upload, Bell, TreePine, Mail, Globe, LogOut } from 'lucide-react-native';

import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useBirdStore } from '@/hooks/bird-store';
import { useAuth } from '@/hooks/auth-store';

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const { birds, couples, aviaries, nests } = useBirdStore();
  const { user, logout, isLoggingOut } = useAuth();
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
      const exportDate = new Date();
      const dateString = exportDate.toLocaleDateString('nl-NL');
      const timeString = exportDate.toLocaleTimeString('nl-NL');
      
      // Create readable text format
      let textContent = `MYBIRD DATA EXPORT\n`;
      textContent += `===================\n\n`;
      textContent += `Export Datum: ${dateString} ${timeString}\n`;
      textContent += `App Versie: 1.0.0\n`;
      textContent += `Gebruiker: ${user?.name} (${user?.email})\n\n`;
      
      // Statistics
      textContent += `STATISTIEKEN\n`;
      textContent += `------------\n`;
      textContent += `Totaal Vogels: ${birds.length}\n`;
      textContent += `Actieve Vogels: ${birds.filter(b => b.status === 'active').length}\n`;
      textContent += `Totaal Koppels: ${couples.length}\n`;
      textContent += `Actieve Koppels: ${couples.filter(c => c.active).length}\n`;
      textContent += `Totaal Kooien: ${aviaries.length}\n`;
      textContent += `Totaal Nesten: ${nests.length}\n\n`;
      
      // Birds data
      if (birds.length > 0) {
        textContent += `VOGELS (${birds.length})\n`;
        textContent += `=======\n`;
        birds.forEach((bird, index) => {
          textContent += `${index + 1}. ${bird.name || 'Naamloos'}\n`;
          textContent += `   Ring: ${bird.ringNumber}\n`;
          textContent += `   Soort: ${bird.species}\n`;
          if (bird.subspecies) textContent += `   Ondersoort: ${bird.subspecies}\n`;
          textContent += `   Geslacht: ${bird.gender === 'male' ? 'Man' : bird.gender === 'female' ? 'Vrouw' : 'Onbekend'}\n`;
          if (bird.colorMutation) textContent += `   Kleurmutatie: ${bird.colorMutation}\n`;
          textContent += `   Geboortedatum: ${new Date(bird.birthDate).toLocaleDateString('nl-NL')}\n`;
          textContent += `   Herkomst: ${bird.origin === 'purchased' ? 'Gekocht' : bird.origin === 'bred' ? 'Gefokt' : 'Gered'}\n`;
          textContent += `   Status: ${bird.status === 'active' ? 'Actief' : bird.status === 'sold' ? 'Verkocht' : bird.status === 'deceased' ? 'Overleden' : 'Onbekend'}\n`;
          if (bird.aviaryId) textContent += `   Kooi ID: ${bird.aviaryId}\n`;
          textContent += `\n`;
        });
      }
      
      // Couples data
      if (couples.length > 0) {
        textContent += `KOPPELS (${couples.length})\n`;
        textContent += `========\n`;
        couples.forEach((couple, index) => {
          const maleBird = birds.find(b => b.id === couple.maleId);
          const femaleBird = birds.find(b => b.id === couple.femaleId);
          textContent += `${index + 1}. Koppel\n`;
          textContent += `   Man: ${maleBird?.name || 'Onbekend'} (${maleBird?.ringNumber || 'Geen ring'})\n`;
          textContent += `   Vrouw: ${femaleBird?.name || 'Onbekend'} (${femaleBird?.ringNumber || 'Geen ring'})\n`;
          textContent += `   Seizoen: ${couple.season}\n`;
          textContent += `   Actief: ${couple.active ? 'Ja' : 'Nee'}\n`;
          if (couple.notes) textContent += `   Notities: ${couple.notes}\n`;
          textContent += `\n`;
        });
      }
      
      // Aviaries data
      if (aviaries.length > 0) {
        textContent += `KOOIEN (${aviaries.length})\n`;
        textContent += `=======\n`;
        aviaries.forEach((aviary, index) => {
          const aviaryBirds = birds.filter(b => b.aviaryId === aviary.id);
          textContent += `${index + 1}. ${aviary.name}\n`;
          textContent += `   Capaciteit: ${aviary.capacity}\n`;
          textContent += `   Locatie: ${aviary.location}\n`;
          textContent += `   Vogels: ${aviaryBirds.length}\n`;
          if (aviary.notes) textContent += `   Notities: ${aviary.notes}\n`;
          textContent += `\n`;
        });
      }
      
      // Nests data
      if (nests.length > 0) {
        textContent += `NESTEN (${nests.length})\n`;
        textContent += `=======\n`;
        nests.forEach((nest, index) => {
          textContent += `${index + 1}. Nest\n`;
          textContent += `   Koppel ID: ${nest.coupleId}\n`;
          textContent += `   Start datum: ${new Date(nest.startDate).toLocaleDateString('nl-NL')}\n`;
          if (nest.eggCount) textContent += `   Aantal eieren: ${nest.eggCount}\n`;
          textContent += `   Actief: ${nest.active ? 'Ja' : 'Nee'}\n`;
          if (nest.notes) textContent += `   Notities: ${nest.notes}\n`;
          textContent += `\n`;
        });
      }
      
      // Add JSON data at the end for technical backup
      const backupData = {
        exportDate: exportDate.toISOString(),
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
        }
      };
      
      textContent += `\n\n=== TECHNISCHE DATA (JSON) ===\n`;
      textContent += JSON.stringify(backupData, null, 2);
      
      const fileName = `MyBird_Export_${exportDate.toISOString().split('T')[0]}.txt`;
      
      if (Platform.OS === 'web') {
        // Web: Download as .txt file
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Gelukt', 'Export bestand (.txt) is gedownload.');
      } else {
        // Mobile: Share the data
        await Share.share({
          message: textContent,
          title: 'MyBird Data Export'
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
      'Voor het importeren van gegevens, neem contact op met info@mybird.app. Stuur je export bestand (.txt) mee en wij helpen je bij het herstellen van je gegevens.',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Contact Opnemen', 
          onPress: () => {
            const email = 'info@mybird.app';
            const subject = 'MyBird Data Import Verzoek';
            const body = `Hallo,\n\nIk wil graag mijn MyBird gegevens importeren.\n\nGebruiker: ${user?.name}\nEmail: ${user?.email}\n\nIk heb mijn export bestand (.txt) bijgevoegd.\n\nMet vriendelijke groet`;
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            Linking.openURL(mailtoUrl).catch(() => {
              Alert.alert('Fout', 'Kon email app niet openen. Stuur handmatig een email naar info@mybird.app');
            });
          }
        }
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Uitloggen', 
          style: 'destructive',
          onPress: () => {
            console.log('Starting logout process...');
            logout();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <Button
          title="Uitloggen"
          onPress={handleLogout}
          type="danger"
          icon={<LogOut size={20} color={Colors.cardBackground} />}
          loading={isLoggingOut}
          testID="logout-button"
        />
      </View>
      
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
            <Text style={styles.infoValue}>Per Email Account (AsyncStorage)</Text>
          </View>
        </View>
        
        <View style={styles.dataLocationInfo}>
          <Text style={styles.dataLocationTitle}>📍 Waar worden mijn gegevens opgeslagen?</Text>
          <Text style={styles.dataLocationText}>
            Je gegevens worden lokaal op je apparaat opgeslagen per email account. Dit betekent:
          </Text>
          <Text style={styles.dataLocationBullet}>• Gegevens blijven privé op jouw apparaat</Text>
          <Text style={styles.dataLocationBullet}>• Meerdere accounts mogelijk op hetzelfde apparaat</Text>
          <Text style={styles.dataLocationBullet}>• Geen cloud synchronisatie tussen apparaten</Text>
          <Text style={styles.dataLocationBullet}>• Bij app verwijdering gaan gegevens verloren</Text>
          <Text style={styles.dataLocationBullet}>• Maak regelmatig een export via &apos;Gegevens Exporteren&apos;</Text>
          
          <Text style={styles.dataLocationRestore}>
            💡 Gegevens kwijt? Stuur je export bestand (.txt) naar info@mybird.app voor herstel.
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