const ACCESS_TOKEN_KEY = 'edusmart.accessToken';
const REFRESH_TOKEN_KEY = 'edusmart.refreshToken';
const SESSION_USER_KEY = 'edusmart.sessionUser';
const REMEMBER_IDENTIFIER_KEY = 'edusmart.rememberIdentifier';
const REMEMBER_ME_PREFERENCE_KEY = 'edusmart.rememberMePreference';

type LoginEnvelope = {
  success?: boolean;
  message?: string | string[];
  data?: {
    accessToken?: string;
    refreshToken?: string;
    reason?: string;
    user?: Partial<AuthUser> & {
      id?: number;
      email?: string;
      roles?: string[];
      mustChangePassword?: boolean;
    };
  } | null;
};

export type AuthUser = {
  id: number;
  email: string;
  national_id: string;
  name: string;
  first_lastname: string;
  roles: string[];
  mustChangePassword: boolean;
};

/** @deprecated Prefer AuthUser; kept for callers that only need email/roles */
export type SessionUser = {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
};

export type LoginResult = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

/** Stable reason codes from login error envelope `data.reason` (backend). */
export const AUTH_LOGIN_REASON = {
  ACCOUNT_PENDING: 'ACCOUNT_PENDING',
} as const;

export class AuthLoginError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly reason: string | null = null,
  ) {
    super(message);
    this.name = 'AuthLoginError';
  }
}

function storageGet(key: string): string | null {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

function clearKey(key: string): void {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

function tokenStore(persistent: boolean): Storage {
  return persistent ? localStorage : sessionStorage;
}

function isPersistentSession(): boolean {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY));
}

export function getAccessToken(): string | null {
  return storageGet(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token: string, persistent = false): void {
  clearKey(ACCESS_TOKEN_KEY);
  tokenStore(persistent).setItem(ACCESS_TOKEN_KEY, token);
}

export function setRefreshToken(token: string, persistent = false): void {
  clearKey(REFRESH_TOKEN_KEY);
  tokenStore(persistent).setItem(REFRESH_TOKEN_KEY, token);
}

export function setSessionTokens(
  accessToken: string,
  refreshToken?: string,
  persistent = isPersistentSession(),
): void {
  setAccessToken(accessToken, persistent);
  clearKey(REFRESH_TOKEN_KEY);
  if (refreshToken) {
    tokenStore(persistent).setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAccessToken(): void {
  clearKey(ACCESS_TOKEN_KEY);
  clearKey(REFRESH_TOKEN_KEY);
  clearKey(SESSION_USER_KEY);
}

export function setRememberedIdentifier(identifier: string): void {
  localStorage.setItem(REMEMBER_IDENTIFIER_KEY, identifier.trim());
  localStorage.setItem(REMEMBER_ME_PREFERENCE_KEY, 'true');
}

export function clearRememberedIdentifier(): void {
  localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
  localStorage.removeItem(REMEMBER_ME_PREFERENCE_KEY);
}

export function getRememberedIdentifier(): string | null {
  const value = localStorage.getItem(REMEMBER_IDENTIFIER_KEY);
  if (!value || !value.trim()) return null;
  return value.trim();
}

export function getRememberMePreference(): boolean {
  return localStorage.getItem(REMEMBER_ME_PREFERENCE_KEY) === 'true';
}

export function persistRememberPreference(identifier: string, rememberMe: boolean): void {
  if (rememberMe) {
    setRememberedIdentifier(identifier);
    return;
  }
  clearRememberedIdentifier();
}

export function setStoredSessionUser(user: AuthUser, persistent = false): void {
  clearKey(SESSION_USER_KEY);
  tokenStore(persistent).setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function getStoredSessionUser(): AuthUser | null {
  const raw = storageGet(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || typeof parsed.id !== 'number' || typeof parsed.email !== 'string') {
      return null;
    }
    return {
      id: parsed.id,
      email: parsed.email,
      national_id: parsed.national_id ?? '',
      name: parsed.name ?? '',
      first_lastname: parsed.first_lastname ?? '',
      roles: Array.isArray(parsed.roles) ? parsed.roles.map(String) : [],
      mustChangePassword: Boolean(parsed.mustChangePassword),
    };
  } catch {
    return null;
  }
}

function mapAuthUser(raw: NonNullable<LoginEnvelope['data']>['user']): AuthUser | null {
  if (!raw || typeof raw.id !== 'number' || typeof raw.email !== 'string') {
    return null;
  }
  return {
    id: raw.id,
    email: raw.email,
    national_id: typeof raw.national_id === 'string' ? raw.national_id : '',
    name: typeof raw.name === 'string' ? raw.name : '',
    first_lastname: typeof raw.first_lastname === 'string' ? raw.first_lastname : '',
    roles: Array.isArray(raw.roles) ? raw.roles.map(String) : [],
    mustChangePassword: Boolean(raw.mustChangePassword),
  };
}

function messageFromEnvelope(payload: LoginEnvelope | null, fallback: string): string {
  const raw = payload?.message;
  if (Array.isArray(raw)) {
    const joined = raw.filter(Boolean).join(' ');
    return joined || fallback;
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw;
  }
  return fallback;
}

export async function loginWithCredentials(
  apiBaseUrl: string,
  identifier: string,
  password: string,
  rememberMe = false,
): Promise<LoginResult> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      identifier: identifier.trim(),
      password,
      rememberMe,
    }),
  });

  const payload = (await response.json().catch(() => null)) as LoginEnvelope | null;

  if (!response.ok) {
    const reason =
      payload?.data && typeof payload.data === 'object' && typeof payload.data.reason === 'string'
        ? payload.data.reason
        : null;

    if (response.status === 401) {
      throw new AuthLoginError(
        401,
        messageFromEnvelope(payload, 'Credenciales inválidas.'),
        reason,
      );
    }
    if (response.status === 403) {
      throw new AuthLoginError(
        403,
        messageFromEnvelope(payload, 'Cuenta inactiva o bloqueada.'),
        reason,
      );
    }
    throw new AuthLoginError(
      response.status,
      messageFromEnvelope(payload, 'No se pudo iniciar sesión.'),
      reason,
    );
  }

  const token = payload?.data?.accessToken;
  const user = mapAuthUser(payload?.data?.user);
  if (!token || !user) {
    throw new AuthLoginError(500, 'No se recibió el token de acceso.');
  }

  return {
    accessToken: token,
    refreshToken: payload?.data?.refreshToken,
    user,
  };
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
  const payload = token ? decodeJwtPayload(token) : null;
  const stored = getStoredSessionUser();

  if (payload && typeof payload.email === 'string') {
    return {
      id: Number(payload.sub),
      email: payload.email,
      roles: Array.isArray(payload.roles) ? payload.roles.map(String) : (stored?.roles ?? []),
      permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : [],
      mustChangePassword: Boolean(payload.mustChangePassword ?? stored?.mustChangePassword),
    };
  }

  if (stored) {
    return {
      id: stored.id,
      email: stored.email,
      roles: stored.roles,
      permissions: [],
      mustChangePassword: stored.mustChangePassword,
    };
  }

  return null;
}

export function sessionHasPermission(code: string): boolean {
  const user = getSessionUser();
  if (!user) return false;
  if (user.roles.includes('ADMIN') || user.roles.some((role) => role.toLowerCase() === 'administrador')) {
    return true;
  }
  return user.permissions.includes(code);
}
