import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { Loader } from '@/components/Loader';
import { useAuth } from '@/store/auth';

/**
 * Guard for the authenticated app. A signed-out user who deep-links to /home,
 * /camera, etc. is bounced to Sign in; while the session resolves we hold on a
 * spinner so protected screens never flash.
 */
export default function AppLayout() {
  const status = useAuth((s) => s.status);
  const profileLoaded = useAuth((s) => s.profileLoaded);

  if (status === 'loading' || (status === 'signedIn' && !profileLoaded)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loader />
      </View>
    );
  }

  if (status === 'signedOut') return <Redirect href="/signin" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
