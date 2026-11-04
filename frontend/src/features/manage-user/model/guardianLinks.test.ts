import { describe, expect, it } from 'vitest';
import { HttpError } from '@/shared/api/httpClient';
import type { GuardianStudentLink } from '../api/guardianLinkApi';
import {
  applyCreatedLink,
  applyRemovedLink,
  canMutateGuardianLinks,
  counterpartOfLink,
  guardianLinkErrorMessage,
  isGuardianRoleName,
  isStudentRoleName,
  representedStudentsOf,
} from './guardianLinks';

const link: GuardianStudentLink = {
  id: 9,
  guardianUserId: 21,
  studentUserId: 22,
  relationship: 'Madre',
  createdAt: '2026-10-01T00:00:00.000Z',
  guardian: {
    id: 21,
    nationalId: '809000004',
    name: 'Roberto DiscQA',
    first_lastname: 'DiscQA',
    second_lastname: null,
    email: 'r@ctphojancha.ed.cr',
    status: 'ACTIVE',
  },
  student: {
    id: 22,
    nationalId: '809000005',
    name: 'Estudiante DiscQA',
    first_lastname: 'DiscQA',
    second_lastname: null,
    email: 'e@ctphojancha.ed.cr',
    status: 'ACTIVE',
  },
};

describe('guardianLinks', () => {
  it('reconoce Encargado y Estudiante (incluidos alias)', () => {
    expect(isGuardianRoleName('Encargado')).toBe(true);
    expect(isGuardianRoleName('Padre de familia')).toBe(true);
    expect(isStudentRoleName('Estudiante')).toBe(true);
    expect(isGuardianRoleName('Docente')).toBe(false);
  });

  it('lista: agrega el vínculo creado y elige la contraparte', () => {
    const next = applyCreatedLink([], link);
    expect(next).toHaveLength(1);
    expect(counterpartOfLink(next[0], 22).id).toBe(21);
  });

  it('duplicado: el 409 queda visible como conflicto', () => {
    expect(guardianLinkErrorMessage(new HttpError(409, 'Este encargado ya está vinculado con este estudiante.'))).toBe(
      'Este encargado ya está vinculado con este estudiante.',
    );
  });

  it('desvincular: quita la fila de la lista', () => {
    expect(applyRemovedLink([link], 9)).toEqual([]);
  });

  it('el encargado solo lista a sus representados', () => {
    const extra: GuardianStudentLink = {
      ...link,
      id: 10,
      guardianUserId: 99,
      guardian: { ...link.guardian, id: 99 },
    };
    expect(representedStudentsOf([link, extra], 21).map((row) => row.id)).toEqual([22]);
  });

  it('oculta mutaciones sin administrator.edit', () => {
    expect(canMutateGuardianLinks(false)).toBe(false);
    expect(canMutateGuardianLinks(true)).toBe(true);
  });
});
