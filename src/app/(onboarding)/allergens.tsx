import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFooter } from '@/components/OnboardingFooter';
import { Pill } from '@/components/Pill';
import { ProgressHeader } from '@/components/ProgressHeader';
import { ALLERGEN_OPTIONS } from '@/data/recipes';
import { useOnboarding } from '@/store/onboarding';

/**
 * Onboarding step 4 — Allergens (skippable). Same mutually-exclusive "None"
 * chip. The final CTA reads "Start cooking" (not "Continue"); Skip or Start
 * cooking both complete onboarding and go Home.
 */
export default function AllergensScreen() {
  const router = useRouter();
  const allergens = useOnboarding((s) => s.allergens);
  const toggle = useOnboarding((s) => s.toggleAllergen);
  const complete = useOnboarding((s) => s.complete);

  const finish = () => {
    complete();
    router.replace('/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-screen pb-7 pt-6">
        <ProgressHeader label="Allergens" step={4} />
        <Text className="mb-5 font-display text-22 text-primary">
          Any allergens we should flag?
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((label) => (
            <Pill
              key={label}
              label={label}
              selected={allergens.includes(label.toLowerCase())}
              onPress={() => toggle(label.toLowerCase())}
            />
          ))}
          <Pill
            label="None"
            isNone
            selected={allergens.includes('none')}
            onPress={() => toggle('none')}
          />
        </View>

        <View className="flex-1" />

        <OnboardingFooter
          onBack={() => router.back()}
          onSkip={finish}
          onContinue={finish}
          continueLabel="Start cooking"
        />
      </View>
    </SafeAreaView>
  );
}
