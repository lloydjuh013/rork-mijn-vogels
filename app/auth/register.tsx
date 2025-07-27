import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/auth-store';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isRegistering, registerError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleRegister = () => {
    console.log('Register button pressed');
    
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Fout', 'Vul je naam in');
      return;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Fout', 'Vul je e-mailadres in');
      return;
    }
    
    if (!formData.email.includes('@')) {
      Alert.alert('Fout', 'Vul een geldig e-mailadres in');
      return;
    }
    
    if (formData.password.length < 8) {
      Alert.alert('Fout', 'Wachtwoord moet minimaal 8 karakters bevatten');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Fout', 'Wachtwoorden komen niet overeen');
      return;
    }
    
    if (!acceptedTerms) {
      Alert.alert('Fout', 'Accepteer de algemene voorwaarden om door te gaan');
      return;
    }

    console.log('All validation passed, calling register');
    register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });
  };
  
  // Redirect to main app when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('User is now authenticated, redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const openWebsite = () => {
    Linking.openURL('https://mybird.app');
  };

  const openTerms = () => {
    Linking.openURL('https://mybird.app/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://mybird.app/privacy');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Welkom bij MyBird</Text>
        <Text style={styles.subtitle}>
          Maak een account aan om je vogelkweek te beheren
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Naam</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Je volledige naam"
              autoCapitalize="words"
              testID="name-input"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>E-mailadres</Text>
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="je@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Wachtwoord</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="Minimaal 8 karakters"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              testID="password-input"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.textLight} />
              ) : (
                <Eye size={20} color={Colors.textLight} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bevestig Wachtwoord</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Herhaal je wachtwoord"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              testID="confirm-password-input"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={Colors.textLight} />
              ) : (
                <Eye size={20} color={Colors.textLight} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          testID="terms-checkbox"
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            Ik accepteer de{' '}
            <Text style={styles.link} onPress={openTerms}>
              algemene voorwaarden
            </Text>
            {' '}en{' '}
            <Text style={styles.link} onPress={openPrivacy}>
              privacybeleid
            </Text>
          </Text>
        </TouchableOpacity>

        {registerError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{registerError}</Text>
          </View>
        )}

        <Button
          title={isRegistering ? "Account wordt aangemaakt..." : "Account Aanmaken"}
          onPress={handleRegister}
          type="primary"
          disabled={isRegistering}
          loading={isRegistering}
          fullWidth={true}
          testID="register-button"
        />
        
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            💡 Tip: Na registratie wordt je automatisch ingelogd
          </Text>
        </View>


      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Heb je al een account?{' '}
          <Text style={styles.link} onPress={() => router.push('/auth/login')}>
            Inloggen
          </Text>
        </Text>
        
        <TouchableOpacity onPress={openWebsite} style={styles.websiteButton}>
          <Text style={styles.websiteText}>Bezoek mybird.app</Text>
        </TouchableOpacity>
        
        <Text style={styles.contactText}>
          Vragen? Mail naar info@mybird.app
        </Text>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.cardBackground,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  link: {
    color: Colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: Colors.danger + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  trialInfo: {
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  trialText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 4,
  },
  trialSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 16,
  },
  websiteButton: {
    marginBottom: 12,
  },
  websiteText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  contactText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  debugInfo: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  debugText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
});