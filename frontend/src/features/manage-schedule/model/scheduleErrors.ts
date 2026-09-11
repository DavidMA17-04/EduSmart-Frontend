import { HttpError } from '@/shared/api/httpClient';

/**
 * Map backend conflict / schedule errors to Spanish UX copy.
 * HttpExceptionFilter exposes `message` (often English) and may omit `code`.
 */
export function humanizeScheduleMutationError(error: unknown): string {
  if (error instanceof HttpError) {
    const msg = error.message ?? '';
    const upper = msg.toUpperCase();

    if (
      upper.includes('SCHEDULE_TEACHER_CONFLICT') ||
      /teacher already has a schedule entry/i.test(msg)
    ) {
      return 'El docente ya tiene una clase asignada en este bloque.';
    }
    if (
      upper.includes('SCHEDULE_GROUP_CONFLICT') ||
      /group already has a schedule entry/i.test(msg)
    ) {
      return 'El grupo ya tiene una clase asignada en este bloque.';
    }
    if (
      upper.includes('SCHEDULE_ENTRY_DUPLICATE') ||
      /already scheduled for this day and time slot/i.test(msg)
    ) {
      return 'Esta clase ya está asignada en este bloque.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_NOT_ASSIGNABLE') ||
      /only class time slots/i.test(msg)
    ) {
      return 'Solo se pueden asignar clases en bloques de tipo clase.';
    }
    if (
      upper.includes('SCHEDULE_LOCK_TIMEOUT') ||
      /could not acquire schedule conflict lock/i.test(msg)
    ) {
      return 'El horario está ocupado por otra operación. Intente de nuevo.';
    }
    if (
      upper.includes('SCHEDULE_LOCK_ERROR') ||
      /named lock acquisition failed/i.test(msg)
    ) {
      return 'No se pudo reservar el bloque horario. Intente de nuevo.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_INACTIVE') ||
      /time slot is inactive/i.test(msg)
    ) {
      return 'Este bloque horario está inactivo.';
    }
    if (
      upper.includes('SCHEDULE_TA_NOT_IMPARTABLE') ||
      /not impartable/i.test(msg)
    ) {
      return 'La asignación académica seleccionada no es impartible.';
    }

    return msg || 'No se pudo completar la solicitud.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'No se pudo completar la solicitud.';
}
