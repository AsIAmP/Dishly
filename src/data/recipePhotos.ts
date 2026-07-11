/**
 * User-attached recipe photos. A user can attach one photo to any recipe
 * (catalog or AI-generated); it overrides the recipe's default hero image.
 *
 * Persisted per-user in the Supabase `recipe_photos` table when signed in; for
 * guest / unconfigured it falls back to an in-memory map, matching the pattern
 * used for favorites.
 */
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// Guest / unconfigured fallback, keyed by recipe id.
const memory: Record<string, string> = {};

async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** The user's attached photo for a recipe, or null if none. */
export async function fetchRecipePhoto(recipeId: string): Promise<string | null> {
  const uid = await currentUserId();
  if (!uid) return memory[recipeId] ?? null;
  const { data, error } = await supabase
    .from('recipe_photos')
    .select('image_uri')
    .eq('user_id', uid)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  if (error || !data) return null;
  return data.image_uri;
}

/** Attach (or replace) the user's photo for a recipe. */
export async function saveRecipePhoto(recipeId: string, imageUri: string): Promise<void> {
  const uid = await currentUserId();
  if (!uid) {
    memory[recipeId] = imageUri;
    return;
  }
  const { error } = await supabase.from('recipe_photos').upsert({
    user_id: uid,
    recipe_id: recipeId,
    image_uri: imageUri,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
