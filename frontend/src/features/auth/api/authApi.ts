import { clearAccessToken, getAccessToken, loginWithCredentials } from '@/shared/auth';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

export const authApi = {
  login: (email: string, password: string, remember = false) =>
    loginWithCredentials(apiBaseUrl, email, password, remember),
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
    clearAccessToken();
  },
};
