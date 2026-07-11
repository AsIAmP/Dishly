import { useQuery } from '@tanstack/react-query';

import { fetchRecipeById, fetchRecipes } from '@/data/api';
import { queryKeys } from '@/lib/queryClient';

export function useRecipes() {
  return useQuery({ queryKey: queryKeys.recipes, queryFn: fetchRecipes });
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recipe(id ?? ''),
    queryFn: () => fetchRecipeById(id as string),
    enabled: !!id,
  });
}
