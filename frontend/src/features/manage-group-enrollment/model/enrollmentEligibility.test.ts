import { describe, expect, it } from 'vitest';
import type { AdministrativeUser } from '@/entities/user';
import {
  assessEnrollmentEligibility,
  matchesStudentSearch,
  summarizeEligibility,
} from './enrollmentEligibility';

const base = {
  nationalId: '1-1111-1111',
  firstName: 'Alex',
  lastName: 'Mora',
  first_lastname: 'Mora',
  second_lastname: 'Solís',
  email: 'alex.mora@ctp.ed.cr',
  phone: null,
  mustChangePassword: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
} as const;

function student(
  patch: Partial<AdministrativeUser> & { id: number; name: string },
): AdministrativeUser {
  return {
    ...base,
    status: 'ACTIVE',
    roles: [{ id: 2, name: 'Estudiante', status: 'ACTIVE' }],
    ...patch,
  };
}

describe('enrollmentEligibility', () => {
  it('busca por nombre, apellido, correo y cédula', () => {
    const u = student({ id: 1, name: 'Alex' });
    expect(matchesStudentSearch(u, 'alex')).toBe(true);
    expect(matchesStudentSearch(u, 'mora')).toBe(true);
    expect(matchesStudentSearch(u, 'solís')).toBe(true);
    expect(matchesStudentSearch(u, 'ctp.ed')).toBe(true);
    expect(matchesStudentSearch(u, '1-1111')).toBe(true);
    expect(matchesStudentSearch(u, 'zzz')).toBe(false);
  });

  it('marca no apto si ya está matriculado', () => {
    const u = student({ id: 7, name: 'Alex' });
    const r = assessEnrollmentEligibility(u, new Set([7]));
    expect(r.tone).toBe('no_apto');
  });

  it('summary 100% solo si todos aptos', () => {
    const results = [
      assessEnrollmentEligibility(student({ id: 1, name: 'A' }), new Set()),
      assessEnrollmentEligibility(student({ id: 2, name: 'B' }), new Set()),
    ];
    expect(summarizeEligibility(results).allAptos).toBe(true);
    expect(summarizeEligibility(results).percentAptos).toBe(100);
  });
});
