import { Pressable, Text, View } from 'react-native';

import { AppleIcon, GoogleIcon } from '@/components/icons';

/**
 * Apple / Google buttons + the "or" divider, shared by Sign in and Sign up.
 * `onProvider` runs the real Supabase OAuth call; `disabled` greys them out
 * while a request is in flight.
 */
export function SocialAuth({
  onProvider,
  disabled,
}: {
  onProvider: (provider: 'apple' | 'google') => void;
  disabled?: boolean;
}) {
  return (
    <View>
      <Pressable
        onPress={() => onProvider('apple')}
        disabled={disabled}
        className="mb-2.5 flex-row items-center justify-center gap-2 rounded-md bg-primary active:opacity-90"
        style={{ height: 52, opacity: disabled ? 0.6 : 1 }}
      >
        <AppleIcon size={17} />
        <Text className="font-body-semibold text-15 text-on-accent">Continue with Apple</Text>
      </Pressable>
      <Pressable
        onPress={() => onProvider('google')}
        disabled={disabled}
        className="mb-5 flex-row items-center justify-center gap-2.5 rounded-md border-border bg-surface active:opacity-80"
        style={{ height: 52, borderWidth: 1.5, opacity: disabled ? 0.6 : 1 }}
      >
        <GoogleIcon size={17} />
        <Text className="font-body-semibold text-15 text-primary">Continue with Google</Text>
      </Pressable>

      <View className="mb-5 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text className="font-body text-11 uppercase tracking-wider text-tertiary">or</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
    </View>
  );
}
