/**
 * Supabase client — the real auth backend for Dishly.
 *
 * Keys come from environment variables so no secrets live in the repo. Expo
 * inlines any `EXPO_PUBLIC_*` variable referenced with dot notation at build
 * time (see .env.example for the two you need). They are the public anon key +
 * project URL — safe to ship in a client bundle.
 *
 * If the vars are missing the app still boots: `isSupabaseConfigured` is false
 * and the auth screens show a setup notice instead of throwing. That keeps the
 * rest of the app reviewable before keys are wired.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Must be static `process.env.EXPO_PUBLIC_*` dot access to be inlined by Expo.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = url.length > 0 && anonKey.length > 0;

/**
 * A single shared client. On native we persist the session in AsyncStorage; on
 * web the default (localStorage) is used and `detectSessionInUrl` lets the
 * OAuth redirect hand its tokens back to the client.
 */
export const supabase = createClient(
  // Fall back to harmless placeholders when unconfigured so createClient never
  // throws; every call is still gated behind `isSupabaseConfigured` in the UI.
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? anonKey : 'public-anon-placeholder',
  {
    auth: {
      ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
      autoRefreshToken: true,
      persistSession: true,
      // Only true in a real browser — during the static-export prerender
      // (Node) there's no `window`, so URL detection must be off.
      detectSessionInUrl: Platform.OS === 'web' && typeof window !== 'undefined',
    },
  },
);
