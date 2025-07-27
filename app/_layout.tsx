import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BirdStoreProvider } from "@/hooks/bird-store";
import { AuthProvider, useAuth } from "@/hooks/auth-store";
import { initializeStripe } from "@/utils/stripe";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to registration if not authenticated after loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/register');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
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
      {isAuthenticated ? (
        // Authenticated routes
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
        </>
      ) : (
        // Authentication routes - FORCE registration first
        <>
          <Stack.Screen name="auth/register" options={{ title: "Registreren", headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: "Inloggen", headerShown: false }} />
          {/* Block all other routes when not authenticated */}
        </>
      )}
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
  const [stripeInitialized, setStripeInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // Initialize Stripe (only on mobile)
      try {
        await initializeStripe();
      } catch (error) {
        console.log('Stripe initialization skipped for web:', error);
      }
      setStripeInitialized(true);
      
      // Show splash for minimum time
      const timer = setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      }, 2500);

      return () => clearTimeout(timer);
    };

    initApp();
  }, []);

  if (showSplash || !stripeInitialized) {
    return <SplashScreenComponent />;
  }

  // Conditionally wrap with StripeProvider only on mobile
  const AppContent = () => (
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

  if (Platform.OS === 'web') {
    return <AppContent />;
  }

  // Mobile with Stripe provider
  const StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
  return (
    <StripeProvider publishableKey="pk_live_51LuGHqLXJutBmJsVXkoK4jW43u8mEpVnjkf945va8b2OOh4xtMZlBK6JD1VEuBikpQhlMxYGCVPdZYdzVnG25Ete00Ej8Ej8Ej">
      <AppContent />
    </StripeProvider>
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