import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AcademicGroup } from '@/entities/group';
import {
  filterGroupsForManualEnrollment,
  formatGroupCode,
  formatGroupOptionLabel,
  isGroupAtCapacity,
  resolveCreateGroupId,
  roleIsStudent,
  shouldShowManualSectionSelect,
} from './sectionEnrollmentForm';

function group(overrides: Partial<AcademicGroup> = {}): AcademicGroup {
  return {
    id: 1,
    name: '10-1',
    studentCount: 12,
    maxCapacity: 30,
    sectionId: 2,
    status: 'ACTIVE',
    guideTeacherId: null,
    specialtyId: null,
    section: { id: 2, name: 'Décimo', gradeLevel: 10 },
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('sectionEnrollmentForm', () => {
  it('detecta rol Estudiante', () => {
    expect(roleIsStudent('Estudiante')).toBe(true);
    expect(roleIsStudent('STUDENT')).toBe(true);
    expect(roleIsStudent('Docente')).toBe(false);
  });

  it('muestra el selector en create y en edit si falta matrícula', () => {
    expect(shouldShowManualSectionSelect('create', true)).toBe(true);
    expect(shouldShowManualSectionSelect('create', false)).toBe(false);
    expect(shouldShowManualSectionSelect('edit', true)).toBe(true);
    expect(shouldShowManualSectionSelect('edit', true, true)).toBe(false);
    expect(shouldShowManualSectionSelect('edit', false)).toBe(false);
  });

  it('no duplica el nivel en el código de grupo', () => {
    expect(formatGroupCode(group({ name: '10-1' }))).toBe('10-1');
    expect(formatGroupCode(group({ name: 'A' }))).toBe('10-A');
    expect(formatGroupCode(group({ name: 'D4-10-A' }))).toBe('D4-10-A');
  });

  it('etiqueta con cupo y deshabilita llenos', () => {
    expect(formatGroupOptionLabel(group())).toBe('10-1 (12/30)');
    expect(isGroupAtCapacity(group({ studentCount: 30, maxCapacity: 30 }))).toBe(true);
    expect(isGroupAtCapacity(group({ studentCount: 29, maxCapacity: 30 }))).toBe(false);
  });

  it('oculta cascarones INACTIVE', () => {
    const rows = filterGroupsForManualEnrollment([
      group({ id: 1, status: 'ACTIVE' }),
      group({ id: 2, status: 'INACTIVE' }),
      group({ id: 3, status: undefined }),
    ]);
    expect(rows.map((row) => row.id)).toEqual([1, 3]);
  });

  it('solo envía groupId si Estudiante está ACTIVE', () => {
    expect(
      resolveCreateGroupId({ studentRoleSelected: true, status: 'ACTIVE', groupId: 12 }),
    ).toBe(12);
    expect(
      resolveCreateGroupId({ studentRoleSelected: true, status: 'PENDING', groupId: 12 }),
    ).toBeUndefined();
    expect(
      resolveCreateGroupId({ studentRoleSelected: false, status: 'ACTIVE', groupId: 12 }),
    ).toBeUndefined();
    expect(
      resolveCreateGroupId({ studentRoleSelected: true, status: 'ACTIVE', groupId: '' }),
    ).toBeUndefined();
  });

  it('UserForm y páginas enganchan selector, lectura y PATCH', () => {
    const formSrc = readFileSync(resolve(__dirname, '../ui/UserForm.tsx'), 'utf8');
    const createSrc = readFileSync(
      resolve(__dirname, '../../../pages/user-create/ui/UserCreatePage.tsx'),
      'utf8',
    );
    const detailSrc = readFileSync(
      resolve(__dirname, '../../../pages/user-detail/ui/UserDetailPage.tsx'),
      'utf8',
    );
    expect(formSrc).toContain('shouldShowManualSectionSelect(');
    expect(formSrc).toContain('hasCurrentEnrollment');
    expect(formSrc).toContain('Estructura académica');
    expect(createSrc).toContain('enrollmentSummary(createdUser.enrollment)');
    expect(createSrc).toContain('groups={groups}');
    expect(detailSrc).toContain('groups={groups}');
    expect(detailSrc).toContain('currentEnrollment={currentEnrollment}');
    expect(detailSrc).toContain('groupApi.list()');
    expect(detailSrc).toContain('enrollmentSummary(currentEnrollment)');
    expect(detailSrc).toContain('toCreatePayload(values, { studentRoleSelected })');
  });
});
