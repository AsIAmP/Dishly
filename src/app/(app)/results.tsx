import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeCard } from '@/components/RecipeCard';
import { AI_STEPS, generateRecipesForQuery, rankRecipes } from '@/data/ai';
import type { Recipe } from '@/data/recipes';
import { useRecipes } from '@/hooks/useRecipes';
import { selectActiveFilters, useOnboarding } from '@/store/onboarding';
import { useSearch } from '@/store/search';
import { colors } from '@/theme/tokens';

/** Drop recipes that collide with the user's allergens; keep dietary matches. */
function applyPrefs(recipes: Recipe[], dietary: string[], allergens: string[]) {
  return recipes.filter(
    (r) =>
      (dietary.length === 0 || r.dietary.some((d) => dietary.includes(d))) &&
      !r.allergens.some((a) => allergens.includes(a)),
  );
}

/** The staged progress list shown while AI results generate. */
function AiPipeline({ current }: { current: number }) {
  return (
    <View className="gap-3 px-gutter pt-6">
      <Text className="font-body-bold text-13 text-primary">Dishly AI is working…</Text>
      {AI_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} className="flex-row items-center gap-3">
            <View
              className={`items-center justify-center rounded-full ${
                done ? 'bg-accent' : active ? 'bg-accent-tint' : 'bg-surface-sunken'
              }`}
              style={{ width: 24, height: 24 }}
            >
              {done ? (
                <Text className="font-body-bold text-12 text-on-accent">✓</Text>
              ) : active ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Text className="font-body-bold text-12 text-tertiary">{i + 1}</Text>
              )}
            </View>
            <Text
              className={`font-body text-14 ${
                done || active ? 'text-primary' : 'text-tertiary'
              }`}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ResultsScreen() {
  const router = useRouter();
  const scope = useSearch((s) => s.scope);
  const activeQuery = useSearch((s) => s.activeQuery);
  const dietary = useOnboarding((s) => s.dietary);
  const allergens = useOnboarding((s) => s.allergens);
  const { data: recipes, isLoading } = useRecipes();

  const prefs = selectActiveFilters({ dietary, allergens });

  // --- "my recipes": rank the local cookbook by the query, then apply prefs ---
  const mineResults = useMemo(() => {
    if (scope !== 'mine') return [] as Recipe[];
    const ranked = rankRecipes(recipes ?? [], activeQuery);
    return applyPrefs(ranked, prefs.dietary, prefs.allergens);
  }, [scope, recipes, activeQuery, prefs.dietary, prefs.allergens]);

  // --- "find via AI": run the staged generation pipeline for the query --------
  const [aiStep, setAiStep] = useState(0);
  const [aiResults, setAiResults] = useState<Recipe[] | null>(null);

  useEffect(() => {
    if (scope !== 'ai') return;
    let alive = true;
    setAiResults(null);
    setAiStep(0);
    generateRecipesForQuery(
      activeQuery,
      (i) => alive && setAiStep(i + 1),
      { dietary: prefs.dietary, allergens: prefs.allergens },
    ).then((res) => {
      if (alive) setAiResults(applyPrefs(res, prefs.dietary, prefs.allergens));
    });
    return () => {
      alive = false;
    };
    // Re-run only when the query or scope changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, activeQuery]);

  const busy = scope === 'mine' ? isLoading : aiResults === null;
  const list = scope === 'mine' ? mineResults : (aiResults ?? []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="px-gutter pt-4">
        <Pressable
          onPress={() => router.back()}
          className="mb-1 flex-row items-center gap-2 active:opacity-70"
        >
          <Text className="font-body-semibold text-14 text-primary">←</Text>
          <Text className="font-body-medium text-14 italic text-secondary">
            &ldquo;{activeQuery}&rdquo;
          </Text>
        </Pressable>
        <Text className="mb-3 font-body text-12 text-tertiary">
          {scope === 'ai' ? 'Generated via Dishly AI' : 'From your recipes'}
        </Text>
      </View>

      {busy ? (
        scope === 'ai' ? (
          <AiPipeline current={aiStep} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.accent} />
          </View>
        )
      ) : (
        <ScrollView
          className="flex-1 px-gutter"
          contentContainerStyle={{ paddingBottom: 24, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {list.length === 0 ? (
            <View className="items-center pt-16">
              <Text className="text-center font-body text-13 text-tertiary">
                {scope === 'mine'
                  ? `No saved recipes match “${activeQuery}”. Try “find via AI” instead.`
                  : `Couldn’t generate anything for “${activeQuery}”. Try rephrasing.`}
              </Text>
              {scope === 'mine' ? (
                <Pressable
                  onPress={() => router.back()}
                  className="mt-4 rounded-full border-accent px-5 py-2.5 active:opacity-80"
                  style={{ borderWidth: 1.5 }}
                >
                  <Text className="font-body-bold text-13 text-accent">← Back to search</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            list.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() =>
                  router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
