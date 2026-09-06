import type { Specialty, SpecialtyKind, SpecialtyStatus } from './types';

export const SPECIALTY_STATUS_LABELS: Record<SpecialtyStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  UNDER_REVIEW: 'En revisión',
};

export const SPECIALTY_KIND_LABELS: Record<SpecialtyKind, string> = {
  EXPLORATORY_WORKSHOP: 'Taller exploratorio',
  TECHNICAL_SPECIALTY: 'Especialidad técnica',
};

export function formatSpecialtyDuration(_duration?: number): string {
  return '';
}

export function normalizeSpecialty(specialty: Specialty): Specialty {
  return {
    ...specialty,
    description: specialty.description ?? null,
    kind: specialty.kind ?? 'TECHNICAL_SPECIALTY',
  };
}
