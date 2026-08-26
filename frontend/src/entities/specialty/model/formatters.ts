import type { Specialty, SpecialtyStatus } from './types';

export const SPECIALTY_STATUS_LABELS: Record<SpecialtyStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  UNDER_REVIEW: 'En revisión',
};

export function formatSpecialtyDuration(_duration?: number): string {
  return '';
}

export function normalizeSpecialty(specialty: Specialty): Specialty {
  return { ...specialty, description: specialty.description ?? null };
}
