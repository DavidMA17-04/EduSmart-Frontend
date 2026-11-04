import { describe, expect, it } from 'vitest';
import {
  coerceReturnPath,
  destinationForSession,
  houseHome,
  housePrefix,
  isAllowedInHouse,
  isForcedPasswordPathAllowed,
  mapLegacyPath,
  resolveHouse,
  resolveTerritoryNavigation,
  settingsPath,
} from './territory';

describe('resolveHouse', () => {
  it('resuelve las seis casas y el alias Padre de familia', () => {
    expect(resolveHouse(['Administrador'])).toBe('admin');
    expect(resolveHouse(['ADMIN'])).toBe('admin');
    expect(resolveHouse(['Director'])).toBe('director');
    expect(resolveHouse(['Orientador'])).toBe('counselor');
    expect(resolveHouse(['COUNSELOR'])).toBe('counselor');
    expect(resolveHouse(['Docente'])).toBe('teacher');
    expect(resolveHouse(['TEACHER'])).toBe('teacher');
    expect(resolveHouse(['Encargado'])).toBe('guardian');
    expect(resolveHouse(['Padre de familia'])).toBe('guardian');
    expect(resolveHouse(['GUARDIAN'])).toBe('guardian');
    expect(resolveHouse(['Estudiante'])).toBe('student');
    expect(resolveHouse(['STUDENT'])).toBe('student');
  });

  it('aplica prioridad Admin > Director > Orientador > Docente > Encargado > Estudiante', () => {
    expect(resolveHouse(['Estudiante', 'Docente'])).toBe('teacher');
    expect(resolveHouse(['Encargado', 'Docente'])).toBe('teacher');
    expect(resolveHouse(['Director', 'Docente'])).toBe('director');
    expect(resolveHouse(['Orientador', 'Administrador'])).toBe('admin');
    expect(resolveHouse(['Estudiante', 'Encargado'])).toBe('guardian');
  });

  it('JWT ADMIN y Administrador equivalen; desconocido es null', () => {
    expect(resolveHouse(['ADMIN'])).toBe(resolveHouse(['Administrador']));
    expect(resolveHouse(['COORDINATOR'])).toBeNull();
    expect(resolveHouse(['Desconocido'])).toBeNull();
    expect(resolveHouse([])).toBeNull();
    expect(resolveHouse(undefined)).toBeNull();
  });
});

describe('housePrefix / houseHome Fase 2', () => {
  it('separa prefijos de personal; Administrador sigue en /admin', () => {
    expect(housePrefix('admin')).toBe('/admin');
    expect(houseHome('admin')).toBe('/admin');
    expect(housePrefix('teacher')).toBe('/teacher');
    expect(houseHome('teacher')).toBe('/teacher');
    expect(housePrefix('counselor')).toBe('/counselor');
    expect(houseHome('counselor')).toBe('/counselor');
    expect(housePrefix('director')).toBe('/director');
    expect(houseHome('director')).toBe('/director');
  });

  it('alumno y encargado tienen casa propia', () => {
    expect(housePrefix('student')).toBe('/student');
    expect(houseHome('student')).toBe('/student');
    expect(housePrefix('guardian')).toBe('/guardian');
    expect(houseHome('guardian')).toBe('/guardian');
  });
});

