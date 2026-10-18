import { useAuthStore } from '@/features/auth';
import { getAccessToken, refreshSessionTokens } from '@/shared/auth';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Cuerpo JSON del error (p. ej. `rows[]` de importación masiva), si lo hay. */
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function buildHeaders(init: RequestInit, token: string | null): Headers {
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json; charset=UTF-8');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

async function parseError(response: Response): Promise<HttpError> {
  const payload = await response.json().catch(() => null) as {
    message?: string | string[];
  } | null;
  return new HttpError(
    response.status,
    errorMessageFrom(response.status, payload),
    payload ?? undefined,
  );
}

function errorMessageFrom(
  status: number,
  payload: { message?: string | string[] } | null,
): string {
  const rawMessage = payload?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage.filter(Boolean).join(' ')
    : rawMessage;

  if (status === 401) {
    if (
      message
      && message !== 'Unauthorized'
      && message !== 'Invalid credentials'
      && message !== 'Credenciales inválidas'
    ) {
      return message;
    }
    return message === 'Invalid credentials' || message === 'Credenciales inválidas'
      ? 'Credenciales inválidas.'
      : 'No autorizado. Inicie sesión para continuar.';
  }

  if (status === 403) {
    return message ?? 'Cuenta inactiva o bloqueada.';
  }

  if (status === 409 && message) {
    return message;
  }

  return message ?? 'No se pudo completar la solicitud.';
}

const PUBLIC_AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-account',
  '/auth/resend-verification',
]);

function isPublicAuthPath(path: string): boolean {
  return PUBLIC_AUTH_PATHS.has(path.split('?')[0] ?? path);
}

function redirectToLogin(): void {
  useAuthStore.getState().logout();
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export async function httpClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const requestOnce = async (token: string | null) => {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: buildHeaders(init, token),
    });
    return response;
  };

  let token = getAccessToken() ?? useAuthStore.getState().token;
  let response: Response;
  try {
    response = await requestOnce(token);
  } catch {
    throw new Error(`No se pudo conectar con la API en ${apiBaseUrl}. Verifique que el backend esté activo.`);
  }

  if (response.status === 401 && !isPublicAuthPath(path)) {
    const refreshed = await refreshSessionTokens(apiBaseUrl);
    if (refreshed) {
      useAuthStore.setState({ token: refreshed, isAuthenticated: true });
      response = await requestOnce(refreshed);
    }
  }

  if (response.status === 401 && !isPublicAuthPath(path)) {
    redirectToLogin();
    throw await parseError(response);
  }

  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
