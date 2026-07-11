import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFooter } from '@/components/OnboardingFooter';
import { Pill } from '@/components/Pill';
import { ProgressHeader } from '@/components/ProgressHeader';
import { saveProfile } from '@/data/profile';
import { DIETARY_OPTIONS } from '@/data/recipes';
import { useOnboarding } from '@/store/onboarding';

/**
 * Onboarding step 3 — Dietary preferences (skippable). Multi-select pills with a
 * mutually-exclusive solid-orange "None" chip that clears the others.
 */
export default function DietaryScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === '1';
  const dietary = useOnboarding((s) => s.dietary);
  const toggle = useOnboarding((s) => s.toggleDietary);

  const saveAndReturn = () => {
    const s = useOnboarding.getState();
    void saveProfile({ skill: s.skill, dietary: s.dietary, allergens: s.allergens, completed: s.completed });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-screen pb-7 pt-6">
        <ProgressHeader label="Dietary preferences" step={3} menu={!isEdit} />
        <Text className="mb-5 font-display text-22 text-primary">Any dietary preferences?</Text>

        <View className="flex-row flex-wrap gap-2">
          {DIETARY_OPTIONS.map((label) => (
            <Pill
              key={label}
              label={label}
              selected={dietary.includes(label.toLowerCase())}
              onPress={() => toggle(label.toLowerCase())}
            />
          ))}
          <Pill
            label="None"
            isNone
            selected={dietary.includes('none')}
            onPress={() => toggle('none')}
          />
        </View>

        <View className="flex-1" />

        <OnboardingFooter
          onBack={() => router.back()}
          onSkip={isEdit ? undefined : () => router.push('/allergens')}
          onContinue={isEdit ? saveAndReturn : () => router.push('/allergens')}
          continueLabel={isEdit ? 'Save' : 'Continue'}
        />
      </View>
    </SafeAreaView>
  );
}
