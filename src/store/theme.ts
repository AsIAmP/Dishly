import { create } from 'zustand';

/**
 * Client-only theme state. Scaffolded per the state boundary; the design ships a
 * single light theme, so this defaults to 'light'. A dark palette can be added
 * later via NativeWind `dark:` variants driven off this value.
 */
export type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

export const useTheme = create<ThemeState>((set) => ({
  mode: 'light',
  setMode: (mode) => set({ mode }),
  toggle: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
}));
