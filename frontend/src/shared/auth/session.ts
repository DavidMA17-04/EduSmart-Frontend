const ACCESS_TOKEN_KEY = 'edusmart.accessToken';
const REFRESH_TOKEN_KEY = 'edusmart.refreshToken';

type LoginEnvelope = {
  success?: boolean;
  message?: string;
  data?: { accessToken?: string; refreshToken?: string; mustChangePassword?: boolean };
};

export type SessionUser = {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
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

function tokenStore(persistent: boolean): Storage {
  return persistent ? localStorage : sessionStorage;
}

function isPersistentSession(): boolean {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY));
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token: string, persistent = false): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  tokenStore(persistent).setItem(ACCESS_TOKEN_KEY, token);
}

export function setSessionTokens(
  accessToken: string,
  refreshToken?: string,
  persistent = isPersistentSession(),
): void {
  setAccessToken(accessToken, persistent);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  if (refreshToken) {
    tokenStore(persistent).setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
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

  const payload = (await response.json().catch(() => null)) as LoginEnvelope | null;

  if (!response.ok) {
    const apiMessage = payload?.message;
    const fallback =
      response.status === 401 ? 'Credenciales inválidas.' : 'No se pudo iniciar sesión.';
    throw new AuthLoginError(response.status, apiMessage || fallback);
  }

  const token = payload?.data?.accessToken;
  if (!token) {
    throw new AuthLoginError(500, 'No se recibió el token de acceso.');
  }

  setSessionTokens(token, payload?.data?.refreshToken, persistent);
  return token;
}

export async function refreshSessionTokens(apiBaseUrl: string): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as LoginEnvelope | null;
  const accessToken = payload?.data?.accessToken;
  if (!accessToken) return null;
  setSessionTokens(accessToken, payload?.data?.refreshToken ?? refreshToken);
  return accessToken;
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
    permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : [],
    mustChangePassword: Boolean(payload.mustChangePassword),
  };
}

export function sessionHasPermission(code: string): boolean {
  const user = getSessionUser();
  if (!user) return false;
  if (user.roles.includes('ADMIN') || user.roles.some((role) => role.toLowerCase() === 'administrador')) {
    return true;
  }
  return user.permissions.includes(code);
}
