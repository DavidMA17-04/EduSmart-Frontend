import type { ScheduleDayOfWeek, ScheduleSlotType } from '@/entities/schedule';
import type { TeachingAssignment } from '@/entities/teaching-assignment';

export const SCHEDULE_WEEKDAYS: ReadonlyArray<{
  dayOfWeek: ScheduleDayOfWeek;
  label: string;
}> = [
  { dayOfWeek: 1, label: 'Lunes' },
  { dayOfWeek: 2, label: 'Martes' },
  { dayOfWeek: 3, label: 'Miércoles' },
  { dayOfWeek: 4, label: 'Jueves' },
  { dayOfWeek: 5, label: 'Viernes' },
];

export function dayOfWeekLabel(dayOfWeek: number): string {
  return (
    SCHEDULE_WEEKDAYS.find((d) => d.dayOfWeek === dayOfWeek)?.label ??
    `Día ${dayOfWeek}`
  );
}

/** Display HH:mm from backend TIME (may be HH:mm:ss). */
export function formatScheduleTime(value: string): string {
  const raw = String(value ?? '');
  const match = raw.match(/(\d{2}:\d{2})/);
  return match ? match[1] : raw;
}

export function formatSlotRange(startTime: string, endTime: string): string {
  return `${formatScheduleTime(startTime)}–${formatScheduleTime(endTime)}`;
}

export function nonClassSlotLabel(slotType: ScheduleSlotType, name: string): string {
  if (slotType === 'BREAK') return name?.trim() || 'Receso';
  if (slotType === 'LUNCH') return name?.trim() || 'Almuerzo';
  return name;
}

function teacherNameFromTa(ta: TeachingAssignment): string {
  const u = ta.user;
  if (!u) return `Docente #${ta.userId}`;
  const composed = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return composed || u.name?.trim() || u.email || `Docente #${ta.userId}`;
}

function offeringNameFromTa(ta: TeachingAssignment): string {
  if (ta.offeringKind === 'SUBJECT') return ta.subject?.name ?? `Materia #${ta.subjectId}`;
  return ta.specialty?.name ?? `Oferta #${ta.specialtyId}`;
}

/** Select option: "Matemáticas · 7-1 · Eneida Pérez" */
export function teachingAssignmentOptionLabel(ta: TeachingAssignment): string {
  const offering = offeringNameFromTa(ta);
  const group = ta.group?.name ?? `Grupo #${ta.groupId}`;
  const teacher = teacherNameFromTa(ta);
  return `${offering} · ${group} · ${teacher}`;
}
