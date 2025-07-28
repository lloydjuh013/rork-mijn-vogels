import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth for cross-platform compatibility
    storage: Platform.select({
      web: undefined, // Use default localStorage on web
      default: undefined, // Use AsyncStorage on mobile (handled by Supabase)
    }),
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