import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BirdStoreProvider } from "@/hooks/bird-store";
import { AuthProvider, useAuth } from "@/hooks/auth-store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [forceShowApp, setForceShowApp] = useState(false);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.log('Auth loading timeout - forcing app to show');
      setForceShowApp(true);
      if (!hasInitialized) {
        setHasInitialized(true);
        router.replace('/auth/register');
      }
    }, 15000); // 15 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [hasInitialized, router]);

  // Only redirect once after initial load
  useEffect(() => {
    if ((!isLoading || forceShowApp) && !hasInitialized) {
      setHasInitialized(true);
      
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to register');
        router.replace('/auth/register');
      } else {
        console.log('User authenticated, redirecting to tabs');
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, router, hasInitialized, forceShowApp]);

  if ((isLoading && !forceShowApp) || !hasInitialized) {
    return null; // Show nothing while checking auth
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

function SplashScreenComponent() {
  return (
    <View style={splashStyles.container}>
      <Image 
        source={{ uri: 'https://r2-pub.rork.com/attachments/a2oglfpfmwgv5i922kwvg' }}
        style={splashStyles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // Show splash for minimum time
      const timer = setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      }, 2500);

      return () => clearTimeout(timer);
    };

    initApp();
  }, []);

  if (showSplash) {
    return <SplashScreenComponent />;
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 200,
  },
});