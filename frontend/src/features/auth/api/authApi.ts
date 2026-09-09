import {
  clearAccessToken,
  getAccessToken,
  loginWithCredentials,
  persistRememberPreference,
} from '@/shared/auth';
import { useAuthStore } from '../model/useAuthStore';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

export const authApi = {
  login: async (identifier: string, password: string, rememberMe = false) => {
    const result = await loginWithCredentials(apiBaseUrl, identifier, password, rememberMe);
    useAuthStore.getState().setSession(
      result.accessToken,
      result.user,
      rememberMe,
      result.refreshToken,
    );
    persistRememberPreference(identifier, rememberMe);
    return result;
  },
  logout: async () => {
    const token = getAccessToken();
    if (token) {
      try {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // El cierre de sesión del cliente no depende de que el backend responda.
      }
    }
    useAuthStore.getState().logout();
    clearAccessToken();
  },
};