describe('destinationForSession', () => {
  it('sin sesión o casa null → /login; nunca default /admin', () => {
    expect(destinationForSession(null)).toBe('/login');
    expect(destinationForSession(undefined)).toBe('/login');
    expect(destinationForSession({ roles: [] })).toBe('/login');
    expect(destinationForSession({ roles: ['COORDINATOR'] })).toBe('/login');
    expect(destinationForSession({ roles: ['Desconocido'] })).not.toBe('/admin');
  });

  it('alumno no cae en /admin; personal va a su casa Fase 2', () => {
    expect(destinationForSession({ roles: ['Estudiante'] })).toBe('/student');
    expect(destinationForSession({ roles: ['STUDENT'] })).toBe('/student');
    expect(destinationForSession({ roles: ['Encargado'] })).toBe('/guardian');
    expect(destinationForSession({ roles: ['Padre de familia'] })).toBe('/guardian');
    expect(destinationForSession({ roles: ['Docente'] })).toBe('/teacher');
    expect(destinationForSession({ roles: ['TEACHER'] })).toBe('/teacher');
    expect(destinationForSession({ roles: ['Orientador'] })).toBe('/counselor');
    expect(destinationForSession({ roles: ['Director'] })).toBe('/director');
    expect(destinationForSession({ roles: ['Administrador'] })).toBe('/admin');
    expect(destinationForSession({ roles: ['ADMIN'] })).toBe('/admin');
  });

  it('mustChangePassword → settings de esa casa', () => {
    expect(
      destinationForSession({ roles: ['Estudiante'], mustChangePassword: true }),
    ).toBe('/student/settings');
    expect(
      destinationForSession({ roles: ['Encargado'], mustChangePassword: true }),
    ).toBe('/guardian/settings');
    expect(
      destinationForSession({ roles: ['Docente'], mustChangePassword: true }),
    ).toBe('/teacher/settings');
    expect(
      destinationForSession({ roles: ['Encargado'], mustChangePassword: true }),
    ).not.toBe('/admin/settings');
  });
});

describe('coerceReturnPath / from ajeno', () => {
  it('ignora state.from / ?from= de otra casa', () => {
    expect(coerceReturnPath({ roles: ['Estudiante'] }, '/admin/users')).toBe(
      '/student',
    );
    expect(coerceReturnPath({ roles: ['Encargado'] }, '/admin/discipline')).toBe(
      '/guardian',
    );
    expect(
      coerceReturnPath({ roles: ['Docente'] }, '/student/attendance/redeem'),
    ).toBe('/teacher');
  });

  it('honra from de la misma casa', () => {
    expect(
      coerceReturnPath({ roles: ['Estudiante'] }, '/student/attendance'),
    ).toBe('/student/attendance');
    expect(coerceReturnPath({ roles: ['ADMIN'] }, '/admin/users')).toBe(
      '/admin/users',
    );
  });
});

describe('isAllowedInHouse / settings bridge', () => {
  it('un alumno no está permitido en /admin', () => {
    expect(isAllowedInHouse('student', '/admin/users')).toBe(false);
    expect(isAllowedInHouse('student', '/student/attendance')).toBe(true);
    expect(isAllowedInHouse('teacher', '/teacher/attendance')).toBe(true);
    expect(isAllowedInHouse('teacher', '/admin/attendance')).toBe(false);
    expect(isAllowedInHouse('admin', '/student')).toBe(false);
  });

  it('cambio forzado solo cubre settings/profile de esa casa', () => {
    expect(isForcedPasswordPathAllowed('/student/settings', 'student')).toBe(
      true,
    );
    expect(isForcedPasswordPathAllowed('/student/profile', 'student')).toBe(
      true,
    );
    expect(isForcedPasswordPathAllowed('/admin/settings', 'student')).toBe(
      false,
    );
    expect(isForcedPasswordPathAllowed('/guardian/settings', 'guardian')).toBe(
      true,
    );
    expect(settingsPath('teacher')).toBe('/teacher/settings');
  });
});

describe('mapLegacyPath', () => {
  it('mapea bookmarks de alumno y no aliasa rectoría', () => {
    expect(mapLegacyPath('/admin/attendance/redeem', 'student')).toBe(
      '/student/attendance/redeem',
    );
    expect(mapLegacyPath('/admin/attendance/history', 'student')).toBe(
      '/student/attendance',
    );
    expect(mapLegacyPath('/admin/my-schedule', 'student')).toBe(
      '/student/schedule',
    );
    expect(mapLegacyPath('/admin/users', 'student')).toBe('/student');
  });

  it('mapea notificaciones de encargado a su bandeja', () => {
    expect(mapLegacyPath('/admin/discipline/notifications', 'guardian')).toBe(
      '/guardian/discipline/notifications',
    );
  });
});

