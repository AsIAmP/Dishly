import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppMenu } from '@/components/AppMenu';
import { CapturedImage } from '@/components/CapturedImage';
import { Checkbox } from '@/components/Checkbox';
import { Loader } from '@/components/Loader';
import { PhotoCapture } from '@/components/PhotoCapture';
import { ALL_RECIPES_BY_ID, formatAmount, recipeSkillLevel, stepText } from '@/data/recipes';
import { useFavorites, useAddRecipeFavorite } from '@/hooks/useFavorites';
import { useRecipePhoto, useSaveRecipePhoto } from '@/hooks/useRecipePhoto';
import { useRecipe } from '@/hooks/useRecipes';
import { isRecipeFavorited, type Favorite } from '@/data/api';
import { selectActiveFilters, useOnboarding } from '@/store/onboarding';
import { useRecipeView } from '@/store/recipeView';
import { colors } from '@/theme/tokens';

/** A small circular control that floats over the hero (back, info). */
function HeroButton({
  label,
  onPress,
  right,
  top,
  accent,
}: {
  label: string;
  onPress: () => void;
  right?: boolean;
  top: number;
  accent?: boolean;
}) {
  const size = accent ? 30 : 36;
  return (
    <Pressable
      onPress={onPress}
      className="absolute items-center justify-center rounded-full bg-white/90 active:opacity-80"
      style={{ width: size, height: size, top, left: right ? undefined : 16, right: right ? 16 : undefined }}
    >
      <Text className={accent ? 'font-body-bold text-13 italic text-accent' : 'text-16 text-primary'}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: string }>();
  const isPhotoOnly = kind === 'photo';

  const unit = useRecipeView((s) => s.unit);
  const setUnit = useRecipeView((s) => s.setUnit);
  const checks = useRecipeView((s) => s.checks);
  const toggleCheck = useRecipeView((s) => s.toggleCheck);
  const [infoOpen, setInfoOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  // User-attached photo for this recipe (overrides the default hero image).
  const { data: userPhoto } = useRecipePhoto(isPhotoOnly ? undefined : id);
  const savePhoto = useSaveRecipePhoto(id);

  const dietary = useOnboarding((s) => s.dietary);
  const allergens = useOnboarding((s) => s.allergens);

  const { data: favorites } = useFavorites();
  const addFavorite = useAddRecipeFavorite();

  // Full recipe path (from Results, or a recognized-photo favorite).
  const { data: recipe, isLoading } = useRecipe(isPhotoOnly ? undefined : id);

  // Photo-only path: resolve the caption from the favorites collection.
  const photoFavorite = useMemo(
    () =>
      favorites?.find(
        (f): f is Extract<Favorite, { kind: 'photo' }> => f.id === id && f.kind === 'photo',
      ),
    [favorites, id],
  );

  const activeAllergens = selectActiveFilters({ dietary, allergens }).allergens;
  const allergenFlags = useMemo(
    () => (recipe ? recipe.allergens.filter((a) => activeAllergens.includes(a)) : []),
    [recipe, activeAllergens],
  );

  const alreadySaved = recipe && favorites ? isRecipeFavorited(favorites, recipe.id) : false;

  // ----- Photo-only favorite (captured photo, optionally recognized) ----------
  if (isPhotoOnly) {
    const recognized = photoFavorite?.recipeId
      ? ALL_RECIPES_BY_ID[photoFavorite.recipeId]
      : undefined;
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center justify-between px-gutter py-3">
            <Pressable onPress={() => router.back()} className="active:opacity-70">
              <Text className="font-body-semibold text-14 text-primary">← Back</Text>
            </Pressable>
            <AppMenu />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ aspectRatio: 4 / 3 }} className="relative">
            <CapturedImage uri={photoFavorite?.imageUri} caption="Captured photo" />
          </View>
          <View className="px-gutter pt-4">
            <Text className="mb-1.5 font-display text-24 text-primary">
              {recognized?.title ?? photoFavorite?.title ?? 'Captured photo'}
            </Text>
            <Text className="font-body text-13 text-secondary">
              {photoFavorite?.caption || 'No caption added.'}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loader label="Loading recipe…" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-gutter">
          <Text className="mb-2 text-center font-body-bold text-15 text-primary">
            Recipe unavailable
          </Text>
          <Text className="mb-5 text-center font-body text-13 text-secondary">
            This recipe couldn’t be loaded. AI recipes saved before this update can’t be
            restored — search again to regenerate it.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full border-accent px-5 py-2.5 active:opacity-80"
            style={{ borderWidth: 1.5 }}
          >
            <Text className="font-body-bold text-13 text-accent">← Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const unitTab = (active: boolean) =>
    `rounded-full px-3 py-1 ${active ? 'bg-accent' : ''}`;
  const unitTabText = (active: boolean) =>
    `font-body-bold text-12 ${active ? 'text-on-accent' : 'text-secondary'}`;

  // A user-attached photo wins over the recipe's default image.
  const heroUri = userPhoto ?? recipe.image;

  return (
    <View className="flex-1 bg-background">
      {/* Header row: Back · menu */}
      <View style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-gutter py-3">
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <Text className="font-body-semibold text-14 text-primary">← Back</Text>
          </Pressable>
          <AppMenu />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ aspectRatio: 4 / 3 }} className="relative">
          <CapturedImage uri={heroUri} caption="Hero photo of the dish" />
          <HeroButton label="i" onPress={() => setInfoOpen((v) => !v)} top={12} right accent />
        </View>

        {infoOpen ? (
          <View
            className="mx-gutter mt-3 rounded-md bg-surface px-3.5 py-3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowRadius: 24,
              shadowOpacity: 0.08,
              elevation: 6,
            }}
          >
            <Text className="font-body text-13 text-body-muted">{recipe.calories}</Text>
          </View>
        ) : null}

        {/* Title · author · rating + the recipe's skill level */}
        <View className="px-gutter pt-4">
          <Text className="mb-1.5 font-display text-24 text-primary">{recipe.title}</Text>
          <Text className="mb-2 font-body text-13 text-secondary">
            {recipe.author}
            {recipe.rating != null ? ` · ★ ${recipe.rating}` : ''}
          </Text>
          <View className="flex-row">
            <View className="rounded-full bg-accent-tint px-2.5 py-1">
              <Text className="font-body-bold text-11 text-accent">
                🍳 {recipeSkillLevel(recipe.difficulty)}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setPhotoOpen(true)}
            className="mt-3 flex-row items-center justify-center rounded-md border-border bg-surface active:opacity-90"
            style={{ height: 44, borderWidth: 1.5 }}
          >
            <Text className="font-body-semibold text-13 text-primary">
              📷 {userPhoto ? 'Change photo' : 'Add a photo'}
            </Text>
          </Pressable>
        </View>

        {/* Allergen flags (from onboarding answers) */}
        {allergenFlags.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5 px-gutter pt-3">
            {allergenFlags.map((flag) => (
              <View key={flag} className="rounded-full bg-accent-tint-strong px-2.5 py-1">
                <Text className="font-body-bold text-11 text-danger">⚠ Contains {flag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Ingredients — g/oz toggle right-aligned; applies to ingredients + steps */}
        <View className="px-gutter pt-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-body-bold text-13 text-primary">
              Ingredients (check = have it)
            </Text>
            <View className="flex-row rounded-full bg-surface-sunken" style={{ padding: 2 }}>
              <Pressable className={unitTab(unit === 'g')} onPress={() => setUnit('g')}>
                <Text className={unitTabText(unit === 'g')}>g</Text>
              </Pressable>
              <Pressable className={unitTab(unit === 'oz')} onPress={() => setUnit('oz')}>
                <Text className={unitTabText(unit === 'oz')}>oz</Text>
              </Pressable>
            </View>
          </View>

          <View>
            {recipe.ingredients.map((ing, i) => {
              const key = `${recipe.id}-${i}`;
              return (
                <View
                  key={key}
                  className="flex-row items-center gap-2.5 border-divider py-2.5"
                  style={{ borderBottomWidth: 1 }}
                >
                  <Checkbox checked={!!checks[key]} onPress={() => toggleCheck(key)} />
                  <Text className="flex-1 font-body text-14 text-primary">{ing.name}</Text>
                  <Text className="font-body text-13 text-secondary">
                    {ing.g != null ? formatAmount(ing.g, unit) : ing.text}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Cooking steps (each with its own duration) */}
        <View className="px-gutter pb-2 pt-6">
          <Text className="mb-3 font-body-bold text-13 text-primary">Cooking steps</Text>
          <View className="gap-4">
            {recipe.steps.map((step) => (
              <View key={step.n} className="flex-row gap-3.5">
                <Text className="font-display text-26 text-accent" style={{ width: 34 }}>
                  {step.n}
                </Text>
                <View className="flex-1">
                  <Text className="mb-1 font-body text-14 text-primary">{stepText(step, unit)}</Text>
                  <Text className="font-body-semibold text-12 text-secondary">
                    step {step.n} · {step.min} min
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Save to Favorites */}
        <View className="px-gutter pt-5">
          <Pressable
            onPress={() => !alreadySaved && addFavorite.mutate(recipe)}
            disabled={alreadySaved}
            className={`items-center justify-center rounded-full ${
              alreadySaved ? 'bg-surface-muted' : 'border-accent bg-transparent'
            } active:opacity-80`}
            style={{ height: 52, borderWidth: alreadySaved ? 0 : 1.5 }}
          >
            <Text
              className={`font-body-bold text-15 ${
                alreadySaved ? 'text-secondary' : 'text-accent'
              }`}
            >
              {alreadySaved ? '♥ Saved to Favorites' : '♡ save to Favorites'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add / change the recipe's photo (reuses the capture/upload flow) */}
      <Modal
        visible={photoOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoOpen(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(31,27,22,0.4)' }}>
          <View
            className="rounded-t-xl bg-background px-gutter pb-6 pt-4"
            style={{ height: 460 }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-body-bold text-15 text-primary">Add a photo</Text>
              <Pressable onPress={() => setPhotoOpen(false)} className="active:opacity-70">
                <Text className="font-body-semibold text-14 text-secondary">Close</Text>
              </Pressable>
            </View>
            <View className="flex-1">
              <PhotoCapture
                mode="upload"
                captured={null}
                onCapture={(uri) => {
                  savePhoto.mutate(uri);
                  setPhotoOpen(false);
                }}
                onClear={() => {}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
