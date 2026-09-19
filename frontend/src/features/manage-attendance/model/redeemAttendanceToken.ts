import type { RedeemAttendanceTokenResult } from '@/entities/attendance';
import { HttpError } from '@/shared/api';

const REDEEM_ERROR_BY_CODE: Record<string, string> = {
  ATTENDANCE_TOKEN_REQUIRED: 'Ingresa un código válido de al menos 6 caracteres.',
  ATTENDANCE_TOKEN_INVALID: 'El código no es válido o no existe.',
  ATTENDANCE_TOKEN_EXPIRED: 'El código ya expiró. Pide uno nuevo a tu docente.',
  ATTENDANCE_SESSION_NOT_OPEN: 'La clase ya no está abierta para registrar asistencia.',
  ATTENDANCE_TOKEN_STUDENT_ONLY: 'Solo los estudiantes pueden canjear el código.',
  ATTENDANCE_TOKEN_NOT_ENROLLED: 'No perteneces al grupo de esta clase.',
};

const REDEEM_ERROR_BY_MESSAGE: Array<{ match: RegExp; message: string }> = [
  {
    match: /token not found|not found|código no/i,
    message: 'El código no es válido o no existe.',
  },
  {
    match: /expired|expir/i,
    message: 'El código ya expiró. Pide uno nuevo a tu docente.',
  },
  {
    match: /not OPEN|not open|no está abierta/i,
    message: 'La clase ya no está abierta para registrar asistencia.',
  },
  {
    match: /not enrolled|no enrolled|perteneces/i,
    message: 'No perteneces al grupo de esta clase.',
  },
  {
    match: /Only students|solo los estudiantes/i,
    message: 'Solo los estudiantes pueden canjear el código.',
  },
];

export function normalizeAttendanceCode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

export function isValidAttendanceCode(code: string): boolean {
  return /^[A-Z0-9]{6,16}$/.test(code);
}

export function redeemTokenErrorMessage(reason: unknown): string {
  if (!(reason instanceof HttpError)) {
    return 'No se pudo registrar la asistencia. Intenta de nuevo.';
  }

  const raw = reason.message.trim();
  const byCode = REDEEM_ERROR_BY_CODE[raw];
  if (byCode) return byCode;

  for (const entry of REDEEM_ERROR_BY_MESSAGE) {
    if (entry.match.test(raw)) return entry.message;
  }

  return raw || 'No se pudo registrar la asistencia. Intenta de nuevo.';
}

export function formatRedeemSuccessMessage(
  result: RedeemAttendanceTokenResult,
): string {
  const classLabel = [result.offeringName, result.groupName]
    .filter(Boolean)
    .join(' · ');
  const when = result.sessionDate
    ? ` (${result.sessionDate})`
    : '';
  if (result.alreadyRedeemed) {
    return `Ya estabas registrado como Presente${classLabel ? ` en ${classLabel}` : ''}${when}.`;
  }
  return `Asistencia registrada: Presente${classLabel ? ` — ${classLabel}` : ''}${when}.`;
}
