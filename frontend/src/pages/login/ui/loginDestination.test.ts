import { describe, expect, it } from 'vitest';
import {
  coerceReturnPath,
  destinationForSession,
} from '@/widgets/app-shell/model/territory';

describe('login / RootRedirect destination', () => {
  it('sesión activa en /login va al home del rol', () => {
    expect(destinationForSession({ roles: ['Estudiante'] })).toBe('/student');
    expect(destinationForSession({ roles: ['Encargado'] })).toBe('/guardian');
    expect(destinationForSession({ roles: ['Docente'] })).toBe('/teacher');
    expect(destinationForSession({ roles: ['Orientador'] })).toBe('/counselor');
    expect(destinationForSession({ roles: ['Director'] })).toBe('/director');
    expect(destinationForSession({ roles: ['Administrador'] })).toBe('/admin');
  });

  it('mustChangePassword de encargado no usa /admin/settings', () => {
    expect(
      destinationForSession({
        roles: ['Encargado'],
        mustChangePassword: true,
      }),
    ).toBe('/guardian/settings');
    expect(
      destinationForSession({
        roles: ['Padre de familia'],
        mustChangePassword: true,
      }),
    ).not.toBe('/admin/settings');
  });

  it('rol desconocido en /login → /login, nunca /admin', () => {
    expect(destinationForSession({ roles: ['COORDINATOR'] })).toBe('/login');
    expect(destinationForSession({ roles: ['???'] })).not.toBe('/admin');
  });

  it('ignora from de casa ajena al volver de /login', () => {
    expect(coerceReturnPath({ roles: ['Estudiante'] }, '/admin/users')).toBe(
      '/student',
    );
  });
});
