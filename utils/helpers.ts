import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format date to local string
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

// Calculate age from birth date
export const calculateAge = (birthDate: Date): string => {
  const now = new Date();
  const birth = new Date(birthDate);
  
  let years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  
  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
  }
  
  return years === 1 ? '1 year' : `${years} years`;
};

// Export data to JSON
export const exportData = async (): Promise<string> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    
    const data = result.reduce((obj, [key, value]) => {
      obj[key] = value ? JSON.parse(value) : null;
      return obj;
    }, {} as Record<string, any>);
    
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

// Import data from JSON
export const importData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await AsyncStorage.clear();
    
    // Import new data
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data');
  }
};

// Check if platform is web
export const isWeb = Platform.OS === 'web';