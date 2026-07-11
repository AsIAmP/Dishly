/**
 * Data-access seam.
 *
 * These async functions are what React Query hooks call. Recipes are still mock
 * data (the catalog isn't in the DB). Favorites now persist per-user in Supabase
 * when a session exists; without one (guest / unconfigured) they fall back to an
 * in-memory store so the dev flow keeps working. Signatures are unchanged, so no
 * screen or hook changes.
 */

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generatedById } from './ai';
import {
  ALL_RECIPES_BY_ID,
  RECIPES,
  type Difficulty,
  type Recipe,
} from './recipes';

/** Simulate a small network latency so React Query loading states are real. */
const delay = (ms = 220) => new Promise<void>((r) => setTimeout(r, ms));

/** The signed-in user's id, or null for guest / unconfigured (in-memory mode). */
async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

// --- Recipes (read-only) ------------------------------------------------------
export async function fetchRecipes(): Promise<Recipe[]> {
  await delay();
  return RECIPES;
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  await delay();
  // Never return undefined — React Query rejects it. null = not found.
  return ALL_RECIPES_BY_ID[id] ?? generatedById[id] ?? null;
}

// --- Favorites (read + mutate) ------------------------------------------------
// A single collection holding BOTH saved recipes and captured photos, per design.
export type Favorite =
  | {
      id: string;
      kind: 'recipe';
      title: string;
      recipeId: string;
      /** The recipe's hero image, so the Favorites tile can show it. */
      image?: string;
      /** The recipe's difficulty, for the Favorites tag + grouping. */
      difficulty?: Difficulty;
    }
  | {
      id: string;
      kind: 'photo';
      title: string;
      caption: string;
      /** Data URL of the captured/uploaded image (web capture). */
      imageUri?: string;
      /** Present when the photo was run through "recognize dish". */
      recipeId?: string;
    };

// In-memory store used only in guest / unconfigured mode.
let FAVORITES: Favorite[] = [];

/** Map a Supabase `favorites` row into the app's Favorite union. */
function rowToFavorite(r: {
  id: string;
  kind: string;
  title: string;
  recipe_id: string | null;
  caption: string | null;
  image_uri: string | null;
  recipe_json?: Recipe | null;
}): Favorite {
  if (r.kind === 'recipe') {
    const recipeId = r.recipe_id ?? '';
    const catalog = ALL_RECIPES_BY_ID[recipeId];
    return {
      id: r.id,
      kind: 'recipe',
      title: r.title,
      recipeId,
      // Prefer the stored recipe JSON; fall back to the catalog lookup for older
      // favorites saved without recipe_json.
      image: r.recipe_json?.image ?? catalog?.image,
      difficulty: r.recipe_json?.difficulty ?? catalog?.difficulty,
    };
  }
  return {
    id: r.id,
    kind: 'photo',
    title: r.title,
    caption: r.caption ?? '',
    imageUri: r.image_uri ?? undefined,
    recipeId: r.recipe_id ?? undefined,
  };
}

export async function fetchFavorites(): Promise<Favorite[]> {
  const uid = await currentUserId();
  if (!uid) {
    await delay();
    return [...FAVORITES];
  }
  const { data, error } = await supabase
    .from('favorites')
    .select('id, kind, title, recipe_id, caption, image_uri, recipe_json')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Rehydrate any stored AI recipes so the detail screen can open them again.
  for (const row of data ?? []) {
    if (row.recipe_json && row.recipe_id && !ALL_RECIPES_BY_ID[row.recipe_id]) {
      generatedById[row.recipe_id] = row.recipe_json as Recipe;
    }
  }
  return (data ?? []).map(rowToFavorite);
}

export async function addRecipeFavorite(recipe: Recipe): Promise<Favorite[]> {
  const uid = await currentUserId();
  if (!uid) {
    await delay(120);
    if (!FAVORITES.some((f) => f.kind === 'recipe' && f.recipeId === recipe.id)) {
      FAVORITES = [
        ...FAVORITES,
        {
          id: `fav-${Date.now()}`,
          kind: 'recipe',
          title: recipe.title,
          recipeId: recipe.id,
          image: recipe.image,
          difficulty: recipe.difficulty,
        },
      ];
    }
    return [...FAVORITES];
  }
  // Dedupe: only insert if this recipe isn't already saved for the user.
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', uid)
    .eq('kind', 'recipe')
    .eq('recipe_id', recipe.id)
    .maybeSingle();
  if (!existing) {
    const { error } = await supabase.from('favorites').insert({
      user_id: uid,
      kind: 'recipe',
      title: recipe.title,
      recipe_id: recipe.id,
      // Persist the full recipe so AI-generated ones survive a reload.
      recipe_json: recipe,
    });
    if (error) throw error;
  }
  return fetchFavorites();
}

export async function addPhotoFavorite(input: {
  title: string;
  caption: string;
  imageUri?: string;
  recipeId?: string;
}): Promise<Favorite[]> {
  const uid = await currentUserId();
  if (!uid) {
    await delay(120);
    FAVORITES = [
      ...FAVORITES,
      {
        id: `fav-${Date.now()}`,
        kind: 'photo',
        title: input.title,
        caption: input.caption,
        imageUri: input.imageUri,
        recipeId: input.recipeId,
      },
    ];
    return [...FAVORITES];
  }
  const { error } = await supabase.from('favorites').insert({
    user_id: uid,
    kind: 'photo',
    title: input.title,
    caption: input.caption,
    image_uri: input.imageUri ?? null,
    recipe_id: input.recipeId ?? null,
  });
  if (error) throw error;
  return fetchFavorites();
}

export function isRecipeFavorited(favorites: Favorite[], recipeId: string): boolean {
  return favorites.some((f) => f.kind === 'recipe' && f.recipeId === recipeId);
}

/** Remove a favorite (recipe or photo) by its id. Returns the updated list. */
export async function removeFavorite(id: string): Promise<Favorite[]> {
  const uid = await currentUserId();
  if (!uid) {
    await delay(120);
    FAVORITES = FAVORITES.filter((f) => f.id !== id);
    return [...FAVORITES];
  }
  const { error } = await supabase.from('favorites').delete().eq('user_id', uid).eq('id', id);
  if (error) throw error;
  return fetchFavorites();
}
