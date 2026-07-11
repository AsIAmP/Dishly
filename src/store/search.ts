import { create } from 'zustand';

/** Client-only search UI state: scope toggle + the last-issued query. */
export type SearchScope = 'mine' | 'ai';

type SearchState = {
  scope: SearchScope;
  activeQuery: string;
  setScope: (scope: SearchScope) => void;
  setQuery: (query: string) => void;
};

export const useSearch = create<SearchState>((set) => ({
  scope: 'ai',
  activeQuery: 'mushroom pasta',
  setScope: (scope) => set({ scope }),
  setQuery: (query) => set({ activeQuery: query }),
}));
