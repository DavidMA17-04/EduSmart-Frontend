import { clearAccessToken, getAccessToken, loginWithCredentials } from '@/shared/auth';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(body),
  });

  let payload: { message?: string | string[]; data?: T } | null = null;
  try {
    payload = (await response.json()) as { message?: string | string[]; data?: T };
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const raw = payload?.message;
    const message = Array.isArray(raw)
      ? raw.join(' ')
      : raw || 'No se pudo completar la solicitud.';
    throw new Error(message);
  }

  return (payload?.data ?? payload) as T;
}

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
  verifyAccount: (email: string, code: string) =>
    postJson<{ message: string }>('/auth/verify-account', { email, code }),
  resendVerification: (email: string) =>
    postJson<{ message: string }>('/auth/resend-verification', { email }),
};
