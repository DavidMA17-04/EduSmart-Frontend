import { clearAccessToken, getAccessToken } from '@/shared/auth';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
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

async function parseErrorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as {
    message?: string | string[];
  } | null;

  const rawMessage = payload?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage.filter(Boolean).join(' ')
    : rawMessage;

  if (response.status === 401) {
    return message === 'Invalid credentials'
      ? 'Credenciales inválidas.'
      : 'No autorizado. Inicie sesión para continuar.';
  }

  if (response.status === 409 && message) {
    return message;
  }

  return message ?? 'No se pudo completar la solicitud.';
}

function redirectToLogin(): void {
  clearAccessToken();
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export async function httpClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: buildHeaders(init, token),
    });
  } catch {
    throw new Error(`No se pudo conectar con la API en ${apiBaseUrl}. Verifique que el backend esté activo.`);
  }

  if (response.status === 401 && !path.startsWith('/auth/')) {
    redirectToLogin();
    throw new HttpError(response.status, await parseErrorMessage(response));
  }

  if (!response.ok) {
    throw new HttpError(response.status, await parseErrorMessage(response));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
