import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMenu } from '@/components/AppMenu';
import { CapturedImage } from '@/components/CapturedImage';
import { Loader } from '@/components/Loader';
import { TextField } from '@/components/TextField';
import { importRecipeFromUrl, registerImportedRecipe } from '@/data/importRecipe';
import { recipeSkillLevel, type Recipe } from '@/data/recipes';
import { useAddRecipeFavorite } from '@/hooks/useFavorites';

/**
 * Save from URL. Paste a recipe link → the import-recipe function fetches and
 * extracts it → an editable preview card → Save to Favorites (same structure as
 * search/camera recipes). Missing fields are best-guessed server-side.
 */
export default function ImportScreen() {
  const router = useRouter();
  const addFavorite = useAddRecipeFavorite();

  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState('');

  const fetchRecipe = async () => {
    if (!/^https?:\/\/.+/i.test(url.trim())) {
      setError('Enter a valid link starting with http(s)://');
      return;
    }
    setBusy(true);
    setError(null);
    const { recipe: r, error: err } = await importRecipeFromUrl(url);
    setBusy(false);
    if (err || !r) {
      setError(err ?? 'Couldn’t import that recipe.');
      return;
    }
    setRecipe(r);
    setTitle(r.title);
  };

  const save = () => {
    if (!recipe) return;
    const final = { ...recipe, title: title.trim() || recipe.title };
    registerImportedRecipe(final);
    addFavorite.mutate(final, { onSuccess: () => router.replace('/favorites') });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-gutter pb-5 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <Text className="font-body-semibold text-14 text-primary">← Back</Text>
          </Pressable>
          <AppMenu />
        </View>

        {!recipe ? (
          <View className="flex-1">
            <Text className="mb-1.5 font-display text-22 text-primary">Save from a link</Text>
            <Text className="mb-5 font-body text-14 text-secondary">
              Paste a recipe URL from any website and we’ll turn it into a Dishly card.
            </Text>

            <TextField
              placeholder="https://example.com/best-pasta"
              autoCapitalize="none"
              keyboardType="url"
              value={url}
              onChangeText={(t) => {
                setUrl(t);
                setError(null);
              }}
              onSubmitEditing={fetchRecipe}
            />
            {error ? <Text className="mt-2 font-body text-12 text-danger">{error}</Text> : null}

            {busy ? (
              <View className="mt-10 items-center">
                <Loader label="Reading the page & building your card…" />
              </View>
            ) : (
              <Pressable
                onPress={fetchRecipe}
                disabled={url.trim().length === 0}
                className="mt-4 items-center justify-center rounded-full bg-accent active:opacity-90"
                style={{ height: 52, opacity: url.trim().length === 0 ? 0.5 : 1 }}
              >
                <Text className="font-body-bold text-15 text-on-accent">Fetch recipe</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="overflow-hidden rounded-xl" style={{ aspectRatio: 4 / 3 }}>
              <CapturedImage uri={recipe.image} caption="Recipe photo" />
            </View>

            <Text className="mb-1.5 mt-4 font-body text-12 text-secondary">Title (editable)</Text>
            <TextField value={title} onChangeText={setTitle} placeholder="Recipe title" />

            <View className="mt-3 flex-row items-center gap-2">
              <View className="rounded-full bg-accent-tint px-2.5 py-1">
                <Text className="font-body-bold text-11 text-accent">
                  🍳 {recipeSkillLevel(recipe.difficulty)}
                </Text>
              </View>
              <Text className="font-body text-12 text-secondary">
                Prep {recipe.prep}m · Cook {recipe.cook}m
              </Text>
            </View>

            <Text className="mb-2 mt-5 font-body-bold text-13 text-primary">
              Ingredients ({recipe.ingredients.length})
            </Text>
            {recipe.ingredients.map((ing, i) => (
              <Text key={i} className="mb-1 font-body text-13 text-secondary">
                • {ing.name}
                {ing.g != null ? ` — ${ing.g} g` : ing.text ? ` — ${ing.text}` : ''}
              </Text>
            ))}

            <Text className="mb-2 mt-4 font-body-bold text-13 text-primary">
              Steps ({recipe.steps.length})
            </Text>
            {recipe.steps.map((step) => (
              <View key={step.n} className="mb-2 flex-row gap-2.5">
                <Text className="font-body-bold text-13 text-accent" style={{ width: 18 }}>
                  {step.n}
                </Text>
                <View className="flex-1">
                  <Text className="font-body text-13 text-primary">{step.template}</Text>
                  <Text className="font-body-semibold text-11 text-secondary">{step.min} min</Text>
                </View>
              </View>
            ))}

            <Pressable
              onPress={save}
              className="mt-5 items-center justify-center rounded-full bg-accent active:opacity-90"
              style={{ height: 52 }}
            >
              <Text className="font-body-bold text-15 text-on-accent">Save to Favorites</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setRecipe(null);
                setError(null);
              }}
              className="mt-2.5 items-center py-2 active:opacity-70"
            >
              <Text className="font-body-semibold text-13 text-secondary">Try another link</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
