import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPhotoFavorite,
  addRecipeFavorite,
  fetchFavorites,
  removeFavorite,
  type Favorite,
} from '@/data/api';
import type { Recipe } from '@/data/recipes';
import { queryKeys } from '@/lib/queryClient';

export function useFavorites() {
  return useQuery({ queryKey: queryKeys.favorites, queryFn: fetchFavorites });
}

export function useAddRecipeFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipe: Recipe) => addRecipeFavorite(recipe),
    onSuccess: (favorites) => qc.setQueryData<Favorite[]>(queryKeys.favorites, favorites),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeFavorite(id),
    onSuccess: (favorites) => qc.setQueryData<Favorite[]>(queryKeys.favorites, favorites),
  });
}

export function useAddPhotoFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      caption: string;
      imageUri?: string;
      recipeId?: string;
    }) => addPhotoFavorite(input),
    onSuccess: (favorites) => qc.setQueryData<Favorite[]>(queryKeys.favorites, favorites),
  });
}
