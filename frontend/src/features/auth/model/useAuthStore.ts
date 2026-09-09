import { create } from 'zustand';
import {
  clearAccessToken,
  getAccessToken,
  getStoredSessionUser,
  setAccessToken,
  setRefreshToken,
  setStoredSessionUser,
  type AuthUser,
} from '@/shared/auth';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser, persistent?: boolean, refreshToken?: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setSession: (token, user, persistent = false, refreshToken) => {
    setAccessToken(token, persistent);
    setStoredSessionUser(user, persistent);
    if (refreshToken) {
      setRefreshToken(refreshToken, persistent);
    }
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    clearAccessToken();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    const token = getAccessToken();
    if (!token) {
      if (get().token || get().isAuthenticated || get().user) {
        get().logout();
      }
      return false;
    }

    const storedUser = getStoredSessionUser();
    set({
      token,
      user: storedUser,
      isAuthenticated: true,
    });
    return true;
  },
}));

if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}
