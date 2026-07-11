import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMenu } from '@/components/AppMenu';
import { Loader } from '@/components/Loader';
import { RecipeCard } from '@/components/RecipeCard';
import { AI_STEPS, generatedById, rankRecipes } from '@/data/ai';
import type { Favorite } from '@/data/api';
import { ALL_RECIPES_BY_ID, RECIPES, type Recipe } from '@/data/recipes';
import { useFavorites } from '@/hooks/useFavorites';
import { useAiRecipes } from '@/hooks/useRecipes';
import { selectActiveFilters, useOnboarding } from '@/store/onboarding';
import { useSearch } from '@/store/search';
import { colors } from '@/theme/tokens';

/** Resolve a saved favorite to a full Recipe (from the catalog or the runtime
 *  cache), or a minimal card when its data can't be restored. */
function favoriteToRecipe(fav: Favorite): Recipe | null {
  const id = fav.kind === 'recipe' ? fav.recipeId : fav.recipeId;
  if (!id) return null;
  const full = ALL_RECIPES_BY_ID[id] ?? generatedById[id];
  if (full) return full;
  if (fav.kind !== 'recipe') return null;
  return {
    id,
    title: fav.title,
    author: '',
    image: fav.image,
    rating: null,
    prep: 0,
    cook: 0,
    difficulty: fav.difficulty ?? 'Easy',
    dietary: [],
    allergens: [],
    calories: '',
    ingredients: [],
    steps: [],
  };
}

/**
 * Safety net for AI results: the model was already told to honor dietary +
 * allergen prefs, so we don't re-filter on dietary (that over-drops, e.g. a
 * vegan dish for a "vegetarian" user). We only drop a recipe if it *declares*
 * it contains an allergen the user avoids.
 */
function dropAllergenConflicts(recipes: Recipe[], allergens: string[]) {
  return recipes.filter((r) => !r.allergens.some((a) => allergens.includes(a)));
}

/** The staged progress list shown while AI results generate. Self-animates
 *  through the stages; the last stage stays "active" until results replace it. */
function AiPipeline() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setCurrent(1), 500);
    const t2 = setTimeout(() => setCurrent(2), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
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
  const { data: favorites, isLoading } = useFavorites();

  const prefs = selectActiveFilters({ dietary, allergens });

  // "My recipes" = the user's saved favorites (resolved to full recipes) plus
  // the built-in catalog, de-duplicated.
  const myRecipes = useMemo(() => {
    const out: Recipe[] = [];
    const seen = new Set<string>();
    for (const fav of favorites ?? []) {
      const recipe = favoriteToRecipe(fav);
      if (recipe && !seen.has(recipe.id)) {
        seen.add(recipe.id);
        out.push(recipe);
      }
    }
    for (const recipe of RECIPES) {
      if (!seen.has(recipe.id)) {
        seen.add(recipe.id);
        out.push(recipe);
      }
    }
    return out;
  }, [favorites]);

  // --- "my recipes": rank the user's saved + catalog recipes by the query -----
  const mineResults = useMemo(() => {
    if (scope !== 'mine') return [] as Recipe[];
    return rankRecipes(myRecipes, activeQuery);
  }, [scope, myRecipes, activeQuery]);

  // --- "find via AI": cached generation (runs once per query, no reshuffle) ---
  const { data: aiData } = useAiRecipes(
    activeQuery,
    prefs.dietary,
    prefs.allergens,
    scope === 'ai',
  );
  const aiResults = useMemo(
    () => (aiData ? dropAllergenConflicts(aiData, prefs.allergens) : null),
    [aiData, prefs.allergens],
  );

  const busy = scope === 'mine' ? isLoading : aiResults === null;
  const list = scope === 'mine' ? mineResults : (aiResults ?? []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="px-gutter pt-4">
        <View className="mb-1 flex-row items-center justify-between gap-3">
          <Pressable
            onPress={() => router.back()}
            className="flex-1 flex-row items-center gap-2 active:opacity-70"
          >
            <Text className="font-body-semibold text-14 text-primary">←</Text>
            <Text
              className="flex-1 font-body-medium text-14 italic text-secondary"
              numberOfLines={1}
            >
              &ldquo;{activeQuery}&rdquo;
            </Text>
          </Pressable>
          <AppMenu />
        </View>
        <Text className="mb-3 font-body text-12 text-tertiary">
          {scope === 'ai' ? 'Generated via Dishly AI' : 'From your recipes'}
        </Text>
      </View>

      {busy ? (
        scope === 'ai' ? (
          <AiPipeline />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Loader label="Searching your recipes…" />
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
