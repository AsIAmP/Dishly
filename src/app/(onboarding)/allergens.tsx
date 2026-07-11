import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFooter } from '@/components/OnboardingFooter';
import { Pill } from '@/components/Pill';
import { ProgressHeader } from '@/components/ProgressHeader';
import { saveProfile } from '@/data/profile';
import { ALLERGEN_OPTIONS } from '@/data/recipes';
import { useOnboarding } from '@/store/onboarding';

/**
 * Onboarding step 4 — Allergens (skippable). Same mutually-exclusive "None"
 * chip. The final CTA reads "Start cooking" (not "Continue"); Skip or Start
 * cooking both complete onboarding and go Home.
 */
export default function AllergensScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === '1';
  const allergens = useOnboarding((s) => s.allergens);
  const toggle = useOnboarding((s) => s.toggleAllergen);
  const complete = useOnboarding((s) => s.complete);

  const finish = () => {
    complete();
    // Persist the full set of onboarding answers for this user (no-op for
    // guest / unconfigured). Fire-and-forget so navigation stays instant.
    const s = useOnboarding.getState();
    void saveProfile({
      skill: s.skill,
      dietary: s.dietary,
      allergens: s.allergens,
      completed: true,
    });
    router.replace('/home');
  };

  // From Settings: save the edited allergens and return, without re-running the
  // "complete onboarding → Home" navigation.
  const saveAndReturn = () => {
    const s = useOnboarding.getState();
    void saveProfile({ skill: s.skill, dietary: s.dietary, allergens: s.allergens, completed: s.completed });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-screen pb-7 pt-6">
        <ProgressHeader label="Allergens" step={4} menu={!isEdit} />
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
          onSkip={isEdit ? undefined : finish}
          onContinue={isEdit ? saveAndReturn : finish}
          continueLabel={isEdit ? 'Save' : 'Start cooking'}
        />
      </View>
    </SafeAreaView>
  );
}
