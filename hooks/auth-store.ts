import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types/bird';

const USERS_STORAGE_KEY = 'mijn_vogels_users'; // Store all users
const CURRENT_USER_EMAIL_KEY = 'mijn_vogels_current_user_email';

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

// Helper functions for email-based storage
const getAllUsers = async (): Promise<Record<string, User>> => {
  try {
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return usersData ? JSON.parse(usersData) : {};
  } catch (error) {
    console.error('Error retrieving users:', error);
    return {};
  }
};

const getCurrentUserEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CURRENT_USER_EMAIL_KEY);
  } catch (error) {
    console.error('Error retrieving current user email:', error);
    return null;
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const currentEmail = await getCurrentUserEmail();
    if (!currentEmail) return null;
    
    const allUsers = await getAllUsers();
    return allUsers[currentEmail] || null;
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return null;
  }
};

const storeUser = async (user: User): Promise<void> => {
  try {
    const allUsers = await getAllUsers();
    allUsers[user.email] = user;
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

const setCurrentUser = async (email: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

const clearCurrentUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_EMAIL_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const allUsers = await getAllUsers();
    return allUsers[email] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

const generateUserId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};





// Create the auth context hook
export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();

  // Current user query
  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });

  // Current user email query
  const currentEmailQuery = useQuery({
    queryKey: ['currentUserEmail'],
    queryFn: getCurrentUserEmail,
    staleTime: Infinity,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<User> => {
      console.log('Starting registration for:', data.email);
      
      // Normalize email to lowercase
      const normalizedEmail = data.email.trim().toLowerCase();
      console.log('Normalized email:', normalizedEmail);
      
      // Check if user already exists
      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        throw new Error('Er bestaat al een account met dit e-mailadres');
      }
      
      const now = new Date();
      const user: User = {
        id: generateUserId(),
        email: normalizedEmail, // Use normalized email
        name: data.name,
        createdAt: now,
        isActive: true,
      };

      console.log('Created user:', user);

      // Store user and set as current
      await storeUser(user);
      await setCurrentUser(user.email);
      
      console.log('User stored successfully');
      
      // Verify storage
      const allUsers = await getAllUsers();
      console.log('All users after registration:', Object.keys(allUsers));
      
      return user;
    },
    onSuccess: (user) => {
      console.log('Registration successful, updating queries');
      queryClient.setQueryData(['currentUser'], user);
      queryClient.setQueryData(['currentUserEmail'], user.email);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserEmail'] });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData): Promise<User> => {
      console.log('Starting login for:', data.email);
      
      // Normalize email to lowercase (same as registration)
      const normalizedEmail = data.email.trim().toLowerCase();
      console.log('Normalized email for login:', normalizedEmail);
      
      // Debug: Check all stored users
      const allUsers = await getAllUsers();
      console.log('All stored users:', Object.keys(allUsers));
      console.log('Total users in storage:', Object.keys(allUsers).length);
      console.log('Looking for email:', normalizedEmail);
      
      // Try to find user with exact email match
      let user = await getUserByEmail(normalizedEmail);
      console.log('Found user with exact match:', user);
      
      // If not found, try to find with case-insensitive search
      if (!user) {
        const allUserEmails = Object.keys(allUsers);
        const matchingEmail = allUserEmails.find(email => 
          email.toLowerCase() === normalizedEmail.toLowerCase()
        );
        
        if (matchingEmail) {
          user = allUsers[matchingEmail];
          console.log('Found user with case-insensitive match:', user);
        }
      }
      
      if (!user) {
        console.log('No user found with email:', normalizedEmail);
        console.log('Available emails:', Object.keys(allUsers));
        
        // Check if there are any users at all
        if (Object.keys(allUsers).length === 0) {
          throw new Error('Er zijn nog geen accounts geregistreerd op dit apparaat. Maak eerst een account aan.');
        } else {
          throw new Error('Geen account gevonden met dit e-mailadres op dit apparaat. Accounts zijn apparaat-specifiek - maak een nieuw account aan of gebruik het apparaat waar je je oorspronkelijk hebt geregistreerd.');
        }
      }
      
      // In real app, you'd validate password hash here
      await setCurrentUser(user.email);
      
      console.log('Login successful for:', user.email);
      return user;
    },
    onSuccess: (user) => {
      console.log('Login successful, updating queries');
      queryClient.setQueryData(['currentUser'], user);
      queryClient.setQueryData(['currentUserEmail'], user.email);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserEmail'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      console.log('Starting logout process...');
      await clearCurrentUser();
      console.log('Current user cleared from storage');
    },
    onSuccess: () => {
      console.log('Logout successful, clearing all data');
      // Immediately set queries to null to trigger state change
      queryClient.setQueryData(['currentUser'], null);
      queryClient.setQueryData(['currentUserEmail'], null);
      
      // Clear all cached data including bird data
      queryClient.clear();
      
      // Force immediate refetch of auth queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserEmail'] });
      
      console.log('All queries cleared and user logged out');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });



  // Computed values
  const user = userQuery.data;
  const currentEmail = currentEmailQuery.data;
  const isLoading = userQuery.isLoading || currentEmailQuery.isLoading;
  // User is authenticated if both user and current email exist and match
  const isAuthenticated = !!(user && currentEmail && user.email === currentEmail);
  
  console.log('Auth Debug:', { 
    hasUser: !!user, 
    hasCurrentEmail: !!currentEmail, 
    emailsMatch: user?.email === currentEmail,
    isAuthenticated,
    isLoading 
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
    logout: logoutMutation.mutateAsync, // Use mutateAsync to return a promise
    
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