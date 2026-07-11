/**
 * Data-access seam.
 *
 * These async functions are what React Query hooks call. Today they resolve
 * mock data (recipes) and an in-memory store (favorites). In Phase 4 the BODIES
 * are replaced with Supabase queries/mutations — the signatures stay identical,
 * so no screen or hook changes. This is the "swap the fetcher, not the UI" seam.
 */

import { generatedById } from './ai';
import {
  ALL_RECIPES_BY_ID,
  RECIPES,
  type Recipe,
} from './recipes';

/** Simulate a small network latency so React Query loading states are real. */
const delay = (ms = 220) => new Promise<void>((r) => setTimeout(r, ms));

// --- Recipes (read-only) ------------------------------------------------------
export async function fetchRecipes(): Promise<Recipe[]> {
  await delay();
  return RECIPES;
}

export async function fetchRecipeById(id: string): Promise<Recipe | undefined> {
  await delay();
  return ALL_RECIPES_BY_ID[id] ?? generatedById[id];
}

// --- Favorites (read + mutate) ------------------------------------------------
// A single collection holding BOTH saved recipes and captured photos, per design.
export type Favorite =
  | { id: string; kind: 'recipe'; title: string; recipeId: string }
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

// Module-level store stands in for a Supabase table in Phase 3.
let FAVORITES: Favorite[] = [];

export async function fetchFavorites(): Promise<Favorite[]> {
  await delay();
  return [...FAVORITES];
}

export async function addRecipeFavorite(recipe: Recipe): Promise<Favorite[]> {
  await delay(120);
  if (!FAVORITES.some((f) => f.kind === 'recipe' && f.recipeId === recipe.id)) {
    FAVORITES = [
      ...FAVORITES,
      { id: `fav-${Date.now()}`, kind: 'recipe', title: recipe.title, recipeId: recipe.id },
    ];
  }
  return [...FAVORITES];
}

export async function addPhotoFavorite(input: {
  title: string;
  caption: string;
  imageUri?: string;
  recipeId?: string;
}): Promise<Favorite[]> {
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

export function isRecipeFavorited(favorites: Favorite[], recipeId: string): boolean {
  return favorites.some((f) => f.kind === 'recipe' && f.recipeId === recipeId);
}
