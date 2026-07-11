import { useQuery } from '@tanstack/react-query';

import { fetchRecipeById, fetchRecipes } from '@/data/api';
import { generateRecipesForQuery } from '@/data/ai';
import { queryKeys } from '@/lib/queryClient';

export function useRecipes() {
  return useQuery({ queryKey: queryKeys.recipes, queryFn: fetchRecipes });
}

/**
 * "Find via AI" generation, cached per query + prefs. Because it's a keyed query
 * with an infinite stale time, it runs exactly once for a given search and is
 * served from cache afterwards — so re-renders / remounts never re-trigger the
 * (non-deterministic, paid) generation, which previously reshuffled results.
 */
export function useAiRecipes(
  query: string,
  dietary: string[],
  allergens: string[],
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['aiRecipes', query, dietary.join(','), allergens.join(',')],
    queryFn: () => generateRecipesForQuery(query, undefined, { dietary, allergens }),
    enabled: enabled && query.trim().length > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recipe(id ?? ''),
    queryFn: () => fetchRecipeById(id as string),
    enabled: !!id,
  });
}
