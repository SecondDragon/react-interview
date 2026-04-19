import { create } from 'zustand';

interface UserState {
  username: string;
  isLoggedIn: boolean;
  setUser: (username: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: '',
  isLoggedIn: false,
  setUser: (username: string) => set({ username, isLoggedIn: true }),
  logout: () => set({ username: '', isLoggedIn: false }),
}));
