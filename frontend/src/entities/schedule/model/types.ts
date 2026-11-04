/** Aligns with backend ScheduleSlotType. */
export type ScheduleSlotType = 'CLASS' | 'BREAK' | 'LUNCH';

/** Aligns with backend ScheduleTimeSlotView. */
export type ScheduleTimeSlot = {
  id: number;
  lessonNumber: number | null;
  name: string;
  startTime: string;
  endTime: string;
  displayOrder: number;
  slotType: ScheduleSlotType;
  isActive: boolean;
};

/** Nested time slot on ScheduleEntryView (subset of full slot). */
export type ScheduleEntryTimeSlot = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  displayOrder: number;
  slotType: ScheduleSlotType;
};

export type ScheduleEntryOffering = {
  kind: string;
  id: number;
  name: string;
  labelKind: string;
};

export type ScheduleEntryTeachingAssignment = {
  id: number;
  teacher: { id: number; name: string };
  group: { id: number; name: string; gradeLevel: number | null };
  offering: ScheduleEntryOffering;
  academicPeriod: { id: number; name: string } | null;
};

/** Aligns with backend ScheduleEntryView. */
export type ScheduleEntry = {
  entryId: number;
  dayOfWeek: number;
  timeSlot: ScheduleEntryTimeSlot;
  teachingAssignment: ScheduleEntryTeachingAssignment;
};

export type ScheduleEntryListFilters = {
  teacherId?: number;
  groupId?: number;
  periodId?: number;
  dayOfWeek?: number;
};

export type CreateScheduleEntryPayload = {
  teachingAssignmentId: number;
  dayOfWeek: number;
  timeSlotId: number;
};

export type UpdateScheduleEntryPayload = {
  teachingAssignmentId?: number;
  dayOfWeek?: number;
  timeSlotId?: number;
};

/** Monday=1 … Friday=5 (backend contract). */
export type ScheduleDayOfWeek = 1 | 2 | 3 | 4 | 5;

export type CreateScheduleTimeSlotPayload = {
  name: string;
  startTime: string;
  endTime: string;
  displayOrder: number;
  slotType: ScheduleSlotType;
  lessonNumber: number | null;
  isActive: boolean;
};

export type UpdateScheduleTimeSlotPayload = Partial<CreateScheduleTimeSlotPayload>;
