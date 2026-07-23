import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  currentUserEmail: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
  authLoading: boolean;
  setAuth: (email: string, userId: string) => void;
  logout: () => void;
  setAuthLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  currentUserEmail: null,
  currentUserId: null,
  isAdmin: false,
  authLoading: true,

  setAuth: (email, userId) =>
    set({
      isLoggedIn: true,
      currentUserEmail: email,
      currentUserId: userId,
      isAdmin: email === 'caduogarcia@gmail.com',
      authLoading: false,
    }),

  logout: () =>
    set({
      isLoggedIn: false,
      currentUserEmail: null,
      currentUserId: null,
      isAdmin: false,
      authLoading: false,
    }),

  setAuthLoading: (loading) =>
    set({
      authLoading: loading,
    }),
}));
