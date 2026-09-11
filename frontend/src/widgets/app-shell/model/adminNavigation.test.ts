import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  clearAccessToken,
  sessionHasPermission,
  setSessionTokens,
} from '@/shared/auth';
import { adminNavigationItems, filterAdminNavigation } from './adminNavigation';

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

describe('adminNavigation — Asistencias', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('1. nav Asistencias requiere attendance.view', () => {
    const item = adminNavigationItems.find((nav) => nav.to === '/admin/attendance');
    expect(item).toMatchObject({
      label: 'Asistencias',
      permission: 'attendance.view',
    });
  });

  it('oculta Asistencias sin attendance.view', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['sections.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/attendance')).toBe(false);
  });

  it('muestra Asistencias con attendance.view', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/attendance')).toBe(true);
  });
});

describe('adminNavigation — Asignaciones académicas', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('nav requiere academic_structure.view', () => {
    const item = adminNavigationItems.find(
      (nav) => nav.to === '/admin/teaching-assignments',
    );
    expect(item).toMatchObject({
      label: 'Asignaciones académicas',
      permission: 'academic_structure.view',
    });
  });

  it('oculta sin academic_structure.view', () => {
    setSessionTokens(
      encodeJwt({
        sub: 2,
        email: 'coord@ctphojancha.ed.cr',
        roles: ['COORDINATOR'],
        permissions: ['sections.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/teaching-assignments')).toBe(
      false,
    );
  });

  it('muestra con academic_structure.view', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['ADMIN'],
        permissions: ['academic_structure.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/teaching-assignments')).toBe(
      true,
    );
  });
});

describe('adminNavigation — Horario / Mi horario (D2)', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('nav requiere schedules.view', () => {
    const item = adminNavigationItems.find((nav) => nav.to === '/admin/schedule');
    expect(item).toMatchObject({
      label: 'Horario',
      permission: 'schedules.view',
    });
  });

  it('nav Mi horario requiere view_own y hideWhen view', () => {
    const item = adminNavigationItems.find(
      (nav) => nav.to === '/admin/my-schedule',
    );
    expect(item).toMatchObject({
      label: 'Mi horario',
      permission: 'schedules.view_own',
      hideWhenPermission: 'schedules.view',
    });
  });

  it('6. Docente view_own sin view → ve Mi horario', () => {
    setSessionTokens(
      encodeJwt({
        sub: 520,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['schedules.view_own', 'attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/my-schedule')).toBe(true);
  });

  it('7. Docente NO ve Horario admin', () => {
    setSessionTokens(
      encodeJwt({
        sub: 520,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['schedules.view_own', 'attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/schedule')).toBe(false);
  });

  it('8. Admin con bypass/view → ve Horario', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['ADMIN'],
        permissions: [],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/schedule')).toBe(true);
  });

  it('9. Admin NO ve Mi horario en navegación', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['ADMIN'],
        permissions: [],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/my-schedule')).toBe(false);
  });

  it('10. usuario sin view_own → no ve Mi horario', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/my-schedule')).toBe(false);
  });

  it('E2. Estudiante view_own sin view → ve Mi horario', () => {
    setSessionTokens(
      encodeJwt({
        sub: 521,
        email: 'smoke_pbi24.alumno@edusmart.test',
        roles: ['Estudiante'],
        permissions: ['schedules.view_own'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/my-schedule')).toBe(true);
  });

  it('E2. Estudiante NO ve Horario administrativo', () => {
    setSessionTokens(
      encodeJwt({
        sub: 521,
        email: 'smoke_pbi24.alumno@edusmart.test',
        roles: ['Estudiante'],
        permissions: ['schedules.view_own'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/schedule')).toBe(false);
  });

  it('oculta Horario sin schedules.view', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/schedule')).toBe(false);
  });

  it('muestra Horario con schedules.view', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['COORDINATOR'],
        permissions: ['schedules.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/schedule')).toBe(true);
  });
});
