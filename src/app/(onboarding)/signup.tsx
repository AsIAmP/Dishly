import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressHeader } from '@/components/ProgressHeader';
import { SocialAuth } from '@/components/SocialAuth';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/store/auth';
import { colors } from '@/theme/tokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign up — create a real Supabase account.
 *
 * Client-side validation (valid email, 6+ char password, matching confirm)
 * runs before the request. On success we either hand off to the index gate
 * (session created) or, when the project requires email confirmation, show a
 * "check your inbox" state and route back to Sign in.
 */
export default function SignUpScreen() {
  const router = useRouter();
  const configured = useAuth((s) => s.configured);
  const signUp = useAuth((s) => s.signUp);
  const signInWithOAuth = useAuth((s) => s.signInWithOAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const validate = (): string | null => {
    if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirm) return 'Passwords don’t match.';
    return null;
  };

  const submit = async () => {
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err, needsConfirmation } = await signUp(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (needsConfirmation) {
      setNotice('Account created! Check your email to confirm, then sign in.');
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
        <ProgressHeader label="Create account" step={1} />

        <View className="mb-2.5 flex-row items-center gap-2">
          <Text className="font-display text-26 text-primary">Join</Text>
          <Text className="font-display-semibold text-26 text-accent">Dishly</Text>
        </View>
        <Text className="mb-6 font-body text-15 text-secondary">
          Create an account to save recipes and cook along.
        </Text>

        {!configured ? (
          <View className="mb-5 rounded-md bg-accent-tint-strong px-3.5 py-3">
            <Text className="font-body text-12 text-danger">
              Supabase isn’t connected yet. Add your keys to .env (see .env.example) and restart.
            </Text>
          </View>
        ) : null}

        {notice ? (
          <View className="mb-5 rounded-md bg-accent-tint px-3.5 py-3">
            <Text className="font-body text-13 text-primary">{notice}</Text>
            <Pressable onPress={() => router.replace('/signin')} className="mt-2 active:opacity-70">
              <Text className="font-body-bold text-13 text-accent">Go to sign in →</Text>
            </Pressable>
          </View>
        ) : (
          <>
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
                placeholder="Password (min. 6 characters)"
                secureTextEntry
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError(null);
                }}
              />
              <TextField
                placeholder="Confirm password"
                secureTextEntry
                value={confirm}
                onChangeText={(t) => {
                  setConfirm(t);
                  setError(null);
                }}
                onSubmitEditing={submit}
              />
            </View>

            {error ? <Text className="mt-2 font-body text-12 text-danger">{error}</Text> : null}

            <View className="flex-1" />

            <Pressable
              onPress={submit}
              disabled={busy}
              className="items-center justify-center rounded-full bg-accent active:opacity-90"
              style={{ height: 54, opacity: busy ? 0.7 : 1 }}
            >
              {busy ? (
                <ActivityIndicator color={colors['on-accent']} />
              ) : (
                <Text className="font-body-bold text-16 text-on-accent">Create account</Text>
              )}
            </Pressable>

            <View className="mt-3.5 flex-row justify-center gap-1.5">
              <Text className="font-body text-13 text-secondary">Already have an account?</Text>
              <Link href="/signin" className="font-body-bold text-13 text-accent">
                Sign in
              </Link>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
