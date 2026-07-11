import { Text, View } from 'react-native';

/**
 * Dishly wordmark — the brand name in the display serif (green) with a small
 * circular "AI" badge, echoing the logo. Vector/text based, so it scales
 * crisply and themes with the accent color. `size` is the wordmark font size.
 */
export function Logo({ size = 34 }: { size?: number }) {
  const badge = Math.round(size * 0.44);
  return (
    <View className="flex-row items-start">
      <Text
        className="font-display-semibold text-accent"
        style={{ fontSize: size, lineHeight: size * 1.12 }}
      >
        Dishly
      </Text>
      <View
        className="items-center justify-center rounded-full bg-accent"
        style={{ width: badge, height: badge, marginLeft: size * 0.12, marginTop: size * 0.06 }}
      >
        <Text className="font-body-bold text-on-accent" style={{ fontSize: badge * 0.48 }}>
          AI
        </Text>
      </View>
    </View>
  );
}
