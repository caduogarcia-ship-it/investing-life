import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TabType } from '../../components/Sidebar';

interface AppState {
  ticker: string;
  activeTab: TabType | string;
  watchlist: string[];
  showDetail: boolean;
  setTicker: (t: string) => void;
  setActiveTab: (tab: TabType | string) => void;
  addToWatchlist: (sym: string) => void;
  removeFromWatchlist: (sym: string) => void;
  setShowDetail: (b: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ticker: 'PETR4',
      activeTab: 'analise',
      watchlist: ['PETR4', 'VALE3', 'WEGE3', 'CURY3', 'TEND3', 'ITUB4'],
      showDetail: false,

      setTicker: (t) => set({ ticker: t }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      addToWatchlist: (sym) =>
        set((state) => ({
          watchlist: state.watchlist.includes(sym)
            ? state.watchlist
            : [...state.watchlist, sym],
        })),
      removeFromWatchlist: (sym) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== sym),
        })),
      setShowDetail: (b) => set({ showDetail: b }),
    }),
    {
      name: 'investing-life-app-storage',
    }
  )
);
