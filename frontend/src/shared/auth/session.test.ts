import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { clearAccessToken, getSessionUser, sessionHasPermission, setSessionTokens } from './session';

if (typeof globalThis.atob !== 'function') {
  globalThis.atob = (value: string) => Buffer.from(value, 'base64').toString('binary');
}

function memoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: memoryStorage(), configurable: true });
});

function encodeJwt(payload: Record<string, unknown>): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`;
}

describe('session', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('decodes permissions and mustChangePassword from the access token', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['sections.view'],
        mustChangePassword: true,
      }),
    );

    expect(getSessionUser()).toEqual({
      id: 4,
      email: 'docente@ctphojancha.ed.cr',
      roles: ['TEACHER'],
      permissions: ['sections.view'],
      mustChangePassword: true,
    });
    expect(sessionHasPermission('sections.view')).toBe(true);
    expect(sessionHasPermission('administrator.view')).toBe(false);
  });

  it('grants every permission to the institutional administrator role', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['ADMIN'],
        permissions: [],
      }),
    );

    expect(sessionHasPermission('roles_permissions.view')).toBe(true);
  });
});
