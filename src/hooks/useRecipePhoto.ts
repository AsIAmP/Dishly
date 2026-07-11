import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchRecipePhoto, saveRecipePhoto } from '@/data/recipePhotos';

/** The user's attached photo for a recipe (null while none / loading). */
export function useRecipePhoto(recipeId: string | undefined) {
  return useQuery({
    queryKey: ['recipePhoto', recipeId],
    queryFn: () => fetchRecipePhoto(recipeId as string),
    enabled: !!recipeId,
  });
}

/** Attach/replace the user's photo for a recipe; updates the cache on success. */
export function useSaveRecipePhoto(recipeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageUri: string) => saveRecipePhoto(recipeId, imageUri),
    onSuccess: (_data, imageUri) =>
      qc.setQueryData(['recipePhoto', recipeId], imageUri),
  });
}
