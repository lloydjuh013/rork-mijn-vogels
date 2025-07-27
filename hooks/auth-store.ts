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
      console.log('Starting registration for:', data.email);
      
      // Check if user already exists
      const existingUser = await getStoredUser();
      if (existingUser && existingUser.email === data.email) {
        throw new Error('Er bestaat al een account met dit e-mailadres');
      }
      
      // Simulate API call - in real app, this would call your backend
      const now = new Date();
      
      const user: User = {
        id: generateUserId(),
        email: data.email,
        name: data.name,
        createdAt: now,
        isActive: true,
      };

      console.log('Created user:', user);

      // Store user and token
      await storeUser(user);
      await storeAuthToken(user.id); // Using user ID as token for simplicity
      
      console.log('User stored successfully');
      
      return user;
    },
    onSuccess: (user) => {
      console.log('Registration successful, updating queries');
      queryClient.setQueryData(['user'], user);
      queryClient.setQueryData(['authToken'], user.id);
      // Force refetch to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['authToken'] });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
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



  // Computed values
  const user = userQuery.data;
  const token = tokenQuery.data;
  const isLoading = userQuery.isLoading || tokenQuery.isLoading;
  // User is authenticated ONLY if both user and token exist and match
  const isAuthenticated = !!(user && token && user.id === token);
  
  console.log('Auth Debug:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    tokensMatch: user?.id === token,
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
    logout: logoutMutation.mutate,
    
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