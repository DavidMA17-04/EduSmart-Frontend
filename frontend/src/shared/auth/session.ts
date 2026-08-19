const ACCESS_TOKEN_KEY = 'edusmart.accessToken';

type LoginEnvelope = {
  success?: boolean;
  data?: { accessToken?: string };
};

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function loginWithDevCredentials(apiBaseUrl: string): Promise<string | null> {
  const email = import.meta.env.VITE_DEV_AUTH_EMAIL;
  const password = import.meta.env.VITE_DEV_AUTH_PASSWORD;
  if (!email || !password) return null;

  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as LoginEnvelope;
  const token = payload.data?.accessToken;
  if (!token) return null;
  setAccessToken(token);
  return token;
}

export async function ensureAccessToken(apiBaseUrl: string): Promise<string | null> {
  return getAccessToken() ?? loginWithDevCredentials(apiBaseUrl);
}
