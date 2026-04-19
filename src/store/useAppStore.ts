import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  collapsed: boolean;
  theme: 'light' | 'dark';
  toggleCollapsed: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      collapsed: false,
      theme: 'light',
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage',
    }
  )
);
