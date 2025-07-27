import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Redirect to main app when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('User is now authenticated, redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const handleLogin = () => {
    // Validation
    if (!formData.email.trim()) {
      Alert.alert('Fout', 'Vul je e-mailadres in');
      return;
    }
    
    if (!formData.password) {
      Alert.alert('Fout', 'Vul je wachtwoord in');
      return;
    }

    login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });
  };

  const openWebsite = () => {
    Linking.openURL('https://mybird.app');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Wachtwoord Vergeten',
      'Stuur een e-mail naar info@mybird.app met je e-mailadres om je wachtwoord te resetten.',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'E-mail Sturen', 
          onPress: () => Linking.openURL('mailto:info@mybird.app?subject=Wachtwoord Reset') 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Welkom Terug</Text>
        <Text style={styles.subtitle}>
          Log in op je MyBird account
        </Text>
      </View>

      <View style={styles.form}>
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
              placeholder="Je wachtwoord"
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

        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Wachtwoord vergeten?</Text>
        </TouchableOpacity>

        {loginError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{loginError}</Text>
            {loginError.includes('geen accounts geregistreerd') && (
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => router.push('/auth/register')}
              >
                <Text style={styles.registerButtonText}>Maak nu een account aan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Button
          title="Inloggen"
          onPress={handleLogin}
          type="primary"
          disabled={isLoggingIn}
          testID="login-button"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Nog geen account?{' '}
          <Text style={styles.link} onPress={() => router.push('/auth/register')}>
            Registreren
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
    justifyContent: 'center',
    minHeight: '100%',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
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
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 16,
  },
  link: {
    color: Colors.primary,
    fontWeight: '600',
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
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    alignSelf: 'center',
  },
  registerButtonText: {
    color: Colors.cardBackground,
    fontSize: 14,
    fontWeight: '600',
  },
});