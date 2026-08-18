import { clearAccessToken, ensureAccessToken, loginWithDevCredentials } from '@/shared/auth';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

function buildHeaders(init: RequestInit, token: string | null): Headers {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=UTF-8');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  if (response.status === 401) {
    return payload?.message === 'Invalid credentials'
      ? 'Credenciales inválidas. Verifique el usuario de desarrollo.'
      : 'No autorizado. El backend requiere inicio de sesión.';
  }
  return payload?.message ?? 'No se pudo completar la solicitud.';
}

export async function httpClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token: string | null;
  try {
    token = await ensureAccessToken(apiBaseUrl);
  } catch {
    throw new Error(`No se pudo conectar con la API en ${apiBaseUrl}. Verifique que el backend esté activo.`);
  }

  const execute = (accessToken: string | null) => fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: buildHeaders(init, accessToken),
  });

  let response: Response;
  try {
    response = await execute(token);
    if (response.status === 401 && !path.startsWith('/auth/')) {
      clearAccessToken();
      token = await loginWithDevCredentials(apiBaseUrl);
      if (token) response = await execute(token);
    }
  } catch {
    throw new Error(`No se pudo conectar con la API en ${apiBaseUrl}. Verifique que el backend esté activo.`);
  }

  if (!response.ok) {
    throw new HttpError(response.status, await parseErrorMessage(response));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