describe('resolveTerritoryNavigation (TerritoryGuard)', () => {
  it('alumno en /admin/users → /student sin logout', () => {
    expect(resolveTerritoryNavigation('/admin/users', ['Estudiante'])).toBe(
      '/student',
    );
  });

  it('encargado en gestión → /guardian', () => {
    expect(resolveTerritoryNavigation('/admin/users', ['Encargado'])).toBe(
      '/guardian',
    );
    expect(
      resolveTerritoryNavigation('/admin/attendance', ['Padre de familia']),
    ).toBe('/guardian');
  });

  it('docente en /student/attendance/redeem → /teacher', () => {
    expect(
      resolveTerritoryNavigation('/student/attendance/redeem', ['Docente']),
    ).toBe('/teacher');
    expect(
      resolveTerritoryNavigation('/student/attendance/redeem', ['TEACHER']),
    ).toBe('/teacher');
  });

  it('Admin no impersona /student ni /guardian', () => {
    expect(resolveTerritoryNavigation('/student', ['Administrador'])).toBe(
      '/admin',
    );
    expect(resolveTerritoryNavigation('/guardian', ['ADMIN'])).toBe('/admin');
    expect(
      resolveTerritoryNavigation('/student/attendance/redeem', ['Administrador']),
    ).toBe('/admin');
  });

  it('bookmark de canje: alumno → canje nuevo; resto → su home', () => {
    expect(
      resolveTerritoryNavigation('/admin/attendance/redeem', ['Estudiante']),
    ).toBe('/student/attendance/redeem');
    expect(
      resolveTerritoryNavigation('/admin/attendance/redeem', ['Docente']),
    ).toBe('/teacher');
    expect(
      resolveTerritoryNavigation('/admin/attendance/redeem', ['Encargado']),
    ).toBe('/guardian');
    expect(
      resolveTerritoryNavigation('/admin/attendance/redeem', ['Administrador']),
    ).toBe('/admin');
  });

  it('/student/attendance no aliasa rectoría; el alumno se queda', () => {
    expect(
      resolveTerritoryNavigation('/student/attendance', ['Estudiante']),
    ).toBeNull();
    expect(
      resolveTerritoryNavigation('/student/attendance', ['Estudiante']),
    ).not.toBe('/admin/attendance/history');
  });

  it('Fase 2: docente /admin/attendance → /teacher/attendance', () => {
    expect(resolveTerritoryNavigation('/admin/attendance', ['Docente'])).toBe(
      '/teacher/attendance',
    );
    expect(
      resolveTerritoryNavigation('/admin/attendance/new', ['TEACHER']),
    ).toBe('/teacher/attendance/new');
  });

  it('Fase 2: orientador y director redirigen disciplina a su prefijo', () => {
    expect(resolveTerritoryNavigation('/admin/discipline', ['Orientador'])).toBe(
      '/counselor/discipline',
    );
    expect(
      resolveTerritoryNavigation('/admin/discipline/dashboard', ['Director']),
    ).toBe('/director/discipline/dashboard');
  });

  it('Fase 2: Admin no impersona /teacher /counselor /director', () => {
    expect(resolveTerritoryNavigation('/teacher', ['Administrador'])).toBe(
      '/admin',
    );
    expect(resolveTerritoryNavigation('/teacher/attendance', ['ADMIN'])).toBe(
      '/admin',
    );
    expect(resolveTerritoryNavigation('/counselor', ['Administrador'])).toBe(
      '/admin',
    );
    expect(resolveTerritoryNavigation('/director/discipline', ['ADMIN'])).toBe(
      '/admin',
    );
  });

  it('Fase 2: docente se queda en /teacher y en asistencia', () => {
    expect(resolveTerritoryNavigation('/teacher', ['Docente'])).toBeNull();
    expect(
      resolveTerritoryNavigation('/teacher/attendance', ['Docente']),
    ).toBeNull();
  });

  it('rol desconocido → /login, nunca /admin', () => {
    expect(resolveTerritoryNavigation('/admin', ['COORDINATOR'])).toBe(
      '/login',
    );
    expect(resolveTerritoryNavigation('/admin/users', ['???'])).toBe('/login');
  });
});
