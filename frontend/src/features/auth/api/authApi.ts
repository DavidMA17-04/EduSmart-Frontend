import {
  clearAccessToken,
  getAccessToken,
  getRefreshToken,
  loginWithCredentials,
  refreshSessionTokens,
} from '@/shared/auth';
import { httpClient } from '@/shared/api';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

async function postJson<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json; charset=UTF-8' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
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

export type AuthSessionView = {
  id: number;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  current: boolean;
};

export const authApi = {
  login: (identifier: string, password: string, remember = false) =>
    loginWithCredentials(apiBaseUrl, identifier, password, remember),
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
  refresh: () => refreshSessionTokens(apiBaseUrl),
  verifyAccount: (email: string, code: string) =>
    postJson<{ message: string }>('/auth/verify-account', { email, code }),
  resendVerification: (email: string) =>
    postJson<{ message: string }>('/auth/resend-verification', { email }),
  forgotPassword: (email: string) =>
    postJson<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    postJson<{ message: string }>('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    postJson<{ message: string }>(
      '/auth/change-password',
      { currentPassword, newPassword },
      getAccessToken(),
    ),
  listSessions: async () => {
    const response = await httpClient<{ success: boolean; data: AuthSessionView[] }>('/auth/sessions');
    return response.data;
  },
  revokeSession: async (id: number) => {
    const response = await httpClient<{ success: boolean; data: { message: string } }>(
      `/auth/sessions/${id}`,
      { method: 'DELETE' },
    );
    return response.data;
  },
  logoutAll: async () => {
    const response = await httpClient<{ success: boolean; data: { message: string } }>(
      '/auth/logout-all',
      { method: 'POST' },
    );
    return response.data;
  },
  getRefreshToken,
};
