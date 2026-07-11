import type { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { fetchProfile } from '@/data/profile';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useOnboarding } from '@/store/onboarding';

/**
 * Auth state, backed by real Supabase sessions.
 *
 *  - `status` gates routing: 'loading' while we resolve the persisted session,
 *    then 'signedIn' / 'signedOut'.
 *  - The mutators wrap supabase.auth and return a friendly error string (or
 *    null on success) so screens can render inline validation without touching
 *    the SDK error shapes.
 *
 * `initAuth()` is called once from the root layout: it hydrates the session and
 * subscribes to future changes (token refresh, OAuth redirect, sign-out).
 */
type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  configured: boolean;
  /** False until the signed-in user's persisted profile has been loaded, so
   *  routing doesn't flash the wrong screen before prefs arrive. */
  profileLoaded: boolean;

  initAuth: () => () => void;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithOAuth: (provider: 'apple' | 'google') => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Update the display name (stored in the auth user's metadata). */
  updateName: (name: string) => Promise<string | null>;
  /** Dev-only bypass, offered when Supabase keys aren't set, so the rest of the
   *  app stays reachable for review. No-op once real auth is configured. */
  continueAsGuest: () => void;
};

const NOT_CONFIGURED =
  'Auth isn’t connected yet. Add your Supabase keys to .env (see .env.example) and restart the app.';

function friendlyError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Wrong email or password.';
  if (/already registered/i.test(message)) return 'That email already has an account — sign in instead.';
  if (/password should be at least/i.test(message)) return 'Password must be at least 6 characters.';
  if (/provider is not enabled|unsupported provider/i.test(message))
    return 'This sign-in method isn’t enabled yet. Use email/password, or enable the provider in Supabase.';
  if (/email.*not confirmed/i.test(message)) return 'Confirm your email first — check your inbox.';
  return message;
}

/** Load the user's saved prefs into the onboarding store, then flag ready. */
async function hydrateProfile(set: (partial: Partial<AuthState>) => void) {
  set({ profileLoaded: false });
  const profile = await fetchProfile();
  if (profile) useOnboarding.getState().hydrate(profile);
  set({ profileLoaded: true });
}

export const useAuth = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  configured: isSupabaseConfigured,
  profileLoaded: false,

  initAuth: () => {
    if (!isSupabaseConfigured) {
      set({ status: 'signedOut', configured: false, profileLoaded: true });
      return () => {};
    }
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, status: data.session ? 'signedIn' : 'signedOut' });
      if (data.session) hydrateProfile(set);
      else set({ profileLoaded: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, status: session ? 'signedIn' : 'signedOut' });
      if (session) {
        hydrateProfile(set);
      } else {
        useOnboarding.getState().reset();
        set({ profileLoaded: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  },

  signUp: async (email, password) => {
    if (!get().configured) return { error: NOT_CONFIGURED, needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { error: friendlyError(error.message), needsConfirmation: false };
    // Supabase returns a user with an empty identities array when the email is
    // already registered (and confirmation is on) — treat that as a conflict.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: 'That email already has an account — sign in instead.', needsConfirmation: false };
    }
    // No session means the project requires email confirmation before login.
    return { error: null, needsConfirmation: !data.session };
  },

  signIn: async (email, password) => {
    if (!get().configured) return NOT_CONFIGURED;
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? friendlyError(error.message) : null;
  },

  signInWithOAuth: async (provider) => {
    if (!get().configured) return NOT_CONFIGURED;
    // On web Supabase performs a full-page redirect; detectSessionInUrl then
    // completes sign-in when the browser returns.
    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'dishly://';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
    });
    if (error) return friendlyError(error.message);
    // Native: open the returned URL in an in-app browser session.
    if (Platform.OS !== 'web' && data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
    return null;
  },

  signOut: async () => {
    if (get().configured) await supabase.auth.signOut();
    useOnboarding.getState().reset();
    set({ session: null, status: 'signedOut', profileLoaded: true });
  },

  updateName: async (name) => {
    if (!get().configured) return null;
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    if (error) return friendlyError(error.message);
    if (data.user) set({ session: { ...get().session, user: data.user } as Session });
    return null;
  },

  continueAsGuest: () => {
    if (!get().configured) set({ status: 'signedIn', profileLoaded: true });
  },
}));
