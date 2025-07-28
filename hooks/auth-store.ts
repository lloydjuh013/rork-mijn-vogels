import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types/bird';
import { supabase } from '@/utils/supabase';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { useEffect } from 'react';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
};

// Helper function to convert Supabase user to our User type
const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
  // Get user profile from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (error || !profile) {
    // If no profile exists, create one
    const newProfile = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Gebruiker',
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile);

    if (insertError) {
      console.error('Error creating profile:', insertError);
    }

    return {
      id: newProfile.id,
      email: newProfile.email,
      name: newProfile.name,
      createdAt: new Date(supabaseUser.created_at),
      isActive: true,
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    createdAt: new Date(profile.created_at),
    isActive: true,
  };
};

// Get current authenticated user
const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    
    if (error || !supabaseUser) {
      console.log('No authenticated user found');
      return null;
    }

    return await convertSupabaseUser(supabaseUser);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};





// Create the auth context hook
export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();

  // Current user query
  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          // Clear all data when signed out
          queryClient.setQueryData(['currentUser'], null);
          queryClient.clear();
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Update user data when signed in
          const user = await convertSupabaseUser(session.user);
          queryClient.setQueryData(['currentUser'], user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<User> => {
      console.log('Starting registration for:', data.email);
      
      const normalizedEmail = data.email.trim().toLowerCase();
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        if (authError.message.includes('already registered')) {
          throw new Error('Er bestaat al een account met dit e-mailadres');
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Registratie mislukt - geen gebruiker ontvangen');
      }

      // Convert to our User type
      const user = await convertSupabaseUser(authData.user);
      console.log('Registration successful:', user);
      
      return user;
    },
    onSuccess: (user) => {
      console.log('Registration successful, updating queries');
      queryClient.setQueryData(['currentUser'], user);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData): Promise<User> => {
      console.log('Starting login for:', data.email);
      
      const normalizedEmail = data.email.trim().toLowerCase();
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: data.password,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Onjuiste inloggegevens');
        }
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('E-mail nog niet bevestigd. Controleer je inbox.');
        }
        if (authError.message.includes('User not found')) {
          throw new Error('Geen account gevonden met dit e-mailadres');
        }
        if (authError.message.includes('Invalid email')) {
          throw new Error('Ongeldig e-mailadres');
        }
        if (authError.message.includes('Password should be at least')) {
          throw new Error('Wachtwoord moet minimaal 6 karakters lang zijn');
        }
        throw new Error('Inloggen mislukt: ' + authError.message);
      }

      if (!authData.user) {
        throw new Error('Inloggen mislukt - geen gebruiker ontvangen');
      }

      // Convert to our User type
      const user = await convertSupabaseUser(authData.user);
      console.log('Login successful for:', user.email);
      
      return user;
    },
    onSuccess: (user) => {
      console.log('Login successful, updating queries');
      queryClient.setQueryData(['currentUser'], user);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      console.log('Starting logout process...');
      
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only sign out locally, not from all sessions
      });
      
      if (error) {
        console.error('Supabase logout error:', error);
        throw new Error('Uitloggen mislukt: ' + error.message);
      }
      
      console.log('Successfully logged out from Supabase');
    },
    onSuccess: () => {
      console.log('Logout successful, clearing all data');
      // The auth state change listener will handle clearing data
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });



  // Computed values
  const user = userQuery.data;
  const isLoading = userQuery.isLoading;
  const isAuthenticated = !!user;
  
  console.log('Auth Debug:', { 
    hasUser: !!user, 
    isAuthenticated,
    isLoading,
    userEmail: user?.email
  });
  
  // All users can perform all actions in free version
  const canPerformAction = (): boolean => {
    return true;
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutateAsync,
    
    // Helpers
    canPerformAction,
    
    // Loading states
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Errors
    registerError: registerMutation.error?.message,
    loginError: loginMutation.error?.message,
  };
});