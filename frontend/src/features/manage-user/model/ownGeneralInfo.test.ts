import { describe, expect, it } from 'vitest';
import {
  enrollmentSummary,
  formatRoleNames,
  userHasStudentRole,
  userStatusTone,
} from './ownGeneralInfo';

describe('ownGeneralInfo', () => {
  it('detecta rol Estudiante institucional o alias STUDENT', () => {
    expect(userHasStudentRole({ roles: [{ id: 3, name: 'Estudiante', status: 'ACTIVE' }] })).toBe(
      true,
    );
    expect(userHasStudentRole({ roles: [{ id: 2, name: 'Docente', status: 'ACTIVE' }] })).toBe(
      false,
    );
  });

  it('resume matrícula o deja empty-state si no hay sección', () => {
    expect(enrollmentSummary(null)).toBe('Sin sección asignada');
    expect(
      enrollmentSummary({
        groupId: 1,
        groupName: 'A',
        sectionLabel: '10-A',
        specialtyName: 'Programación',
        academicPeriodId: 4,
        academicPeriodName: '2026',
        startsOn: '2026-02-01',
        status: 'ACTIVE',
      }),
    ).toBe('10-A · 2026');
  });

  it('formatea roles vacíos y estado ACTIVE', () => {
    expect(formatRoleNames({ roles: [] })).toBe('Sin roles');
    expect(userStatusTone('ACTIVE')).toBe('active');
  });
});
