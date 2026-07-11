/**
 * Import a recipe from a pasted URL. Delegates to the `import-recipe` Edge
 * Function (which fetches + extracts server-side), then registers the result so
 * the recipe detail screen can open it. Returns a friendly error string on
 * failure so the import screen can show it inline.
 */
import { generatedById } from './ai';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Recipe } from './recipes';

export async function importRecipeFromUrl(
  url: string,
): Promise<{ recipe?: Recipe; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Connect Supabase to import recipes from a URL.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke('import-recipe', {
      body: { url: url.trim() },
    });
    if (error) return { error: 'Import failed — check the link and try again.' };
    if (data?.error || !data?.recipe) {
      return { error: data?.error ?? 'No recipe found on that page.' };
    }
    const recipe = data.recipe as Recipe;
    generatedById[recipe.id] = recipe;
    return { recipe };
  } catch {
    return { error: 'Import failed — check the link and try again.' };
  }
}

/** Re-register an edited imported recipe (e.g. after the user changes the title). */
export function registerImportedRecipe(recipe: Recipe) {
  generatedById[recipe.id] = recipe;
}
