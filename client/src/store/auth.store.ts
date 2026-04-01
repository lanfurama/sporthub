import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, user) => {
        localStorage.setItem('sporthub_token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('sporthub_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      initialize: () => {
        const token = localStorage.getItem('sporthub_token');
        if (!token) {
          set({ token: null, user: null, isAuthenticated: false });
        }
        // persisted state is restored automatically by zustand/persist
      },
    }),
    {
      name: 'sporthub_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
