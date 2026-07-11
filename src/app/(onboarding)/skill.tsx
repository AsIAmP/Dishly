import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFooter } from '@/components/OnboardingFooter';
import { ProgressHeader } from '@/components/ProgressHeader';
import { saveProfile } from '@/data/profile';
import { SKILL_LEVELS } from '@/data/recipes';
import { useOnboarding } from '@/store/onboarding';

/** Onboarding step 2 — Skill level (skippable). Single-select cards. Also
 *  reachable from Settings with ?edit=1, where it saves and returns instead of
 *  advancing the flow. */
export default function SkillScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === '1';
  const skill = useOnboarding((s) => s.skill);
  const setSkill = useOnboarding((s) => s.setSkill);

  const saveAndReturn = () => {
    const s = useOnboarding.getState();
    void saveProfile({ skill: s.skill, dietary: s.dietary, allergens: s.allergens, completed: s.completed });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-screen pb-7 pt-6">
        <ProgressHeader label="Skill level" step={2} menu={!isEdit} />
        <Text className="mb-5 font-display text-22 text-primary">
          How would you describe your cooking experience?
        </Text>

        <View className="gap-2.5">
          {SKILL_LEVELS.map((level) => {
            const selected = skill === level.key;
            return (
              <Pressable
                key={level.key}
                onPress={() => setSkill(level.key)}
                className={`rounded-md px-4 py-3.5 active:opacity-90 ${
                  selected ? 'border-accent bg-accent-tint' : 'border-border bg-surface'
                }`}
                style={{ borderWidth: 1.5 }}
              >
                <Text className="mb-0.5 font-body-bold text-15 text-primary">{level.title}</Text>
                <Text className="font-body text-13 text-secondary">{level.sub}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-1" />

        <OnboardingFooter
          onBack={() => router.back()}
          onSkip={isEdit ? undefined : () => router.push('/dietary')}
          onContinue={isEdit ? saveAndReturn : () => router.push('/dietary')}
          continueLabel={isEdit ? 'Save' : 'Continue'}
        />
      </View>
    </SafeAreaView>
  );
}
