import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { Crown, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from './Button';


type PremiumGateProps = {
  visible: boolean;
  onClose: () => void;
  feature: string;
};

const PremiumGate: React.FC<PremiumGateProps> = ({ visible, onClose, feature }) => {

  const handleContinue = () => {
    // In free version, just close the modal
    onClose();
  };



  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Crown size={64} color={Colors.warning} />
          </View>

          <Text style={styles.title}>MyBird - Gratis Vogelkweek App</Text>
          
          <Text style={styles.subtitle}>
            Alle functies van MyBird zijn gratis beschikbaar! Geniet van volledige toegang tot &quot;{feature}&quot; en alle andere functies.
          </Text>
          
          <View style={styles.freeInfo}>
            <Text style={styles.freeText}>
              🎉 100% Gratis - Geen abonnement nodig!
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Gratis functies:</Text>
            
            <View style={styles.feature}>
              <Check size={20} color={Colors.success} />
              <Text style={styles.featureText}>Onbeperkt vogels toevoegen</Text>
            </View>
            
            <View style={styles.feature}>
              <Check size={20} color={Colors.success} />
              <Text style={styles.featureText}>Koppels en nesten beheren</Text>
            </View>
            
            <View style={styles.feature}>
              <Check size={20} color={Colors.success} />
              <Text style={styles.featureText}>Stamboom functionaliteit</Text>
            </View>
            
            <View style={styles.feature}>
              <Check size={20} color={Colors.success} />
              <Text style={styles.featureText}>Excel export</Text>
            </View>
            
            <View style={styles.feature}>
              <Check size={20} color={Colors.success} />
              <Text style={styles.featureText}>Backup & sync</Text>
            </View>
            
            <View style={styles.feature}>
              <Check size={20} color={Colors.success} />
              <Text style={styles.featureText}>Gratis support</Text>
            </View>
          </View>

          <View style={styles.pricing}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>€0,00</Text>
              <Text style={styles.priceSubtext}>altijd gratis</Text>
            </View>
            <Text style={styles.pricingNote}>Geen verborgen kosten</Text>
          </View>

          <View style={styles.actions}>
            <Button
              title="Doorgaan"
              onPress={handleContinue}
              type="primary"
              testID="continue-button"
            />
          </View>

          <Text style={styles.contactInfo}>
            Vragen? Mail naar info@mybird.app
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  freeInfo: {
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  freeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceSubtext: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 8,
  },
  pricingNote: {
    fontSize: 14,
    color: Colors.textLight,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  contactInfo: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default PremiumGate;