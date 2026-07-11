import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';

import { useAuth } from '@/store/auth';
import { useOnboarding } from '@/store/onboarding';
import { colors } from '@/theme/tokens';

/**
 * Entry gate. Order of checks:
 *   1. auth still resolving       -> splash spinner
 *   2. no session                 -> Sign in
 *   3. session but prefs unset    -> onboarding (skill level)
 *   4. session + onboarding done  -> Home
 *
 * Auth is the real Supabase session; onboarding.completed is the local
 * preferences flag captured after sign-in.
 */
export default function Index() {
  const status = useAuth((s) => s.status);
  const completed = useOnboarding((s) => s.completed);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (status === 'signedOut') return <Redirect href="/signin" />;
  return <Redirect href={completed ? '/home' : '/skill'} />;
}
