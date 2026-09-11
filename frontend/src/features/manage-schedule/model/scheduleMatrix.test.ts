import { describe, expect, it } from 'vitest';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import { humanizeScheduleMutationError } from './scheduleErrors';
import { HttpError } from '@/shared/api/httpClient';
import {
  buildEntriesListFilters,
  cellKey,
  entriesForCell,
  filterEntriesByDay,
  filterTeachingAssignmentsForContext,
  groupEntriesByCell,
  isAssignableSlotType,
  sortTimeSlotsByDisplayOrder,
} from './scheduleMatrix';
import { canEditSchedule, SCHEDULE_PERMISSIONS } from './schedulePermissions';

function slot(
  partial: Partial<ScheduleTimeSlot> & Pick<ScheduleTimeSlot, 'id' | 'slotType'>,
): ScheduleTimeSlot {
  return {
    lessonNumber: null,
    name: partial.name ?? `Slot ${partial.id}`,
    startTime: '07:00:00',
    endTime: '07:40:00',
    displayOrder: partial.displayOrder ?? partial.id,
    isActive: true,
    ...partial,
  };
}

function entry(
  partial: Partial<ScheduleEntry> & {
    entryId: number;
    dayOfWeek: number;
    timeSlotId: number;
  },
): ScheduleEntry {
  return {
    entryId: partial.entryId,
    dayOfWeek: partial.dayOfWeek,
    timeSlot: {
      id: partial.timeSlotId,
      name: 'Bloque',
      startTime: '07:00:00',
      endTime: '07:40:00',
      displayOrder: 1,
      slotType: 'CLASS',
      ...(partial.timeSlot ?? {}),
    },
    teachingAssignment: partial.teachingAssignment ?? {
      id: partial.entryId,
      teacher: { id: 1, name: 'Prof A' },
      group: { id: 1, name: '7-1', gradeLevel: 7 },
      offering: {
        kind: 'SUBJECT',
        id: 1,
        name: 'Matemáticas',
        labelKind: 'Materia',
      },
      academicPeriod: { id: 1, name: '2026' },
    },
  };
}

