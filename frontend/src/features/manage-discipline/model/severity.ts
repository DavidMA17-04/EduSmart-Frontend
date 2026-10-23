import type { BadgeTone } from '@/shared/ui';
import type { DisciplinaryTrack, InfractionSeverity } from './types';

export const SEVERITY_ORDER: readonly InfractionSeverity[] = [
  'VERY_MINOR',
  'MINOR',
  'SERIOUS',
  'VERY_SERIOUS',
  'EXTREMELY_SERIOUS',
];

export const SEVERITY_LABELS: Record<InfractionSeverity, string> = {
  VERY_MINOR: 'Muy leve',
  MINOR: 'Leve',
  SERIOUS: 'Grave',
  VERY_SERIOUS: 'Muy grave',
  EXTREMELY_SERIOUS: 'Gravísima',
};

/** REAC 2026 Art. 143; la fuente de verdad es `/disciplinary/severity-rules`. */
export const SEVERITY_DEDUCTIONS: Record<InfractionSeverity, number> = {
  VERY_MINOR: 5,
  MINOR: 10,
  SERIOUS: 20,
  VERY_SERIOUS: 35,
  EXTREMELY_SERIOUS: 50,
};

export const SEVERITY_TONES: Record<InfractionSeverity, BadgeTone> = {
  VERY_MINOR: 'success',
  MINOR: 'neutral',
  SERIOUS: 'warning',
  VERY_SERIOUS: 'danger',
  EXTREMELY_SERIOUS: 'danger',
};

export const TRACK_LABELS: Record<DisciplinaryTrack, string> = {
  DIRECT: 'Amonestación directa del docente',
  DUE_PROCESS: 'Debido proceso (Art. 150)',
};
