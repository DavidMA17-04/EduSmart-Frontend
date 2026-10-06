import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  clearAccessToken,
  sessionHasPermission,
  setSessionTokens,
} from '@/shared/auth';
import {
  adminNavigationItems,
  filterAdminNavigation,
  groupAdminNavigation,
  resolveRoleAudience,
} from './adminNavigation';

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

describe('resolveRoleAudience', () => {
  it('separa administrador, docente y estudiante', () => {
    expect(resolveRoleAudience(['Administrador'])).toBe('admin');
    expect(resolveRoleAudience(['Docente'])).toBe('teacher');
    expect(resolveRoleAudience(['Estudiante'])).toBe('student');
    expect(resolveRoleAudience(['Estudiante', 'Docente'])).toBe('teacher');
  });
});

describe('groupAdminNavigation', () => {
  it('agrupa asistencias bajo el enlace principal cuando el lead está visible', () => {
    const entries = groupAdminNavigation(
      adminNavigationItems.filter((item) => item.group === 'attendance'),
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: 'group',
      id: 'attendance',
      lead: { label: 'Asistencias', to: '/admin/attendance' },
    });
    if (entries[0]?.type !== 'group') return;
    expect(entries[0].children.map((child) => child.label)).toEqual([
      'Historial de asistencia',
      'Alertas de ausentismo',
      'Indicadores',
      'Justificaciones',
      'Ingresar código',
    ]);
  });

  it('deja sueltos los hijos si el lead no está visible', () => {
    const entries = groupAdminNavigation(
      adminNavigationItems.filter(
        (item) => item.group === 'attendance' && !item.groupLead,
      ),
    );
    expect(entries.every((entry) => entry.type === 'link')).toBe(true);
  });
});

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

  it('nav Materias apunta a /admin/subjects con academic_structure.view', () => {
    const item = adminNavigationItems.find((nav) => nav.to === '/admin/subjects');
    expect(item).toMatchObject({
      label: 'Materias',
      permission: 'academic_structure.view',
    });
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

  it('Estudiante ve Ingresar código (canje de token)', () => {
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
    expect(visible.some((nav) => nav.to === '/admin/attendance/redeem')).toBe(
      true,
    );
  });

  it('Estudiante no ve alertas, indicadores ni el panel administrativo', () => {
    setSessionTokens(
      encodeJwt({
        sub: 523,
        email: 'estudiante@edusmart.test',
        roles: ['Estudiante'],
        permissions: [
          'attendance.view',
          'attendance.view_own',
          'attendance.justify',
          'schedules.view_own',
        ],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    ).map((item) => item.to);
    expect(visible).not.toContain('/admin');
    expect(visible).not.toContain('/admin/attendance');
    expect(visible).not.toContain('/admin/attendance/alerts');
    expect(visible).not.toContain('/admin/attendance/reports');
    expect(visible).toContain('/admin/attendance/history');
    expect(visible).toContain('/admin/attendance/justifications');
    expect(visible).toContain('/admin/attendance/redeem');
    expect(visible).toContain('/admin/my-schedule');
    expect(visible).toContain('/admin/settings');
  });

  it('Docente NO ve Ingresar código en el menú', () => {
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
    expect(visible.some((nav) => nav.to === '/admin/attendance/redeem')).toBe(
      false,
    );
  });

  it('Admin NO ve Ingresar código en el menú', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['ADMIN'],
        permissions: ['attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/attendance/redeem')).toBe(
      false,
    );
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
