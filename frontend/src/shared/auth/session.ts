const ACCESS_TOKEN_KEY = 'edusmart.accessToken';
const REFRESH_TOKEN_KEY = 'edusmart.refreshToken';

type LoginEnvelope = {
  success?: boolean;
  data?: { accessToken?: string; refreshToken?: string };
};

export type SessionUser = {
  id: number;
  email: string;
  roles: string[];
};

export class AuthLoginError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuthLoginError';
  }
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string, persistent = false): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  const store = persistent ? localStorage : sessionStorage;
  store.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function loginWithCredentials(
  apiBaseUrl: string,
  email: string,
  password: string,
  persistent = false,
): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (!response.ok) {
    throw new AuthLoginError(
      response.status,
      response.status === 401 ? 'Credenciales inválidas.' : 'No se pudo iniciar sesión.',
    );
  }

  const payload = (await response.json()) as LoginEnvelope;
  const token = payload.data?.accessToken;
  if (!token) {
    throw new AuthLoginError(500, 'No se recibió el token de acceso.');
  }

  setAccessToken(token, persistent);
  if (payload.data?.refreshToken) {
    const store = persistent ? localStorage : sessionStorage;
    store.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);
  }
  return token;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getSessionUser(): SessionUser | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.email !== 'string') return null;

  return {
    id: Number(payload.sub),
    email: payload.email,
    roles: Array.isArray(payload.roles) ? payload.roles.map(String) : [],
  };
}
