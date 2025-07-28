import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { runDatabaseDiagnostics, testDatabaseOperations } from '@/utils/database-diagnostics';

export default function DatabaseDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await runDatabaseDiagnostics();
      const operationResults = await testDatabaseOperations();
      
      setResults({
        ...diagnosticResults,
        operationsWorking: operationResults
      });
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setResults({
        connection: false,
        tables: {},
        auth: false,
        profile: false,
        operationsWorking: false,
        errors: [`Diagnostics failed: ${error}`]
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Diagnostics</Text>
      
      <TouchableOpacity 
        style={[styles.button, isRunning && styles.buttonDisabled]} 
        onPress={runDiagnostics}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Diagnostics...' : 'Run Database Diagnostics'}
        </Text>
      </TouchableOpacity>

      {results && (
        <ScrollView style={styles.results}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection Status</Text>
            <Text style={styles.resultItem}>
              {getStatusIcon(results.connection)} Supabase Connection
            </Text>
            <Text style={styles.resultItem}>
              {getStatusIcon(results.auth)} Authentication
            </Text>
            <Text style={styles.resultItem}>
              {getStatusIcon(results.profile)} User Profile
            </Text>
            <Text style={styles.resultItem}>
              {getStatusIcon(results.operationsWorking)} Database Operations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Database Tables</Text>
            {Object.entries(results.tables).map(([table, exists]) => (
              <Text key={table} style={styles.resultItem}>
                {getStatusIcon(exists as boolean)} {table}
              </Text>
            ))}
          </View>

          {results.errors && results.errors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Errors</Text>
              {results.errors.map((error: string, index: number) => (
                <Text key={index} style={styles.errorItem}>
                  {index + 1}. {error}
                </Text>
              ))}
            </View>
          )}

          {results.errors.length === 0 && results.connection && (
            <View style={styles.section}>
              <Text style={styles.successText}>🎉 All diagnostics passed!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  errorItem: {
    fontSize: 14,
    marginBottom: 5,
    color: '#d32f2f',
    fontFamily: 'monospace',
  },
  successText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4caf50',
    fontWeight: 'bold',
  },
});