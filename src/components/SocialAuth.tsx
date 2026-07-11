import { Pressable, Text, View } from 'react-native';

import { AppleIcon, GoogleIcon } from '@/components/icons';
import { colors } from '@/theme/tokens';

/**
 * Apple / Google buttons + the "or" divider, shared by Sign in and Sign up.
 *
 * These providers aren't enabled in Supabase yet, so the buttons render greyed
 * out and non-interactive. Flip `SOCIAL_ENABLED` to true once Apple/Google are
 * configured (Authentication → Providers) and they become live again.
 */
const SOCIAL_ENABLED = false;

export function SocialAuth({
  onProvider,
  disabled,
}: {
  onProvider: (provider: 'apple' | 'google') => void;
  disabled?: boolean;
}) {
  const divider = (
    <View className="mb-5 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-border" />
      <Text className="font-body text-11 uppercase tracking-wider text-tertiary">or</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );

  // --- Disabled state (providers not configured) -----------------------------
  if (!SOCIAL_ENABLED) {
    return (
      <View>
        <View
          className="mb-2.5 flex-row items-center justify-center gap-2 rounded-md border-border bg-surface-muted"
          style={{ height: 52, borderWidth: 1.5, opacity: 0.6 }}
        >
          <AppleIcon size={17} color={colors.tertiary} />
          <Text className="font-body-semibold text-15 text-tertiary">Continue with Apple</Text>
        </View>
        <View
          className="mb-2 flex-row items-center justify-center gap-2.5 rounded-md border-border bg-surface-muted"
          style={{ height: 52, borderWidth: 1.5, opacity: 0.6 }}
        >
          <GoogleIcon size={17} />
          <Text className="font-body-semibold text-15 text-tertiary">Continue with Google</Text>
        </View>
        <Text className="mb-5 text-center font-body text-11 text-tertiary">
          Apple & Google sign-in coming soon — use email below
        </Text>
        {divider}
      </View>
    );
  }

  // --- Enabled state ---------------------------------------------------------
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

      {divider}
    </View>
  );
}
