import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrencyCode } from '@/lib/format';

interface UIState {
  // Persisted
  sidebarCollapsed: boolean;
  currency: CurrencyCode;
  theme: 'light' | 'dark';
  // Ephemeral overlays
  commandOpen: boolean;
  notificationsOpen: boolean;
  assistantOpen: boolean;

  toggleSidebar: () => void;
  setCurrency: (c: CurrencyCode) => void;
  toggleTheme: () => void;
  setCommandOpen: (v: boolean) => void;
  setNotificationsOpen: (v: boolean) => void;
  setAssistantOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currency: 'PKR',
      theme: 'light',
      commandOpen: false,
      notificationsOpen: false,
      assistantOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCurrency: (currency) => set({ currency }),
      toggleTheme: () =>
        set((s) => {
          const theme = s.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', theme === 'dark');
          return { theme };
        }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
      setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
    }),
    {
      name: 'txs-ui',
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        currency: s.currency,
        theme: s.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') document.documentElement.classList.add('dark');
      },
    },
  ),
);
