import type { CaseAppeal, DisciplinaryCaseStatus, DisciplinaryTrack, InfractionSeverity } from './types';

const FINAL_STATUSES = new Set<DisciplinaryCaseStatus>(['FIRM', 'DISMISSED', 'ANNULLED']);
const PRECAUTIONARY_SEVERITIES = new Set<InfractionSeverity>(['SERIOUS', 'VERY_SERIOUS', 'EXTREMELY_SERIOUS']);

export const PRECAUTIONARY_MAX_NATURAL_DAYS = 10;

export function validateLength(value: string, min: number, max: number, label: string): string | null {
  const text = value.trim();
  if (text.length < min) return `${label} debe tener al menos ${min} caracteres.`;
  if (text.length > max) return `${label} no puede superar ${max} caracteres.`;
  return null;
}

export function inclusiveNaturalDays(startsOn: string, endsOn: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(endsOn)) return null;
  const start = Date.parse(`${startsOn}T00:00:00Z`);
  const end = Date.parse(`${endsOn}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.round((end - start) / 86_400_000) + 1;
}

export function validatePrecautionarySpan(startsOn: string, endsOn: string): string | null {
  const days = inclusiveNaturalDays(startsOn, endsOn);
  if (days == null || days < 1) return 'La fecha de fin no puede ser anterior al inicio.';
  if (days > PRECAUTIONARY_MAX_NATURAL_DAYS) return 'El retiro no puede superar 10 días naturales.';
  return null;
}

export function canOfferPrecautionary(input: {
  hasPermission: boolean;
  track: DisciplinaryTrack;
  status: DisciplinaryCaseStatus;
  severity: InfractionSeverity;
}): boolean {
  return (
    input.hasPermission &&
    input.track === 'DUE_PROCESS' &&
    input.status !== 'NOTIFIED' &&
    !FINAL_STATUSES.has(input.status) &&
    PRECAUTIONARY_SEVERITIES.has(input.severity)
  );
}

export function canOfferWrittenDefense(input: {
  isConductor: boolean;
  track: DisciplinaryTrack;
  status: DisciplinaryCaseStatus;
  defenseCount: number;
}): boolean {
  return input.isConductor && input.track === 'DUE_PROCESS' && input.status === 'COMMUNICATED' && input.defenseCount === 0;
}

export function openAppeal(appeals: readonly CaseAppeal[], kind: 'REVOCATION' | 'APPEAL'): CaseAppeal | null {
  return appeals.find((item) => item.kind === kind && item.outcome == null) ?? null;
}
