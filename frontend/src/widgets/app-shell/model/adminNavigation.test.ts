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
  studentHomePath,
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
    expect(resolveRoleAudience(['Encargado'])).toBe('guardian');
    expect(resolveRoleAudience(['Padre de familia'])).toBe('guardian');
    expect(resolveRoleAudience(['Orientador'])).toBe('staff');
    expect(resolveRoleAudience(['Director'])).toBe('staff');
    expect(resolveRoleAudience(['Director', 'Docente'])).toBe('staff');
    expect(resolveRoleAudience(['Encargado', 'Docente'])).toBe('teacher');
  });
});

describe('roleAudienceLabel', () => {
  it('distingue Dirección y Orientación del rótulo genérico Personal', async () => {
    const { roleAudienceLabel } = await import('../ui/roleAudience');
    expect(roleAudienceLabel('staff', ['Director'])).toBe('Dirección');
    expect(roleAudienceLabel('staff', ['Orientador'])).toBe('Orientación');
    expect(roleAudienceLabel('staff', [])).toBe('Personal');
    expect(roleAudienceLabel('teacher', ['Docente'])).toBe('Docente');
  });
});

describe('groupAdminNavigation', () => {
  it('emite módulos staff como links planos (sin hijos en el sidebar)', () => {
    const staff = adminNavigationItems.filter((item) => item.audience === 'staff');
    const entries = groupAdminNavigation(staff);
    expect(entries.every((entry) => entry.type === 'link')).toBe(true);
    expect(staff.some((item) => item.group)).toBe(false);
    expect(staff.some((item) => item.to === '/admin/communications/manage')).toBe(false);
    expect(staff.some((item) => item.to === '/admin/roles-permissions')).toBe(false);
    expect(staff.some((item) => item.to === '/admin/academic')).toBe(true);
    expect(staff.some((item) => item.to === '/admin/communications')).toBe(true);
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

  it('docente ve asistencia bajo /teacher', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['Docente'],
        permissions: ['attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.label === 'Dashboard' && nav.to === '/teacher')).toBe(
      true,
    );
    expect(visible.some((nav) => nav.to === '/teacher/attendance')).toBe(true);
    expect(visible.some((nav) => nav.to === '/admin/attendance')).toBe(false);
    expect(visible.some((nav) => nav.to === '/student/attendance/redeem')).toBe(
      false,
    );
  });

  it('encargado no ve canje ni ítems de gestión', () => {
    setSessionTokens(
      encodeJwt({
        sub: 9,
        email: 'encargado@ctphojancha.ed.cr',
        roles: ['Encargado'],
        permissions: [
          'disciplinary.view_own',
          'disciplinary.respond',
          'attendance.view_own',
        ],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    ).map((item) => item.to);
    expect(visible).not.toContain('/student/attendance/redeem');
    expect(visible).not.toContain('/admin/attendance/redeem');
    expect(visible).not.toContain('/admin/attendance');
    expect(visible).not.toContain('/admin/users');
    expect(visible).toContain('/guardian');
    expect(visible).toContain('/guardian/discipline/notifications');
    expect(visible).toContain('/guardian/discipline');
    expect(visible).toContain('/guardian/attendance');
    expect(visible).toContain('/guardian/settings');
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
    expect(visible.some((nav) => nav.to === '/teacher/attendance')).toBe(true);
  });
});

describe('adminNavigation — Estructura académica (hub plano)', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('sidebar solo expone el hub /admin/academic', () => {
    const item = adminNavigationItems.find((nav) => nav.to === '/admin/academic');
    expect(item).toMatchObject({
      label: 'Estructura académica',
      audience: 'staff',
    });
    expect(
      adminNavigationItems.some(
        (nav) =>
          nav.audience === 'staff' &&
          (nav.to === '/admin/subjects' ||
            nav.to === '/admin/teaching-assignments' ||
            nav.to === '/admin/schedule'),
      ),
    ).toBe(false);
  });

  it('oculta el hub sin permisos de mutación/horario', () => {
    setSessionTokens(
      encodeJwt({
        sub: 2,
        email: 'coord@ctphojancha.ed.cr',
        roles: ['COORDINATOR'],
        permissions: ['academic_structure.view', 'sections.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/academic')).toBe(false);
  });

  it('muestra el hub con academic_structure.edit', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['Administrador'],
        permissions: ['academic_structure.edit'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/academic')).toBe(true);
  });

  it('Docente con view_own de horario ve el hub académico (Mi horario vive dentro)', () => {
    setSessionTokens(
      encodeJwt({
        sub: 9,
        email: 'docente.discqa@edusmart.test',
        roles: ['Docente'],
        permissions: [
          'academic_structure.view',
          'periods.view',
          'sections.view',
          'specialties.view',
          'attendance.view',
          'disciplinary.create',
          'schedules.view_own',
        ],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
      ['Docente'],
    );
    expect(visible.some((nav) => nav.to === '/teacher/academic')).toBe(true);
    expect(visible.some((nav) => nav.to === '/teacher/attendance')).toBe(true);
    expect(visible.some((nav) => nav.to === '/teacher/subjects')).toBe(false);
  });
});

describe('adminNavigation — Horario / Mi horario (D2)', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('horario institucional ya no es ítem suelto del sidebar', () => {
    expect(adminNavigationItems.some((nav) => nav.to === '/admin/schedule')).toBe(false);
    expect(adminNavigationItems.some((nav) => nav.to === '/admin/my-schedule')).toBe(false);
  });

  it('6. Docente view_own sin view → ve hub académico vía schedules.view_own', () => {
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
    expect(visible.some((nav) => nav.to === '/teacher/academic')).toBe(true);
    expect(visible.some((nav) => nav.to === '/teacher/my-schedule')).toBe(false);
  });

  it('7. Docente NO ve rutas de horario sueltas en el sidebar', () => {
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
    expect(visible.some((nav) => nav.to === '/teacher/schedule')).toBe(false);
  });

  it('8. Admin ve el hub académico (horario vive dentro)', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['Administrador'],
        permissions: ['schedules.view', 'academic_structure.edit'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/academic')).toBe(true);
    expect(visible.some((nav) => nav.to === '/admin/schedule')).toBe(false);
  });

  it('9. Admin no ve Mi horario en el sidebar', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['Administrador'],
        permissions: ['schedules.view'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/admin/my-schedule')).toBe(false);
  });

  it('10. usuario sin view_own ni mutación académica → no ve hub académico', () => {
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
    expect(visible.some((nav) => nav.to === '/teacher/academic')).toBe(false);
  });

  it('Estudiante ve Mi horario aunque el JWT no traiga view_own', () => {
    setSessionTokens(
      encodeJwt({
        sub: 521,
        email: 'lvargas@edusmart.test',
        roles: ['Estudiante'],
        permissions: ['disciplinary.view_own'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/student/schedule')).toBe(true);
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
    expect(visible.some((nav) => nav.to === '/student/schedule')).toBe(true);
  });

  it('Estudiante con view_own y view sigue viendo Mi horario', () => {
    setSessionTokens(
      encodeJwt({
        sub: 521,
        email: 'smoke_pbi24.alumno@edusmart.test',
        roles: ['Estudiante'],
        permissions: ['schedules.view_own', 'schedules.view'],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    );
    expect(visible.some((nav) => nav.to === '/student/schedule')).toBe(true);
    expect(
      adminNavigationItems.find((nav) => nav.to === '/student/schedule')
        ?.hideWhenPermission,
    ).toBeUndefined();
  });

  it('Estudiante sin students.view ve horario, asistencia, conducta, canje y settings', () => {
    setSessionTokens(
      encodeJwt({
        sub: 88,
        email: 'solanoaaron853@gmail.com',
        roles: ['Estudiante'],
        permissions: [
          'attendance.view_own',
          'attendance.justify',
          'schedules.view_own',
          'communications.view',
          'appeals.create',
          'disciplinary.view_own',
        ],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    ).map((item) => item.to);
    expect(visible).toContain('/student/schedule');
    expect(visible).toContain('/student/attendance');
    expect(visible).toContain('/student/attendance/justifications');
    expect(visible).toContain('/student/attendance/redeem');
    expect(visible).toContain('/student/discipline');
    expect(visible).toContain('/student/settings');
    expect(visible).not.toContain('/admin/users');
    expect(visible.every((to) => !to.includes('/students'))).toBe(true);
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
    expect(visible.some((nav) => nav.to === '/student/attendance/redeem')).toBe(
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
    expect(visible).toContain('/student/attendance');
    expect(visible).toContain('/student/attendance/justifications');
    expect(visible).toContain('/student/attendance/redeem');
    expect(visible).toContain('/student/schedule');
    expect(visible).toContain('/student/settings');
  });

  it('guía QA: Estudiante sin attendance.view conserva historial, justificaciones y canje', () => {
    setSessionTokens(
      encodeJwt({
        sub: 521,
        email: 'smoke_pbi24.alumno@edusmart.test',
        roles: ['Estudiante'],
        permissions: [
          'schedules.view_own',
          'attendance.view_own',
          'attendance.justify',
        ],
      }),
    );
    const visible = filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
    ).map((item) => item.to);
    expect(visible).toContain('/student/attendance/redeem');
    expect(visible).toContain('/student/attendance');
    expect(visible).toContain('/student/attendance/justifications');
    expect(visible).not.toContain('/admin/attendance');
    expect(visible).not.toContain('/admin/attendance/alerts');
    expect(visible).not.toContain('/admin/attendance/reports');
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
    expect(visible.some((nav) => nav.to === '/student/attendance/redeem')).toBe(
      false,
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
    expect(visible.some((nav) => nav.to === '/student/attendance/redeem')).toBe(
      false,
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

  it('oculta hub académico sin schedules.view ni mutación', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['TEACHER'],
        permissions: ['attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/teacher/academic')).toBe(false);
  });

  it('muestra hub académico con schedules.view', () => {
    setSessionTokens(
      encodeJwt({
        sub: 1,
        email: 'admin@ctphojancha.ed.cr',
        roles: ['COORDINATOR'],
        permissions: ['schedules.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/academic')).toBe(true);
    expect(visible.some((nav) => nav.to === '/admin/schedule')).toBe(false);
  });
});

describe('adminNavigation — Disciplina', () => {
  afterEach(() => {
    clearAccessToken();
  });

  it('staff solo ve Disciplina como puerta única al módulo', () => {
    const item = adminNavigationItems.find((nav) => nav.to === '/admin/discipline');
    expect(item).toMatchObject({
      label: 'Disciplina',
      audience: 'staff',
      anyOfPermissions: [
        'disciplinary.view',
        'disciplinary.view_own',
        'disciplinary.create',
      ],
    });
    expect(item?.groupLead).toBeFalsy();
    const staffChildren = adminNavigationItems.filter(
      (nav) =>
        nav.audience === 'staff' &&
        nav.to.startsWith('/admin/discipline/') &&
        nav.to !== '/admin/discipline',
    );
    expect(staffChildren).toHaveLength(0);
  });

  it('sin hijos staff, Disciplina se emite como link plano', () => {
    const entries = groupAdminNavigation(
      adminNavigationItems.filter((item) => item.audience === 'staff' && item.to.includes('/discipline')),
    );
    expect(entries).toEqual([
      expect.objectContaining({
        type: 'link',
        item: expect.objectContaining({ label: 'Disciplina', to: '/admin/discipline' }),
      }),
    ]);
  });

  it('oculta Disciplina sin permisos disciplinarios', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['Docente'],
        permissions: ['attendance.view'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/teacher/discipline')).toBe(false);
  });

  it('muestra Disciplina a un docente solo con create', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['Docente'],
        permissions: ['disciplinary.create'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/teacher/discipline')).toBe(true);
    expect(visible.some((nav) => nav.to === '/teacher/discipline/register')).toBe(false);
  });

  it('muestra Disciplina a un docente con view_own y no expone hijas en el menú', () => {
    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['Docente'],
        permissions: ['disciplinary.view_own'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/teacher/discipline')).toBe(true);
    expect(visible.some((nav) => nav.to === '/teacher/discipline/cases')).toBe(false);
    expect(visible.some((nav) => nav.to === '/teacher/discipline/settings')).toBe(false);
  });

  it('muestra las notificaciones al encargado y oculta el menú de personal', () => {
    setSessionTokens(
      encodeJwt({
        sub: 9,
        email: 'encargado@ctphojancha.ed.cr',
        roles: ['Encargado'],
        permissions: ['disciplinary.view_own', 'disciplinary.respond'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.label === 'Inicio' && nav.to === '/guardian')).toBe(true);
    expect(visible.some((nav) => nav.to === '/guardian/discipline/notifications')).toBe(true);
    expect(visible.some((nav) => nav.label === 'Historial' && nav.to === '/guardian/discipline')).toBe(true);
    expect(visible.some((nav) => nav.to === '/admin/discipline')).toBe(false);
    expect(visible.some((nav) => nav.to === '/admin/discipline/cases')).toBe(false);

    setSessionTokens(
      encodeJwt({
        sub: 4,
        email: 'docente@ctphojancha.ed.cr',
        roles: ['Docente'],
        permissions: ['disciplinary.view_own', 'disciplinary.respond'],
      }),
    );
    const teacher = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(teacher.some((nav) => nav.to === '/guardian')).toBe(false);
    expect(teacher.some((nav) => nav.to === '/teacher/discipline/notifications')).toBe(false);
    expect(teacher.some((nav) => nav.to === '/teacher/discipline')).toBe(true);
    expect(teacher.some((nav) => nav.label === 'Historial')).toBe(false);
  });

  it('el estudiante ve su conducta y no la bandeja de personal', () => {
    setSessionTokens(
      encodeJwt({
        sub: 21,
        email: 'estudiante@ctphojancha.ed.cr',
        roles: ['Estudiante'],
        permissions: ['disciplinary.view_own', 'schedules.view_own'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.label === 'Mi conducta')).toBe(true);
    expect(visible.some((nav) => nav.to === '/student/discipline/appeals')).toBe(true);
    expect(visible.some((nav) => nav.to === '/student/discipline/cases')).toBe(false);
    expect(studentHomePath(sessionHasPermission)).toBe('/student');
    expect(visible.some((nav) => nav.to === '/student/discipline')).toBe(true);
  });

  it('Orientador y Director ven Disciplina y no hijas en el menú', () => {
    const prefixByRole: Record<string, string> = {
      Orientador: '/counselor',
      Director: '/director',
    };
    for (const role of ['Orientador', 'Director']) {
      setSessionTokens(
        encodeJwt({
          sub: 8,
          email: 'personal@ctphojancha.ed.cr',
          roles: [role],
          permissions: ['disciplinary.view', 'disciplinary.export'],
        }),
      );
      const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
      const prefix = prefixByRole[role];
      expect(visible.some((nav) => nav.label === 'Dashboard' && nav.to === prefix)).toBe(true);
      expect(visible.some((nav) => nav.to === `${prefix}/discipline`)).toBe(true);
      expect(visible.some((nav) => nav.to === `${prefix}/discipline/cases`)).toBe(false);
      expect(visible.some((nav) => nav.to === `${prefix}/discipline/register`)).toBe(false);
    }
  });

  it('el encargado no ve revisión ni reportes en el menú', () => {
    setSessionTokens(
      encodeJwt({
        sub: 9,
        email: 'encargado@ctphojancha.ed.cr',
        roles: ['Encargado'],
        permissions: ['disciplinary.view_own', 'disciplinary.respond'],
      }),
    );
    const visible = filterAdminNavigation(adminNavigationItems, sessionHasPermission);
    expect(visible.some((nav) => nav.to === '/admin/discipline/appeals/review')).toBe(false);
    expect(visible.some((nav) => nav.to === '/admin/discipline/appeals/reports')).toBe(false);
  });
});
