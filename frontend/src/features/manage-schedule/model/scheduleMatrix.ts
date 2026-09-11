import type {
  ScheduleEntry,
  ScheduleSlotType,
  ScheduleTimeSlot,
} from '@/entities/schedule';

export type ScheduleCellKey = `${number}:${number}`;

export function cellKey(dayOfWeek: number, timeSlotId: number): ScheduleCellKey {
  return `${dayOfWeek}:${timeSlotId}`;
}

export function isAssignableSlotType(slotType: ScheduleSlotType): boolean {
  return slotType === 'CLASS';
}

export function sortTimeSlotsByDisplayOrder(
  slots: ScheduleTimeSlot[],
): ScheduleTimeSlot[] {
  return [...slots].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.id - b.id;
  });
}

/**
 * Matrix columns: active slots always; inactive only if referenced by loaded entries.
 */
export function visibleSlotsForMatrix(
  slots: ScheduleTimeSlot[],
  entries: ScheduleEntry[],
): ScheduleTimeSlot[] {
  const referencedIds = new Set(entries.map((e) => e.timeSlot.id));
  return sortTimeSlotsByDisplayOrder(
    slots.filter((slot) => slot.isActive || referencedIds.has(slot.id)),
  );
}

/**
 * Groups entries by dayOfWeek + timeSlotId.
 * General view may have multiple entries per cell.
 */
export function groupEntriesByCell(
  entries: ScheduleEntry[],
): Map<ScheduleCellKey, ScheduleEntry[]> {
  const map = new Map<ScheduleCellKey, ScheduleEntry[]>();
  for (const entry of entries) {
    const key = cellKey(entry.dayOfWeek, entry.timeSlot.id);
    const list = map.get(key);
    if (list) list.push(entry);
    else map.set(key, [entry]);
  }
  return map;
}

export function entriesForCell(
  byCell: Map<ScheduleCellKey, ScheduleEntry[]>,
  dayOfWeek: number,
  timeSlotId: number,
): ScheduleEntry[] {
  return byCell.get(cellKey(dayOfWeek, timeSlotId)) ?? [];
}

/** Narrow layout: same entries, filtered to one weekday. */
export function filterEntriesByDay(
  entries: ScheduleEntry[],
  dayOfWeek: number,
): ScheduleEntry[] {
  return entries.filter((e) => e.dayOfWeek === dayOfWeek);
}

export function buildEntriesListFilters(input: {
  periodId: number | null;
  teacherId: number | null;
  groupId: number | null;
}): {
  periodId?: number;
  teacherId?: number;
  groupId?: number;
} {
  const filters: {
    periodId?: number;
    teacherId?: number;
    groupId?: number;
  } = {};
  if (input.periodId != null) filters.periodId = input.periodId;
  if (input.teacherId != null) filters.teacherId = input.teacherId;
  if (input.groupId != null) filters.groupId = input.groupId;
  return filters;
}

/** Impartible TAs for the assign modal, filtered by period + view context. */
export function filterTeachingAssignmentsForContext<
  T extends {
    offeringKind: string | null | undefined;
    academicPeriodId: number | null;
    userId: number;
    groupId: number;
  },
>(
  assignments: T[],
  context: {
    periodId: number | null;
    teacherId: number | null;
    groupId: number | null;
  },
): T[] {
  return assignments.filter((ta) => {
    if (!ta.offeringKind) return false;
    if (context.periodId != null && ta.academicPeriodId !== context.periodId) {
      return false;
    }
    if (context.teacherId != null && ta.userId !== context.teacherId) {
      return false;
    }
    if (context.groupId != null && ta.groupId !== context.groupId) {
      return false;
    }
    return true;
  });
}
