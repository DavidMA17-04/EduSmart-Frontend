import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  clearAccessToken,
  sessionHasPermission,
  setSessionTokens,
} from '@/shared/auth';
import {
  ATTENDANCE_HOME_PATH,
  ATTENDANCE_NEW_PATH,
  ATTENDANCE_PERMISSIONS,
  ATTENDANCE_ROUTE_GUARDS,
  canCreateAttendanceClass,
  parseAttendanceSessionId,
} from './attendanceRouting';

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
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: memoryStorage(),
    configurable: true,
  });
});

function encodeJwt(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`;
}

describe('attendanceRouting — route guards', () => {
  it('2. /admin/attendance está protegida por attendance.view', () => {
    const guard = ATTENDANCE_ROUTE_GUARDS.find((r) => r.path === ATTENDANCE_HOME_PATH);
    expect(guard?.permission).toBe(ATTENDANCE_PERMISSIONS.view);
  });

  it('3. /admin/attendance/new requiere attendance.create', () => {
    const guard = ATTENDANCE_ROUTE_GUARDS.find((r) => r.path === ATTENDANCE_NEW_PATH);
    expect(guard?.permission).toBe(ATTENDANCE_PERMISSIONS.create);
  });

  it('4. /admin/attendance/sessions/:id requiere attendance.view', () => {
    const guard = ATTENDANCE_ROUTE_GUARDS.find(
      (r) => r.path === '/admin/attendance/sessions/:sessionId',
    );
    expect(guard?.permission).toBe(ATTENDANCE_PERMISSIONS.view);
  });
});

describe('attendanceRouting — CTA Nueva clase', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('5. CTA Nueva clase visible con attendance.create', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['attendance.view', 'attendance.create'],
      }),
    );
    expect(canCreateAttendanceClass(sessionHasPermission)).toBe(true);
  });

  it('6. CTA oculto sin attendance.create', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['attendance.view'],
      }),
    );
    expect(canCreateAttendanceClass(sessionHasPermission)).toBe(false);
  });

  it('7. CTA navega a /admin/attendance/new', () => {
    expect(ATTENDANCE_NEW_PATH).toBe('/admin/attendance/new');
  });
});

describe('attendanceRouting — sessionId param', () => {
  it('8. Session page lee sessionId del route param', () => {
    expect(parseAttendanceSessionId('7')).toBe(7);
    expect(parseAttendanceSessionId('0')).toBeNull();
    expect(parseAttendanceSessionId('-1')).toBeNull();
    expect(parseAttendanceSessionId('abc')).toBeNull();
    expect(parseAttendanceSessionId(undefined)).toBeNull();
  });
});
