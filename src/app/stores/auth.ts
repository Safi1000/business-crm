import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  authenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  login: (email: string) => void;
  logout: () => void;
}

/** Mock auth — no real backend. Gates the admin shell behind the login screen. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authenticated: false,
      user: null,
      login: (email) =>
        set({
          authenticated: true,
          user: { name: 'Faisal Malik', email, role: 'Super Admin' },
        }),
      logout: () => set({ authenticated: false, user: null }),
    }),
    { name: 'txs-auth' },
  ),
);
