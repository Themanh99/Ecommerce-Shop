import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export type UserRole = 'ADMIN' | 'SALE' | 'USER';

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<AuthUser | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      login: (user) => set({ user, isAuthenticated: true, isInitialized: true }),

      logout: async () => {
        set({ user: null, isAuthenticated: false, isInitialized: true });
        try {
          await api.post('/auth/logout', null, {
            _silent: true,
            _skipAuthRefresh: true,
          });
        } catch {
          // The local session is already cleared even if the backend is offline.
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          const user = data as AuthUser;
          set({ user, isAuthenticated: true, isInitialized: true });
          return user;
        } catch {
          set({ user: null, isAuthenticated: false, isInitialized: true });
          return null;
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
