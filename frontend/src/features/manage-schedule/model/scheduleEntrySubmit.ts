import type {
  CreateScheduleEntryPayload,
  UpdateScheduleEntryPayload,
} from '@/entities/schedule';
import type { ScheduleDialogMode, ScheduleEntryFormValues } from './useSchedulePanel';

export type ScheduleEntrySubmitResult =
  | { ok: false; message: string }
  | { ok: true; mode: 'create'; payload: CreateScheduleEntryPayload }
  | {
      ok: true;
      mode: 'update';
      entryId: number;
      payload: UpdateScheduleEntryPayload;
    };

export function resolveScheduleEntrySubmit(
  dialogMode: ScheduleDialogMode,
  form: ScheduleEntryFormValues,
  editingEntryId: number | null,
): ScheduleEntrySubmitResult {
  const teachingAssignmentId = Number(form.teachingAssignmentId);
  const dayOfWeek = Number(form.dayOfWeek);
  const timeSlotId = Number(form.timeSlotId);
  if (
    !Number.isInteger(teachingAssignmentId) ||
    teachingAssignmentId <= 0 ||
    !Number.isInteger(dayOfWeek) ||
    dayOfWeek < 1 ||
    dayOfWeek > 5 ||
    !Number.isInteger(timeSlotId) ||
    timeSlotId <= 0
  ) {
    return {
      ok: false,
      message: 'Complete la asignación, el día y el bloque horario.',
    };
  }

  if (dialogMode === 'create') {
    return {
      ok: true,
      mode: 'create',
      payload: { teachingAssignmentId, dayOfWeek, timeSlotId },
    };
  }

  if (editingEntryId == null) {
    return {
      ok: false,
      message: 'Complete la asignación, el día y el bloque horario.',
    };
  }

  return {
    ok: true,
    mode: 'update',
    entryId: editingEntryId,
    payload: { teachingAssignmentId },
  };
}
