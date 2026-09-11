import type { AcademicOfferingKind } from './types';

/**
 * UX mirror of AcademicOfferingEligibilityPolicy (backend is authority).
 * 7–9: SUBJECT + EXPLORATORY_WORKSHOP
 * 10–12: SUBJECT + TECHNICAL_SPECIALTY
 */
export function allowedOfferingKindsForGrade(
  grade: number | null | undefined,
): AcademicOfferingKind[] {
  if (grade == null || !Number.isInteger(grade)) return [];
  if (grade >= 7 && grade <= 9) {
    return ['SUBJECT', 'EXPLORATORY_WORKSHOP'];
  }
  if (grade >= 10 && grade <= 12) {
    return ['SUBJECT', 'TECHNICAL_SPECIALTY'];
  }
  return [];
}

export function offeringKindLabel(kind: AcademicOfferingKind): string {
  switch (kind) {
    case 'SUBJECT':
      return 'Materia';
    case 'EXPLORATORY_WORKSHOP':
      return 'Taller exploratorio';
    case 'TECHNICAL_SPECIALTY':
      return 'Especialidad técnica';
    default:
      return kind;
  }
}
