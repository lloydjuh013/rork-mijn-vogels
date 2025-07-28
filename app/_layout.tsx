import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BirdStoreProvider } from "@/hooks/bird-store";
import { AuthProvider, useAuth } from "@/hooks/auth-store";
import Colors from "@/constants/colors";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Handle navigation after auth state is determined
  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      console.log('Auth loading complete, navigating...', { isAuthenticated });
      setHasInitialized(true);
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        if (isAuthenticated) {
          console.log('User authenticated, redirecting to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('User not authenticated, redirecting to register');
          router.replace('/auth/register');
        }
      }, 100);
    }
  }, [isLoading, isAuthenticated, router, hasInitialized]);

  // Show loading screen while auth is being determined
  if (isLoading || !hasInitialized) {
    return (
      <View style={loadingStyles.container}>
        <Image 
          source={{ uri: 'https://r2-pub.rork.com/attachments/a2oglfpfmwgv5i922kwvg' }}
          style={loadingStyles.logo}
          resizeMode="contain"
        />
        <Text style={loadingStyles.loadingText}>MyBird wordt geladen...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Terug",
      headerStyle: {
        backgroundColor: "#4A8F66", // Primary color
      },
      headerTintColor: "#FFFFFF", // White text
      headerTitleStyle: {
        fontWeight: "600",
      },
    }}>
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen name="birds/[id]" options={{ title: "Vogeldetails" }} />
      <Stack.Screen name="birds/add" options={{ title: "Vogel Toevoegen" }} />
      <Stack.Screen name="birds/edit/[id]" options={{ title: "Vogel Bewerken" }} />
      <Stack.Screen name="couples/[id]" options={{ title: "Koppeldetails" }} />
      <Stack.Screen name="couples/add" options={{ title: "Koppel Toevoegen" }} />
      <Stack.Screen name="nests/index" options={{ title: "Actieve Nesten" }} />
      <Stack.Screen name="nests/[id]" options={{ title: "Nestdetails" }} />
      <Stack.Screen name="nests/add" options={{ title: "Nest Toevoegen" }} />
      <Stack.Screen name="aviaries/[id]" options={{ title: "Kooi Details" }} />
      <Stack.Screen name="aviaries/add" options={{ title: "Kooi Toevoegen" }} />
      <Stack.Screen name="auth/register" options={{ title: "Registreren", headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: "Inloggen", headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Show splash for minimum time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('App initialization complete');
        setAppReady(true);
        
        // Hide the native splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error during app initialization:', error);
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  // Show custom splash screen while app is initializing
  if (!appReady) {
    return (
      <View style={splashStyles.container}>
        <Image 
          source={{ uri: 'https://r2-pub.rork.com/attachments/a2oglfpfmwgv5i922kwvg' }}
          style={splashStyles.logo}
          resizeMode="contain"
        />
        <Text style={splashStyles.appName}>MyBird</Text>
        <Text style={splashStyles.tagline}>Vogelkweek Beheer</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BirdStoreProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </BirdStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 150,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 100,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});