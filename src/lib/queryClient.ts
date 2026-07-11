import { QueryClient } from '@tanstack/react-query';

// Single shared client. Conservative defaults for a mostly-static recipe app;
// retry is off so mock/Supabase errors surface immediately during review.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  recipes: ['recipes'] as const,
  recipe: (id: string) => ['recipe', id] as const,
  favorites: ['favorites'] as const,
};