describe('scheduleMatrix', () => {
  it('18. ordena slots por displayOrder', () => {
    const sorted = sortTimeSlotsByDisplayOrder([
      slot({ id: 3, slotType: 'CLASS', displayOrder: 30 }),
      slot({ id: 1, slotType: 'CLASS', displayOrder: 10 }),
      slot({ id: 2, slotType: 'BREAK', displayOrder: 20 }),
    ]);
    expect(sorted.map((s) => s.id)).toEqual([1, 2, 3]);
  });

  it('2. mapea entries por day+slot', () => {
    const byCell = groupEntriesByCell([
      entry({ entryId: 1, dayOfWeek: 1, timeSlotId: 10 }),
      entry({ entryId: 2, dayOfWeek: 2, timeSlotId: 10 }),
    ]);
    expect(cellKey(1, 10)).toBe('1:10');
    expect(entriesForCell(byCell, 1, 10)).toHaveLength(1);
    expect(entriesForCell(byCell, 2, 10)[0]?.entryId).toBe(2);
    expect(entriesForCell(byCell, 3, 10)).toEqual([]);
  });

  it('3. múltiples entries en misma celda GENERAL', () => {
    const byCell = groupEntriesByCell([
      entry({
        entryId: 1,
        dayOfWeek: 1,
        timeSlotId: 10,
        teachingAssignment: {
          id: 1,
          teacher: { id: 1, name: 'Prof A' },
          group: { id: 1, name: '7-1', gradeLevel: 7 },
          offering: {
            kind: 'SUBJECT',
            id: 1,
            name: 'Matemáticas',
            labelKind: 'Materia',
          },
          academicPeriod: { id: 1, name: '2026' },
        },
      }),
      entry({
        entryId: 2,
        dayOfWeek: 1,
        timeSlotId: 10,
        teachingAssignment: {
          id: 2,
          teacher: { id: 2, name: 'Prof B' },
          group: { id: 2, name: '8-1', gradeLevel: 8 },
          offering: {
            kind: 'SUBJECT',
            id: 1,
            name: 'Matemáticas',
            labelKind: 'Materia',
          },
          academicPeriod: { id: 1, name: '2026' },
        },
      }),
      entry({
        entryId: 3,
        dayOfWeek: 1,
        timeSlotId: 10,
        teachingAssignment: {
          id: 3,
          teacher: { id: 3, name: 'Prof C' },
          group: { id: 3, name: '9-1', gradeLevel: 9 },
          offering: {
            kind: 'SUBJECT',
            id: 2,
            name: 'Ciencias',
            labelKind: 'Materia',
          },
          academicPeriod: { id: 1, name: '2026' },
        },
      }),
    ]);
    expect(entriesForCell(byCell, 1, 10)).toHaveLength(3);
  });

  it('4–5. BREAK y LUNCH no son asignables', () => {
    expect(isAssignableSlotType('BREAK')).toBe(false);
    expect(isAssignableSlotType('LUNCH')).toBe(false);
  });

  it('6. CLASS es asignable', () => {
    expect(isAssignableSlotType('CLASS')).toBe(true);
  });

  it('17. mobile filtra por día sin perder el resto de entries', () => {
    const all = [
      entry({ entryId: 1, dayOfWeek: 1, timeSlotId: 10 }),
      entry({ entryId: 2, dayOfWeek: 3, timeSlotId: 10 }),
      entry({ entryId: 3, dayOfWeek: 1, timeSlotId: 11 }),
    ];
    const monday = filterEntriesByDay(all, 1);
    expect(monday.map((e) => e.entryId)).toEqual([1, 3]);
    // 19. misma fuente: filtrar no muta el array original
    expect(all).toHaveLength(3);
    expect(groupEntriesByCell(all).size).toBe(3);
  });

  it('8–10. buildEntriesListFilters combina teacher/group/period', () => {
    expect(
      buildEntriesListFilters({
        periodId: 1,
        teacherId: 5,
        groupId: 3,
      }),
    ).toEqual({ periodId: 1, teacherId: 5, groupId: 3 });
    expect(
      buildEntriesListFilters({
        periodId: null,
        teacherId: null,
        groupId: 3,
      }),
    ).toEqual({ groupId: 3 });
  });

  it('20. teaching assignments filtradas por contexto', () => {
    const tas = [
      {
        offeringKind: 'SUBJECT',
        academicPeriodId: 1,
        userId: 5,
        groupId: 3,
      },
      {
        offeringKind: 'SUBJECT',
        academicPeriodId: 1,
        userId: 9,
        groupId: 3,
      },
      {
        offeringKind: null,
        academicPeriodId: 1,
        userId: 5,
        groupId: 3,
      },
      {
        offeringKind: 'SUBJECT',
        academicPeriodId: 2,
        userId: 5,
        groupId: 3,
      },
    ];
    const filtered = filterTeachingAssignmentsForContext(tas, {
      periodId: 1,
      teacherId: 5,
      groupId: 3,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.userId).toBe(5);
  });
});

describe('schedulePermissions', () => {
  it('6. schedules.edit habilita edición', () => {
    expect(canEditSchedule((code) => code === SCHEDULE_PERMISSIONS.edit)).toBe(
      true,
    );
  });

  it('7. sin schedules.edit es read-only', () => {
    expect(canEditSchedule((code) => code === SCHEDULE_PERMISSIONS.view)).toBe(
      false,
    );
  });
});

describe('humanizeScheduleMutationError', () => {
  it('14. teacher conflict → mensaje UX', () => {
    expect(
      humanizeScheduleMutationError(
        new HttpError(
          409,
          'Teacher already has a schedule entry for this day and time slot',
        ),
      ),
    ).toBe('El docente ya tiene una clase asignada en este bloque.');
  });

  it('15. group conflict → mensaje UX', () => {
    expect(
      humanizeScheduleMutationError(
        new HttpError(
          409,
          'Group already has a schedule entry for this day and time slot',
        ),
      ),
    ).toBe('El grupo ya tiene una clase asignada en este bloque.');
  });

  it('16. duplicate → mensaje UX', () => {
    expect(
      humanizeScheduleMutationError(
        new HttpError(
          409,
          'This teaching assignment is already scheduled for this day and time slot',
        ),
      ),
    ).toBe('Esta clase ya está asignada en este bloque.');
  });

  it('reconoce códigos embebidos', () => {
    expect(
      humanizeScheduleMutationError(
        new HttpError(409, 'SCHEDULE_TEACHER_CONFLICT'),
      ),
    ).toBe('El docente ya tiene una clase asignada en este bloque.');
  });
});
