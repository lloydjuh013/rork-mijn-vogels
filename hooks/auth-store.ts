import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types/bird';

const USER_STORAGE_KEY = 'mijn_vogels_user';
const AUTH_TOKEN_KEY = 'mijn_vogels_auth_token';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  daysLeftInTrial: number;
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

// Helper functions
const getStoredUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

const storeUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([USER_STORAGE_KEY, AUTH_TOKEN_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

const generateUserId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const calculateDaysLeft = (trialEndsAt: Date): number => {
  const now = new Date();
  const endDate = new Date(trialEndsAt);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const getSubscriptionStatus = (user: User): 'trial' | 'active' | 'expired' => {
  if (user.subscriptionStatus === 'active') return 'active';
  
  const now = new Date();
  const trialEnd = new Date(user.trialEndsAt);
  
  if (now < trialEnd) return 'trial';
  return 'expired';
};

// Create the auth context hook
export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();

  // User query
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: getStoredUser,
    staleTime: Infinity, // User data doesn't change often
  });

  // Auth token query
  const tokenQuery = useQuery({
    queryKey: ['authToken'],
    queryFn: getAuthToken,
    staleTime: Infinity,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<User> => {
      // Simulate API call - in real app, this would call your backend
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      const user: User = {
        id: generateUserId(),
        email: data.email,
        name: data.name,
        createdAt: now,
        trialStartedAt: now,
        trialEndsAt: trialEnd,
        subscriptionStatus: 'trial',
        isActive: true,
      };

      // Store user and token
      await storeUser(user);
      await storeAuthToken(user.id); // Using user ID as token for simplicity
      
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      queryClient.setQueryData(['authToken'], user.id);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData): Promise<User> => {
      // Simulate API call - in real app, this would validate credentials
      const storedUser = await getStoredUser();
      
      if (!storedUser || storedUser.email !== data.email) {
        throw new Error('Ongeldige inloggegevens');
      }
      
      // In real app, you'd validate password hash here
      await storeAuthToken(storedUser.id);
      
      return storedUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      queryClient.setQueryData(['authToken'], user.id);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await clearAuthData();
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.setQueryData(['authToken'], null);
      // Clear all other cached data
      queryClient.clear();
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (status: 'active' | 'expired'): Promise<User> => {
      const currentUser = userQuery.data;
      if (!currentUser) throw new Error('No user found');
      
      const updatedUser: User = {
        ...currentUser,
        subscriptionStatus: status,
      };
      
      await storeUser(updatedUser);
      return updatedUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
    },
  });

  // Computed values
  const user = userQuery.data;
  const token = tokenQuery.data;
  // User is authenticated ONLY if both user and token exist and match
  const isAuthenticated = !!(user && token && user.id === token);
  
  console.log('Auth Debug:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    tokensMatch: user?.id === token,
    isAuthenticated,
    isLoading 
  });
  const isLoading = userQuery.isLoading || tokenQuery.isLoading;
  
  const subscriptionStatus = user ? getSubscriptionStatus(user) : 'expired';
  const daysLeftInTrial = user ? calculateDaysLeft(user.trialEndsAt) : 0;
  
  // Check if user can perform premium actions
  const canPerformAction = (): boolean => {
    return subscriptionStatus === 'trial' || subscriptionStatus === 'active';
  };

  // Show upgrade prompt for expired users
  const requiresPremium = (): boolean => {
    return subscriptionStatus === 'expired';
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    subscriptionStatus,
    daysLeftInTrial,
    
    // Actions
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    
    // Helpers
    canPerformAction,
    requiresPremium,
    
    // Loading states
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Errors
    registerError: registerMutation.error?.message,
    loginError: loginMutation.error?.message,
  };
});