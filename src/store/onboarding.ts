import { create } from 'zustand';

/**
 * Client-only onboarding answers. These are in-progress selections that later
 * filter Results and flag allergens on Recipe detail. (Persisted to the user's
 * profile in Supabase in Phase 4; for now they live only in this session.)
 *
 * Dietary + Allergens use a mutually-exclusive "None" chip: selecting "none"
 * clears the others, and selecting any real option clears "none".
 */

type OnboardingState = {
  skill: string | null;
  dietary: string[];
  allergens: string[];
  completed: boolean;

  setSkill: (key: string) => void;
  toggleDietary: (key: string) => void;
  toggleAllergen: (key: string) => void;
  complete: () => void;
  reset: () => void;
};

function toggleWithNone(list: string[], key: string): string[] {
  if (key === 'none') {
    return list.includes('none') ? [] : ['none'];
  }
  const withoutNone = list.filter((k) => k !== 'none');
  return withoutNone.includes(key)
    ? withoutNone.filter((k) => k !== key)
    : [...withoutNone, key];
}

export const useOnboarding = create<OnboardingState>((set) => ({
  skill: null,
  dietary: [],
  allergens: [],
  completed: false,

  setSkill: (key) => set({ skill: key }),
  toggleDietary: (key) => set((s) => ({ dietary: toggleWithNone(s.dietary, key) })),
  toggleAllergen: (key) => set((s) => ({ allergens: toggleWithNone(s.allergens, key) })),
  complete: () => set({ completed: true }),
  reset: () => set({ skill: null, dietary: [], allergens: [], completed: false }),
}));

/** Active dietary/allergen filters, with "none" normalized to an empty set. */
export function selectActiveFilters(s: Pick<OnboardingState, 'dietary' | 'allergens'>) {
  return {
    dietary: s.dietary.includes('none') ? [] : s.dietary,
    allergens: s.allergens.includes('none') ? [] : s.allergens,
  };
}
