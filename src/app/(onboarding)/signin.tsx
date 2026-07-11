import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressHeader } from '@/components/ProgressHeader';
import { SocialAuth } from '@/components/SocialAuth';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/store/auth';
import { colors } from '@/theme/tokens';

/**
 * Onboarding step 1 — Sign in (real Supabase auth).
 *
 *  - Apple / Google run OAuth (full-page redirect on web).
 *  - Email + password calls signInWithPassword; on success the session flips
 *    and we hand off to the index gate, which routes to onboarding or Home.
 *  - New users switch to the Sign up screen via the footer link.
 */
export default function SignInScreen() {
  const router = useRouter();
  const configured = useAuth((s) => s.configured);
  const signIn = useAuth((s) => s.signIn);
  const signInWithOAuth = useAuth((s) => s.signInWithOAuth);
  const continueAsGuest = useAuth((s) => s.continueAsGuest);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canContinue = email.length > 0 && password.length > 0 && !busy;

  const submit = async () => {
    if (!canContinue) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace('/');
  };

  const oauth = async (provider: 'apple' | 'google') => {
    setBusy(true);
    setError(null);
    const err = await signInWithOAuth(provider);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-screen pb-7 pt-6">
        <ProgressHeader label="Sign in" step={1} />

        <View className="mb-2.5 flex-row items-center gap-2">
          <Text className="font-display text-26 text-primary">Welcome to</Text>
          <Text className="font-display-semibold text-26 text-accent">Dishly</Text>
        </View>
        <Text className="mb-6 font-body text-15 text-secondary">
          Sign in to save recipes and start cooking.
        </Text>

        {!configured ? (
          <View className="mb-5 rounded-md bg-accent-tint-strong px-3.5 py-3">
            <Text className="mb-2 font-body text-12 text-danger">
              Supabase isn’t connected yet. Add your keys to .env (see .env.example) and restart.
            </Text>
            <Pressable
              onPress={() => {
                continueAsGuest();
                router.replace('/');
              }}
              className="active:opacity-70"
            >
              <Text className="font-body-bold text-12 text-accent">
                Continue without signing in (dev) →
              </Text>
            </Pressable>
          </View>
        ) : null}

        <SocialAuth onProvider={oauth} disabled={busy} />

        <View className="gap-2.5">
          <TextField
            placeholder="Email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
          />
          <TextField
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError(null);
            }}
            onSubmitEditing={submit}
          />
        </View>

        {error ? <Text className="mt-2 font-body text-12 text-danger">{error}</Text> : null}

        <View className="flex-1" />

        <Pressable
          onPress={submit}
          disabled={!canContinue}
          className={`items-center justify-center rounded-full ${
            canContinue ? 'bg-accent' : 'bg-accent-muted'
          } active:opacity-90`}
          style={{ height: 54 }}
        >
          {busy ? (
            <ActivityIndicator color={colors['on-accent']} />
          ) : (
            <Text className="font-body-bold text-16 text-on-accent">Sign in</Text>
          )}
        </Pressable>

        <View className="mt-3.5 flex-row justify-center gap-1.5">
          <Text className="font-body text-13 text-secondary">New to Dishly?</Text>
          <Link href="/signup" className="font-body-bold text-13 text-accent">
            Create an account
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
