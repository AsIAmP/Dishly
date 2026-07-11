import { Text, View } from 'react-native';

/**
 * Onboarding step header: a label + "N of 4" counter over a progress bar that
 * fills 25/50/75/100%. The fill width is a runtime value, so it's an inline RN
 * style (not a Tailwind arbitrary class).
 */
export function ProgressHeader({ label, step }: { label: string; step: 1 | 2 | 3 | 4 }) {
  return (
    <View className="mb-6">
      <View className="mb-2 flex-row items-baseline justify-between">
        <Text className="font-body-semibold text-13 text-primary">{label}</Text>
        <Text className="font-body text-12 text-secondary">{step} of 4</Text>
      </View>
      <View className="h-1 overflow-hidden rounded-full bg-border">
        <View className="h-full rounded-full bg-accent" style={{ width: `${step * 25}%` }} />
      </View>
    </View>
  );
}
