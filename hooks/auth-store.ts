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
    console.log('Profile not found for user:', supabaseUser.id);
    
    // Wait a moment for the trigger to potentially create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to fetch the profile again in case the trigger created it
    const { data: retryProfile, error: retryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
      
    if (retryProfile) {
      console.log('Profile found after retry:', retryProfile);
      return {
        id: retryProfile.id,
        email: retryProfile.email,
        name: retryProfile.name,
        createdAt: new Date(retryProfile.created_at),
        isActive: true,
      };
    }
    
    console.log('Profile still not found, creating manually for user:', supabaseUser.id);
    
    // If no profile exists, create one
    const newProfile = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Gebruiker',
    };

    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError.message || 'Unknown error');
      console.error('Full error object:', JSON.stringify({
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      }, null, 2));
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      
      // Check if the error is due to duplicate key (profile already exists from trigger)
      if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
        console.log('Profile already exists from trigger, fetching existing profile');
        
        // Try to fetch the existing profile created by the trigger
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
          
        if (existingProfile) {
          console.log('Found existing profile:', existingProfile);
          return {
            id: existingProfile.id,
            email: existingProfile.email,
            name: existingProfile.name,
            createdAt: new Date(existingProfile.created_at),
            isActive: true,
          };
        }
        
        if (fetchError) {
          console.error('Error fetching existing profile:', fetchError.message || 'Unknown error');
          console.error('Fetch error details:', JSON.stringify({
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
            code: fetchError.code
          }, null, 2));
          console.error('Full fetch error:', JSON.stringify(fetchError, null, 2));
        }
      }
      
      // If profile creation fails, still return user data
      // The trigger should have created the profile automatically
      return {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        createdAt: new Date(supabaseUser.created_at),
        isActive: true,
      };
    }

    console.log('Profile created successfully:', insertedProfile);
    return {
      id: insertedProfile.id,
      email: insertedProfile.email,
      name: insertedProfile.name,
      createdAt: new Date(insertedProfile.created_at),
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
        console.error('Supabase auth error:', JSON.stringify({
          message: authError.message,
          status: authError.status
        }, null, 2));
        console.error('Full auth error:', JSON.stringify(authError, null, 2));
        
        // Handle rate limiting
        if (authError.message.includes('For security purposes, you can only request this after')) {
          throw new Error('Te veel registratiepogingen. Wacht even en probeer opnieuw.');
        }
        
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          throw new Error('Er bestaat al een account met dit e-mailadres');
        }
        
        if (authError.message.includes('Password should be at least')) {
          throw new Error('Wachtwoord moet minimaal 6 karakters lang zijn');
        }
        
        if (authError.message.includes('Invalid email')) {
          throw new Error('Ongeldig e-mailadres');
        }
        
        throw new Error('Registratie mislukt: ' + authError.message);
      }

      if (!authData.user) {
        throw new Error('Registratie mislukt - geen gebruiker ontvangen');
      }

      console.log('Auth registration successful, converting user data');
      
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
        console.error('Supabase auth error:', JSON.stringify({
          message: authError.message,
          status: authError.status
        }, null, 2));
        console.error('Full auth error:', JSON.stringify(authError, null, 2));
        
        // Handle rate limiting
        if (authError.message.includes('For security purposes, you can only request this after')) {
          throw new Error('Te veel inlogpogingen. Wacht even en probeer opnieuw.');
        }
        
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

      console.log('Auth login successful, converting user data');
      
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
      
      try {
        // First, clear local data immediately
        queryClient.setQueryData(['currentUser'], null);
        
        // Then sign out from Supabase
        const { error } = await supabase.auth.signOut({
          scope: 'local' // Only sign out locally, not from all sessions
        });
        
        if (error) {
          console.error('Supabase logout error:', error);
          // Don't throw error for logout - we've already cleared local data
          console.log('Local data cleared despite Supabase error');
        } else {
          console.log('Successfully logged out from Supabase');
        }
        
        // Clear all cached data
        queryClient.clear();
        
      } catch (error) {
        console.error('Logout error:', error);
        // Still clear local data even if there's an error
        queryClient.setQueryData(['currentUser'], null);
        queryClient.clear();
      }
    },
    onSuccess: () => {
      console.log('Logout completed successfully');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Ensure data is cleared even on error
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
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