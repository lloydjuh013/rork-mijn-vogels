import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { Crown, X, Check, CreditCard } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import Colors from '@/constants/colors';
import Button from './Button';
import { useAuth } from '@/hooks/auth-store';
import { createPaymentIntent, createCustomer } from '@/utils/stripe';

type PremiumGateProps = {
  visible: boolean;
  onClose: () => void;
  feature: string;
};

const PremiumGate: React.FC<PremiumGateProps> = ({ visible, onClose, feature }) => {
  const { subscriptionStatus, daysLeftInTrial, updateSubscription, user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert('Fout', 'Gebruiker niet gevonden');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Create or get customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        customerId = await createCustomer(user.email, user.name);
        // Update user with customer ID (in real app, this would be saved to backend)
      }

      // Create payment intent
      const { client_secret } = await createPaymentIntent(customerId);

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'MyBird',
        paymentIntentClientSecret: client_secret,
        defaultBillingDetails: {
          name: user.name,
          email: user.email,
        },
        allowsDelayedPaymentMethods: false,
        returnURL: 'mybird://payment-return',
      });

      if (initError) {
        Alert.alert('Fout', 'Kon betaling niet initialiseren');
        return;
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Betaling Mislukt', paymentError.message);
        }
        return;
      }

      // Payment successful
      updateSubscription('active');
      Alert.alert(
        'Betaling Gelukt! 🎉',
        'Welkom bij MyBird Premium! Je hebt nu toegang tot alle premium functies.',
        [{ text: 'Geweldig!', onPress: onClose }]
      );
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij de betaling. Probeer het opnieuw.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleStartTrial = () => {
    // Simulate starting premium trial
    updateSubscription('active');
    onClose();
  };

  const isTrialExpired = subscriptionStatus === 'expired';

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

          <Text style={styles.title}>Premium Functie</Text>
          
          {isTrialExpired ? (
            <>
              <Text style={styles.subtitle}>
                Je proefperiode is verlopen. Upgrade naar Premium om &quot;{feature}&quot; te gebruiken.
              </Text>
              
              <View style={styles.trialExpiredInfo}>
                <Text style={styles.expiredText}>
                  ⏰ Je 30 dagen gratis proefperiode is afgelopen
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                &quot;{feature}&quot; is een Premium functie. Je hebt nog {daysLeftInTrial} dagen van je gratis proefperiode over.
              </Text>
              
              <View style={styles.trialInfo}>
                <Text style={styles.trialText}>
                  🎉 Nog {daysLeftInTrial} dagen gratis
                </Text>
              </View>
            </>
          )}

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium voordelen:</Text>
            
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
              <Text style={styles.featureText}>Premium support</Text>
            </View>
          </View>

          <View style={styles.pricing}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>€9,95</Text>
              <Text style={styles.priceSubtext}>per maand</Text>
            </View>
            <Text style={styles.pricingNote}>Altijd opzegbaar</Text>
          </View>

          <View style={styles.actions}>
            {isTrialExpired ? (
              <Button
                title={isProcessingPayment ? "Verwerken..." : "Upgrade naar Premium"}
                onPress={handleUpgrade}
                type="primary"
                icon={<CreditCard size={20} color={Colors.cardBackground} />}
                disabled={isProcessingPayment}
                testID="upgrade-button"
              />
            ) : (
              <Button
                title="Doorgaan met Proefperiode"
                onPress={handleStartTrial}
                type="primary"
                testID="continue-trial-button"
              />
            )}
            
            <Button
              title="Misschien Later"
              onPress={onClose}
              type="outline"
              testID="maybe-later-button"
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
  trialInfo: {
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  trialText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  trialExpiredInfo: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  expiredText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
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