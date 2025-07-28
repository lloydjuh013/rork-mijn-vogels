import React from 'react';
import { Stack } from 'expo-router';
import DatabaseDiagnostics from '@/components/DatabaseDiagnostics';

export default function DiagnosticsPage() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Database Diagnostics',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <DatabaseDiagnostics />
    </>
  );
}