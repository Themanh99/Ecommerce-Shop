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
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
