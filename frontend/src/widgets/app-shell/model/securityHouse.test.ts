import { describe, expect, it } from 'vitest';
import {
  houseHome,
  isAllowedInHouse,
  mapLegacyPath,
  resolveHouse,
  resolveTerritoryNavigation,
} from './territory';
import { adminNavigationItems, filterAdminNavigation, resolveRoleAudience } from './adminNavigation';

const GUARD = ['Guarda de Seguridad'];
const guardPermissions = new Set([
  'departures.validate',
  'departures.create',
  'departures.view_history',
  'departures.export',
]);

describe('security house', () => {
  it('resolves the guard role to /security', () => {
    expect(resolveHouse(GUARD)).toBe('security');
    expect(resolveHouse(['SECURITY_GUARD'])).toBe('security');
    expect(houseHome('security')).toBe('/security/dashboard');
    expect(resolveRoleAudience(GUARD)).toBe('security');
  });

  it('keeps staff precedence over the guard role', () => {
    expect(resolveHouse(['Guarda de Seguridad', 'Administrador'])).toBe('admin');
    expect(resolveHouse(['Guarda de Seguridad', 'Docente'])).toBe('teacher');
  });

  it('confines the guard to /security', () => {
    expect(isAllowedInHouse('security', '/security/check-out')).toBe(true);
    expect(isAllowedInHouse('security', '/admin/users')).toBe(false);
    expect(resolveTerritoryNavigation('/admin/users', GUARD)).toBe('/security/dashboard');
    expect(resolveTerritoryNavigation('/security/history', GUARD)).toBeNull();
    expect(mapLegacyPath('/administrative', 'security')).toBe('/security/dashboard');
  });

  it('bounces students and guardians out of /security', () => {
    expect(resolveTerritoryNavigation('/security/dashboard', ['Estudiante'])).not.toBeNull();
    expect(resolveTerritoryNavigation('/security/dashboard', ['Encargado'])).not.toBeNull();
  });

  it('shows only the guard menu to the guard', () => {
    const visible = filterAdminNavigation(adminNavigationItems, (code) => guardPermissions.has(code), GUARD, 'security');
    expect(visible.map((item) => item.to)).toEqual([
      '/security/dashboard',
      '/security/check-out',
      '/security/permits',
      '/security/history',
      '/security/settings',
    ]);
  });

  it('relocates the staff departures group to the director house', () => {
    const visible = filterAdminNavigation(adminNavigationItems, () => true, ['Director'], 'staff');
    const security = visible.filter((item) => item.group === 'security').map((item) => item.to);
    expect(security).toContain('/director/security/check-out');
    expect(security.every((to) => to.startsWith('/director/security/'))).toBe(true);
  });

  it('hides the departures group from teachers without permissions', () => {
    const visible = filterAdminNavigation(adminNavigationItems, (code) => !code.startsWith('departures.'), ['Docente'], 'teacher');
    expect(visible.some((item) => item.group === 'security')).toBe(false);
  });
});
