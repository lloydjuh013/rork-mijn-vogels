import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing'
  });
  throw new Error('Missing Supabase environment variables. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      birds: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          species: string;
          gender: 'male' | 'female';
          birth_date: string | null;
          ring_number: string | null;
          color: string | null;
          notes: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          species: string;
          gender: 'male' | 'female';
          birth_date?: string | null;
          ring_number?: string | null;
          color?: string | null;
          notes?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          species?: string;
          gender?: 'male' | 'female';
          birth_date?: string | null;
          ring_number?: string | null;
          color?: string | null;
          notes?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      couples: {
        Row: {
          id: string;
          user_id: string;
          male_bird_id: string;
          female_bird_id: string;
          pair_date: string;
          status: 'active' | 'inactive' | 'separated';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          male_bird_id: string;
          female_bird_id: string;
          pair_date: string;
          status?: 'active' | 'inactive' | 'separated';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          male_bird_id?: string;
          female_bird_id?: string;
          pair_date?: string;
          status?: 'active' | 'inactive' | 'separated';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      aviaries: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          capacity: number;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          capacity: number;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          capacity?: number;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      nests: {
        Row: {
          id: string;
          user_id: string;
          couple_id: string;
          aviary_id: string | null;
          start_date: string;
          expected_hatch_date: string | null;
          actual_hatch_date: string | null;
          egg_count: number;
          hatched_count: number;
          status: 'preparing' | 'laying' | 'incubating' | 'hatching' | 'completed' | 'abandoned';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          couple_id: string;
          aviary_id?: string | null;
          start_date: string;
          expected_hatch_date?: string | null;
          actual_hatch_date?: string | null;
          egg_count: number;
          hatched_count?: number;
          status?: 'preparing' | 'laying' | 'incubating' | 'hatching' | 'completed' | 'abandoned';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          couple_id?: string;
          aviary_id?: string | null;
          start_date?: string;
          expected_hatch_date?: string | null;
          actual_hatch_date?: string | null;
          egg_count?: number;
          hatched_count?: number;
          status?: 'preparing' | 'laying' | 'incubating' | 'hatching' | 'completed' | 'abandoned';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};