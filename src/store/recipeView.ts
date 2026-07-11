import { create } from 'zustand';

import type { Unit } from '@/data/recipes';

/**
 * Client-only cook-mode state for the Recipe detail screen:
 *  - `unit`: g/oz toggle, affecting BOTH ingredient amounts and step text.
 *  - `checks`: which ingredients the user "has" (pantry check, keyed
 *    `${recipeId}-${index}`). Not a shopping list.
 */
type RecipeViewState = {
  unit: Unit;
  checks: Record<string, boolean>;
  setUnit: (unit: Unit) => void;
  toggleCheck: (key: string) => void;
  resetChecks: () => void;
};

export const useRecipeView = create<RecipeViewState>((set) => ({
  unit: 'g',
  checks: {},
  setUnit: (unit) => set({ unit }),
  toggleCheck: (key) => set((s) => ({ checks: { ...s.checks, [key]: !s.checks[key] } })),
  resetChecks: () => set({ checks: {} }),
}));
