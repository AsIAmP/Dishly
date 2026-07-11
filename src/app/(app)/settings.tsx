import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMenu } from '@/components/AppMenu';
import { TextField } from '@/components/TextField';
import { SKILL_LEVELS } from '@/data/recipes';
import { useAuth } from '@/store/auth';
import { useOnboarding } from '@/store/onboarding';
import { useRecipeView } from '@/store/recipeView';

/** One tappable "label / value ›" row that reopens an onboarding picker. */
function EditRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-md border-border bg-surface px-4 py-3 active:opacity-80"
      style={{ borderWidth: 1.5 }}
    >
      <Text className="mb-0.5 font-body text-12 text-secondary">{label}</Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-body-semibold text-15 text-primary">{value}</Text>
        <Text className="font-body text-16 text-tertiary">›</Text>
      </View>
    </Pressable>
  );
}

/** A read-only "label / value" info row. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-md border-border bg-surface px-4 py-3" style={{ borderWidth: 1.5 }}>
      <Text className="mb-0.5 font-body text-12 text-secondary">{label}</Text>
      <Text className="font-body-semibold text-15 text-primary">{value}</Text>
    </View>
  );
}

function summarize(keys: string[]): string {
  if (keys.length === 0) return 'None';
  return keys
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
    .join(', ');
}

/**
 * Personal Settings (screen 5). Name is editable (saved to the auth user);
 * Email is read-only. Skill / Dietary / Allergens reopen the exact pickers used
 * during onboarding (in edit mode). Units drives the recipe g/oz display.
 * Logout is repeated here as a safety net.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const session = useAuth((s) => s.session);
  const updateName = useAuth((s) => s.updateName);
  const signOut = useAuth((s) => s.signOut);

  const skill = useOnboarding((s) => s.skill);
  const dietary = useOnboarding((s) => s.dietary);
  const allergens = useOnboarding((s) => s.allergens);

  const unit = useRecipeView((s) => s.unit);
  const setUnit = useRecipeView((s) => s.setUnit);

  const email = session?.user?.email ?? 'Guest';
  const initialName =
    (session?.user?.user_metadata?.full_name as string | undefined) ??
    (email.includes('@') ? email.split('@')[0] : '');
  const [name, setName] = useState(initialName);

  const skillLabel = SKILL_LEVELS.find((l) => l.key === skill)?.title ?? 'Not set';

  const unitTab = (active: boolean) => `rounded-full px-4 py-1.5 ${active ? 'bg-accent' : ''}`;
  const unitTabText = (active: boolean) =>
    `font-body-bold text-13 ${active ? 'text-on-accent' : 'text-secondary'}`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-gutter pb-6 pt-3">
        <View className="mb-5 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <Text className="font-body-semibold text-14 text-primary">← Back</Text>
          </Pressable>
          <AppMenu />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="mb-1 font-body text-12 text-secondary">Name</Text>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              onBlur={() => name.trim() && name.trim() !== initialName && void updateName(name)}
            />
          </View>

          <InfoRow label="Email" value={email} />

          <EditRow
            label="Skill level"
            value={skillLabel}
            onPress={() => router.push({ pathname: '/skill', params: { edit: '1' } })}
          />
          <EditRow
            label="Dietary preferences"
            value={summarize(dietary)}
            onPress={() => router.push({ pathname: '/dietary', params: { edit: '1' } })}
          />
          <EditRow
            label="Allergens"
            value={summarize(allergens)}
            onPress={() => router.push({ pathname: '/allergens', params: { edit: '1' } })}
          />

          <View className="rounded-md border-border bg-surface px-4 py-3" style={{ borderWidth: 1.5 }}>
            <Text className="mb-2 font-body text-12 text-secondary">Units</Text>
            <View className="flex-row self-start rounded-full bg-surface-sunken" style={{ padding: 2 }}>
              <Pressable className={unitTab(unit === 'g')} onPress={() => setUnit('g')}>
                <Text className={unitTabText(unit === 'g')}>g</Text>
              </Pressable>
              <Pressable className={unitTab(unit === 'oz')} onPress={() => setUnit('oz')}>
                <Text className={unitTabText(unit === 'oz')}>oz</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <Pressable
          onPress={() => {
            signOut();
            router.replace('/signin');
          }}
          className="mt-3 items-center justify-center rounded-full border-danger active:opacity-80"
          style={{ height: 50, borderWidth: 1.5 }}
        >
          <Text className="font-body-bold text-14 text-danger">⟲ Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
