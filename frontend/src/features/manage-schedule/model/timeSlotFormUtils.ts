import type {
  CreateScheduleTimeSlotPayload,
  ScheduleSlotType,
  ScheduleTimeSlot,
  UpdateScheduleTimeSlotPayload,
} from '@/entities/schedule';
import { formatScheduleTime } from './scheduleLabels';

export type TimeSlotFormValues = {
  name: string;
  slotType: ScheduleSlotType | '';
  lessonNumber: string;
  startTime: string;
  endTime: string;
  displayOrder: string;
  isActive: boolean;
};

export const EMPTY_TIME_SLOT_FORM: TimeSlotFormValues = {
  name: '',
  slotType: 'CLASS',
  lessonNumber: '',
  startTime: '',
  endTime: '',
  displayOrder: '',
  isActive: true,
};

/** HH:mm:ss or HH:mm → HH:mm for <input type="time"> */
export function toTimeInputValue(value: string): string {
  return formatScheduleTime(value);
}

/** Ensure API-friendly HH:mm:ss from time input. */
export function toApiTimeValue(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return trimmed;
}

function timeToSeconds(value: string): number | null {
  const normalized = toApiTimeValue(value);
  const match = normalized.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

export function slotTypeLabel(slotType: ScheduleSlotType): string {
  if (slotType === 'CLASS') return 'Clase';
  if (slotType === 'BREAK') return 'Receso';
  return 'Almuerzo';
}

export function timeSlotFromRow(row: ScheduleTimeSlot): TimeSlotFormValues {
  return {
    name: row.name,
    slotType: row.slotType,
    lessonNumber: row.lessonNumber != null ? String(row.lessonNumber) : '',
    startTime: toTimeInputValue(row.startTime),
    endTime: toTimeInputValue(row.endTime),
    displayOrder: String(row.displayOrder),
    isActive: row.isActive,
  };
}

export function validateTimeSlotForm(
  form: TimeSlotFormValues,
): string | null {
  if (!form.name.trim()) return 'El nombre es obligatorio.';
  if (!form.slotType) return 'Seleccione el tipo de bloque.';
  if (!form.startTime.trim()) return 'La hora de inicio es obligatoria.';
  if (!form.endTime.trim()) return 'La hora de fin es obligatoria.';
  const startSec = timeToSeconds(form.startTime);
  const endSec = timeToSeconds(form.endTime);
  if (startSec == null || endSec == null) {
    return 'Use un formato de hora válido (HH:mm).';
  }
  if (startSec >= endSec) {
    return 'La hora de inicio debe ser anterior a la hora de finalización.';
  }
  const displayOrder = Number(form.displayOrder);
  if (!Number.isInteger(displayOrder) || displayOrder < 1) {
    return 'El orden debe ser un entero positivo.';
  }
  if (form.slotType === 'CLASS' && form.lessonNumber.trim() !== '') {
    const lesson = Number(form.lessonNumber);
    if (!Number.isInteger(lesson) || lesson < 1) {
      return 'El número de lección debe ser un entero positivo o quedar vacío.';
    }
  }
  return null;
}

export function buildCreateTimeSlotPayload(
  form: TimeSlotFormValues,
): CreateScheduleTimeSlotPayload {
  const slotType = form.slotType as ScheduleSlotType;
  const lessonNumber =
    slotType === 'CLASS' && form.lessonNumber.trim() !== ''
      ? Number(form.lessonNumber)
      : null;
  return {
    name: form.name.trim(),
    startTime: toApiTimeValue(form.startTime),
    endTime: toApiTimeValue(form.endTime),
    displayOrder: Number(form.displayOrder),
    slotType,
    lessonNumber,
    isActive: form.isActive,
  };
}

export function buildUpdateTimeSlotPayload(
  form: TimeSlotFormValues,
): UpdateScheduleTimeSlotPayload {
  return buildCreateTimeSlotPayload(form);
}
