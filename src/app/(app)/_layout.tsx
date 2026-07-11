import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/store/auth';
import { colors } from '@/theme/tokens';

/**
 * Guard for the authenticated app. A signed-out user who deep-links to /home,
 * /camera, etc. is bounced to Sign in; while the session resolves we hold on a
 * spinner so protected screens never flash.
 */
export default function AppLayout() {
  const status = useAuth((s) => s.status);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (status === 'signedOut') return <Redirect href="/signin" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
