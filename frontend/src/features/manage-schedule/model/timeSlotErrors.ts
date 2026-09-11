import { HttpError } from '@/shared/api/httpClient';

export type TimeSlotErrorContext = 'update' | 'delete' | 'generic';

/**
 * Map backend ScheduleTimeSlot mutation errors to Spanish UX copy.
 * HttpExceptionFilter often exposes English `message` and may omit `code`.
 */
export function humanizeTimeSlotMutationError(
  error: unknown,
  context: TimeSlotErrorContext = 'generic',
): string {
  if (error instanceof HttpError) {
    const msg = error.message ?? '';
    const upper = msg.toUpperCase();

    if (
      upper.includes('SCHEDULE_TIME_SLOT_OVERLAP') ||
      /overlaps another active time slot/i.test(msg)
    ) {
      return 'El horario se superpone con otro bloque activo.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_DISPLAY_ORDER_CONFLICT') ||
      /already uses this displayOrder/i.test(msg)
    ) {
      return 'Ya existe otro bloque activo con este orden.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_LESSON_NUMBER_INVALID') ||
      /cannot have a lessonNumber/i.test(msg)
    ) {
      return 'Solo los bloques de clase pueden tener número de lección.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_LESSON_NUMBER_CONFLICT') ||
      /already uses this lessonNumber/i.test(msg)
    ) {
      return 'Ya existe otra clase activa con este número de lección.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_IN_USE') ||
      /referenced by schedule entries/i.test(msg) ||
      /cannot change startTime, endTime, or slotType/i.test(msg)
    ) {
      if (context === 'delete') {
        return 'No puedes eliminar este bloque porque está siendo utilizado. Desactívalo si ya no debe usarse para nuevas clases.';
      }
      if (context === 'update') {
        return 'Este bloque ya está siendo utilizado en el horario. Puedes cambiar su nombre, orden, número de lección o desactivarlo, pero no su horario ni su tipo.';
      }
      return 'Este bloque ya está siendo utilizado en el horario.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_LOCK_TIMEOUT') ||
      /time-slots mutate lock/i.test(msg)
    ) {
      return 'No se pudo completar la operación porque otra modificación del horario está en proceso. Inténtalo de nuevo.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_LOCK_ERROR') ||
      /named lock acquisition failed \(NULL\/error from GET_LOCK\) for time-slots/i.test(
        msg,
      )
    ) {
      return 'No se pudo bloquear temporalmente la configuración del horario.';
    }
    if (
      upper.includes('SCHEDULE_TIME_SLOT_INVALID_RANGE') ||
      /startTime must be before endTime/i.test(msg)
    ) {
      return 'La hora de inicio debe ser anterior a la hora de finalización.';
    }

    return msg || 'No se pudo completar la solicitud.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'No se pudo completar la solicitud.';
}
