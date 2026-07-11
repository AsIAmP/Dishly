import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { Loader } from '@/components/Loader';
import { useAuth } from '@/store/auth';
import { useOnboarding } from '@/store/onboarding';

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
  const profileLoaded = useAuth((s) => s.profileLoaded);
  const completed = useOnboarding((s) => s.completed);

  // Wait for both the session AND the persisted profile before routing, so a
  // returning user isn't briefly sent to onboarding before their prefs load.
  if (status === 'loading' || (status === 'signedIn' && !profileLoaded)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loader />
      </View>
    );
  }

  if (status === 'signedOut') return <Redirect href="/signin" />;
  return <Redirect href={completed ? '/home' : '/skill'} />;
}
