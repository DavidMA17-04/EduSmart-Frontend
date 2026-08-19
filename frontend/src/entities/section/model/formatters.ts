import type { SectionStatus } from './types';

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' };

export function normalizeSectionCode(code: string): string {
  return code.trim().toUpperCase();
}