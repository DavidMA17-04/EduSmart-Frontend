import { addBusinessDays, todayIso } from './businessDays';
import type { DisciplinaryTrack } from './types';

export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
export const MAX_EVIDENCES = 5;

const ALLOWED_EXTENSION = /\.(pdf|jpe?g|png)$/i;

export type CaseFormValues = {
  studentUserId: number | null;
  infractionTypeId: number | null;
  occurredAt: string;
  place: string;
  description: string;
  witnesses: string;
  lateReportReason: string;
  subjectId: string;
  files: ReadonlyArray<{ name: string; size: number }>;
};

export function validateCaseForm(
  values: CaseFormValues,
  track: DisciplinaryTrack | null,
  now: Date = new Date(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.studentUserId) errors.studentUserId = 'Seleccione al estudiante.';
  if (!values.infractionTypeId) errors.infractionTypeId = 'Seleccione el tipo de falta.';
  if (!values.occurredAt) {
    errors.occurredAt = 'Indique la fecha y hora del hecho.';
  } else if (new Date(values.occurredAt).getTime() > now.getTime()) {
    errors.occurredAt = 'La fecha del hecho no puede ser futura.';
  }
  if (values.place.trim().length < 2) errors.place = 'Indique el lugar.';
  if (values.description.trim().length < 20) {
    errors.description = 'La descripción debe tener al menos 20 caracteres.';
  }
  if (values.files.length > MAX_EVIDENCES) {
    errors.files = 'Un expediente admite como máximo 5 evidencias.';
  }
  const invalidFile = values.files.find(
    (file) => !ALLOWED_EXTENSION.test(file.name) || file.size > MAX_EVIDENCE_BYTES || file.size <= 0,
  );
  if (invalidFile && !errors.files) {
    errors.files = 'Cada evidencia debe ser PDF, JPG o PNG y pesar como máximo 10 MB.';
  }
  const occurredOn = values.occurredAt.slice(0, 10);
  const late =
    track === 'DUE_PROCESS' &&
    Boolean(occurredOn) &&
    addBusinessDays(occurredOn, 5) < todayIso(now);
  if (late && values.lateReportReason.trim().length < 10) {
    errors.lateReportReason = 'El reporte extemporáneo requiere una justificación.';
  }
  return errors;
}

export function isLateReport(occurredAt: string, track: DisciplinaryTrack | null, now: Date = new Date()): boolean {
  if (track !== 'DUE_PROCESS' || occurredAt.length < 10) return false;
  return addBusinessDays(occurredAt.slice(0, 10), 5) < todayIso(now);
}
