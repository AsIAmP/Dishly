import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppSplash } from '@/components/AppSplash';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/store/auth';
import { colors } from '@/theme/tokens';
import '@/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fonts must be LOADED (not just named). Family names here match the strings
  // in tokens.ts fontFamily, which back the font-display / font-body classes.
  const [loaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Hydrate the Supabase session once and keep it in sync (token refresh,
  // OAuth redirect, sign-out) for the lifetime of the app.
  const initAuth = useAuth((s) => s.initAuth);
  useEffect(() => initAuth(), [initAuth]);

  // Show the branded splash for a few seconds on cold start.
  const [splashDone, setSplashDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* Router mounts immediately (so deep links resolve); the splash is an
              overlay on top for the first couple of seconds. */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          {!splashDone ? (
            <View style={StyleSheet.absoluteFill}>
              <AppSplash />
            </View>
          ) : null}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
