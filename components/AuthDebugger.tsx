import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { runSupabaseDiagnostics, checkSupabaseConfiguration, testEmailConfiguration } from '@/utils/supabase-diagnostics';
import Colors from '@/constants/colors';

export default function AuthDebugger() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [diagnosticResults, setDiagnosticResults] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnosticResults('Running diagnostics...\n');
    
    try {
      // Capture console output
      const originalLog = console.log;
      const originalError = console.error;
      let output = '';
      
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };
      
      console.error = (...args) => {
        output += 'ERROR: ' + args.join(' ') + '\n';
        originalError(...args);
      };

      // Run diagnostics
      checkSupabaseConfiguration();
      await runSupabaseDiagnostics();
      
      // Test email if user provides one
      if (user?.email) {
        await testEmailConfiguration(user.email);
      }

      // Restore console
      console.log = originalLog;
      console.error = originalError;
      
      setDiagnosticResults(output);
    } catch (error) {
      setDiagnosticResults(prev => prev + '\nDiagnostic error: ' + String(error));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>🔍 Auth Debugger</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Authentication Status:</Text>
          <Text style={[styles.statusValue, { color: isAuthenticated ? Colors.success : Colors.danger }]}>
            {isLoading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Text>
        </View>

        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>User Info:</Text>
            <Text style={styles.userText}>ID: {user.id}</Text>
            <Text style={styles.userText}>Email: {user.email}</Text>
            <Text style={styles.userText}>Name: {user.name}</Text>
            <Text style={styles.userText}>Created: {user.createdAt.toLocaleDateString()}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Text>
        </TouchableOpacity>

        {diagnosticResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Diagnostic Results:</Text>
            <ScrollView style={styles.resultsScroll}>
              <Text style={styles.resultsText}>{diagnosticResults}</Text>
            </ScrollView>
          </View>
        )}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  userLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  userText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: Colors.textLight,
  },
  buttonText: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    maxHeight: 400,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  resultsScroll: {
    maxHeight: 300,
  },
  resultsText: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});