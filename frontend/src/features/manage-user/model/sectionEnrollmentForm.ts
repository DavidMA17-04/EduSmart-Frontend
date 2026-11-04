import type { AcademicGroup } from '@/entities/group';
import type { UserFormMode } from './useUserForm';

const STUDENT_ROLE_NAMES = new Set(['estudiante', 'student']);

export function roleIsStudent(name: string | null | undefined): boolean {
  return STUDENT_ROLE_NAMES.has((name ?? '').trim().toLowerCase());
}

export function shouldShowManualSectionSelect(
  mode: UserFormMode,
  studentRoleSelected: boolean,
  hasCurrentEnrollment = false,
): boolean {
  if (!studentRoleSelected) return false;
  if (mode === 'create') return true;
  return mode === 'edit' && !hasCurrentEnrollment;
}

export function isGroupAtCapacity(group: AcademicGroup): boolean {
  const max = group.maxCapacity ?? 30;
  return group.studentCount >= max;
}

/** Código de sección sin concatenar nivel duplicado (`10-1`, no `10-10-1`). */
export function formatGroupCode(group: Pick<AcademicGroup, 'id' | 'name' | 'section'>): string {
  const name = group.name?.trim() ?? '';
  if (!name) return `Grupo #${group.id}`;
  const grade = group.section?.gradeLevel;
  if (grade == null) return name;
  if (name.includes('-')) return name;
  const prefix = `${grade}-`;
  if (name === String(grade) || name.startsWith(prefix)) return name;
  return `${prefix}${name}`;
}

export function formatGroupOptionLabel(group: AcademicGroup): string {
  const max = group.maxCapacity ?? 30;
  return `${formatGroupCode(group)} (${group.studentCount}/${max})`;
}

export function filterGroupsForManualEnrollment(groups: AcademicGroup[]): AcademicGroup[] {
  return groups.filter((group) => group.status !== 'INACTIVE');
}

export function resolveCreateGroupId(input: {
  studentRoleSelected: boolean;
  status: string;
  groupId: number | '';
}): number | undefined {
  if (!input.studentRoleSelected || input.status !== 'ACTIVE') return undefined;
  return typeof input.groupId === 'number' ? input.groupId : undefined;
}
