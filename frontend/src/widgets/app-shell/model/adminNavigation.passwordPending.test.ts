import { describe, expect, it } from 'vitest';
import { adminNavigationItems, filterAdminNavigation } from './adminNavigation';

const allowAll = () => true;

describe('filterAdminNavigation with password change pending', () => {
  it('limits a student to Configuración', () => {
    const visible = filterAdminNavigation(
      adminNavigationItems,
      allowAll,
      ['Estudiante'],
      'student',
      true,
    );
    expect(visible.map((item) => item.to)).toEqual(['/student/settings']);
  });

  it('limits a guardian to Configuración', () => {
    const visible = filterAdminNavigation(
      adminNavigationItems,
      allowAll,
      ['Encargado'],
      'guardian',
      true,
    );
    expect(visible.map((item) => item.to)).toEqual(['/guardian/settings']);
  });

  it('relocates staff Configuración to the role house', () => {
    const visible = filterAdminNavigation(
      adminNavigationItems,
      allowAll,
      ['Docente'],
      'teacher',
      true,
    );
    expect(visible.map((item) => item.to)).toEqual(['/teacher/settings']);
  });

  it('keeps the full menu when no change is pending', () => {
    const visible = filterAdminNavigation(
      adminNavigationItems,
      allowAll,
      ['Estudiante'],
      'student',
    );
    expect(visible.length).toBeGreaterThan(1);
  });
});
