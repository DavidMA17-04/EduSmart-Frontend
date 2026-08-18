import type { AcademicGroup } from './types';

export function formatStudentCount(count: AcademicGroup['studentCount']): string {
  return `${count} ${count === 1 ? 'estudiante' : 'estudiantes'}`;
}