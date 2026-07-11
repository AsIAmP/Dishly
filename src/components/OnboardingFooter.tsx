import { Pressable, Text, View } from 'react-native';

/**
 * Shared onboarding footer: an optional "Skip" link above a [back ←][Continue]
 * row. The final step passes continueLabel="Start cooking".
 *
 * Exact control dimensions (52px height, 1.5px border) that aren't token values
 * use inline RN styles; everything token-driven (color, radius, font) is a
 * NativeWind class. No Tailwind arbitrary (`[...]`) classes are used anywhere.
 */
export function OnboardingFooter({
  onBack,
  onContinue,
  onSkip,
  continueLabel = 'Continue',
}: {
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  continueLabel?: string;
}) {
  return (
    <View>
      {onSkip ? (
        <Pressable onPress={onSkip} className="mb-2.5 items-center py-1">
          <Text className="font-body text-13 text-tertiary underline">Skip</Text>
        </Pressable>
      ) : null}
      <View className="flex-row gap-2.5">
        {onBack ? (
          <Pressable
            onPress={onBack}
            className="items-center justify-center rounded-md border-border bg-surface active:opacity-70"
            style={{ height: 52, width: 52, borderWidth: 1.5 }}
          >
            <Text className="text-18 text-primary">←</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onContinue}
          className="flex-1 items-center justify-center rounded-full bg-accent active:opacity-90"
          style={{ height: 52 }}
        >
          <Text className="font-body-bold text-16 text-on-accent">{continueLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
