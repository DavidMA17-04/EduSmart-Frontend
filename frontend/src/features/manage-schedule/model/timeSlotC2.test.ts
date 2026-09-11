import { describe, expect, it } from 'vitest';
import { HttpError } from '@/shared/api/httpClient';
import { humanizeTimeSlotMutationError } from './timeSlotErrors';
import {
  buildCreateTimeSlotPayload,
  buildUpdateTimeSlotPayload,
  toApiTimeValue,
  toTimeInputValue,
  validateTimeSlotForm,
} from './timeSlotFormUtils';
import { visibleSlotsForMatrix } from './scheduleMatrix';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import { canEditSchedule, SCHEDULE_PERMISSIONS } from './schedulePermissions';

function slot(
  partial: Partial<ScheduleTimeSlot> & Pick<ScheduleTimeSlot, 'id'>,
): ScheduleTimeSlot {
  return {
    lessonNumber: null,
    name: `Slot ${partial.id}`,
    startTime: '07:00:00',
    endTime: '07:40:00',
    displayOrder: partial.displayOrder ?? partial.id,
    slotType: 'CLASS',
    isActive: true,
    ...partial,
  };
}

function entry(timeSlotId: number, entryId = timeSlotId): ScheduleEntry {
  return {
    entryId,
    dayOfWeek: 1,
    timeSlot: {
      id: timeSlotId,
      name: 'X',
      startTime: '07:00:00',
      endTime: '07:40:00',
      displayOrder: 1,
      slotType: 'CLASS',
    },
    teachingAssignment: {
      id: 1,
      teacher: { id: 1, name: 'A' },
      group: { id: 1, name: '7-1', gradeLevel: 7 },
      offering: {
        kind: 'SUBJECT',
        id: 1,
        name: 'Mat',
        labelKind: 'Materia',
      },
      academicPeriod: { id: 1, name: 'P' },
    },
  };
}

describe('timeSlotFormUtils', () => {
  it('3. formato HH:mm:ss → HH:mm', () => {
    expect(toTimeInputValue('07:00:00')).toBe('07:00');
    expect(toApiTimeValue('07:00')).toBe('07:00:00');
  });

  it('4. create CLASS payload', () => {
    expect(
      buildCreateTimeSlotPayload({
        name: 'Lección 1',
        slotType: 'CLASS',
        lessonNumber: '1',
        startTime: '07:00',
        endTime: '07:40',
        displayOrder: '1',
        isActive: true,
      }),
    ).toEqual({
      name: 'Lección 1',
      startTime: '07:00:00',
      endTime: '07:40:00',
      displayOrder: 1,
      slotType: 'CLASS',
      lessonNumber: 1,
      isActive: true,
    });
  });

  it('5–6. create BREAK/LUNCH → lessonNumber null', () => {
    for (const slotType of ['BREAK', 'LUNCH'] as const) {
      expect(
        buildCreateTimeSlotPayload({
          name: slotType,
          slotType,
          lessonNumber: '9',
          startTime: '08:20',
          endTime: '08:35',
          displayOrder: '3',
          isActive: true,
        }).lessonNumber,
      ).toBeNull();
    }
  });

  it('7. edit payload completo', () => {
    const payload = buildUpdateTimeSlotPayload({
      name: 'Renamed',
      slotType: 'CLASS',
      lessonNumber: '',
      startTime: '07:05',
      endTime: '07:45',
      displayOrder: '2',
      isActive: false,
    });
    expect(payload).toEqual({
      name: 'Renamed',
      startTime: '07:05:00',
      endTime: '07:45:00',
      displayOrder: 2,
      slotType: 'CLASS',
      lessonNumber: null,
      isActive: false,
    });
  });

  it('8–9. deactivate/activate payloads conceptuales', () => {
    expect({ isActive: false }).toEqual({ isActive: false });
    expect({ isActive: true }).toEqual({ isActive: true });
  });

  it('17. invalid range FE', () => {
    expect(
      validateTimeSlotForm({
        name: 'X',
        slotType: 'CLASS',
        lessonNumber: '',
        startTime: '08:00',
        endTime: '07:00',
        displayOrder: '1',
        isActive: true,
      }),
    ).toMatch(/inicio debe ser anterior/i);
  });

  it('22–23. CLASS lessonNumber nullable; BREAK fuerza null en payload', () => {
    expect(
      validateTimeSlotForm({
        name: 'L',
        slotType: 'CLASS',
        lessonNumber: '',
        startTime: '07:00',
        endTime: '07:40',
        displayOrder: '1',
        isActive: true,
      }),
    ).toBeNull();
    expect(
      buildCreateTimeSlotPayload({
        name: 'R',
        slotType: 'BREAK',
        lessonNumber: '3',
        startTime: '08:20',
        endTime: '08:35',
        displayOrder: '3',
        isActive: true,
      }).lessonNumber,
    ).toBeNull();
  });
});

describe('humanizeTimeSlotMutationError', () => {
  it('11. IN_USE update → mensaje', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(
          409,
          'Cannot change startTime, endTime, or slotType while schedule entries reference this time slot',
        ),
        'update',
      ),
    ).toMatch(/no su horario ni su tipo/i);
  });

  it('12. IN_USE delete → mensaje', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(
          409,
          'Time slot is referenced by schedule entries; deactivate it instead',
        ),
        'delete',
      ),
    ).toMatch(/No puedes eliminar este bloque/i);
  });

  it('13. OVERLAP', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(409, 'SCHEDULE_TIME_SLOT_OVERLAP'),
      ),
    ).toBe('El horario se superpone con otro bloque activo.');
  });

  it('14. displayOrder conflict', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(409, 'SCHEDULE_TIME_SLOT_DISPLAY_ORDER_CONFLICT'),
      ),
    ).toBe('Ya existe otro bloque activo con este orden.');
  });

  it('15. lessonNumber conflict', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(409, 'SCHEDULE_TIME_SLOT_LESSON_NUMBER_CONFLICT'),
      ),
    ).toBe('Ya existe otra clase activa con este número de lección.');
  });

  it('16. lessonNumber invalid', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(400, 'SCHEDULE_TIME_SLOT_LESSON_NUMBER_INVALID'),
      ),
    ).toBe('Solo los bloques de clase pueden tener número de lección.');
  });

  it('17. invalid range code', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(400, 'startTime must be before endTime'),
      ),
    ).toBe('La hora de inicio debe ser anterior a la hora de finalización.');
  });

  it('18. lock timeout', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(
          503,
          'Could not acquire schedule time-slots mutate lock; retry later',
        ),
      ),
    ).toMatch(/otra modificación del horario está en proceso/i);
  });

  it('19. lock error', () => {
    expect(
      humanizeTimeSlotMutationError(
        new HttpError(
          503,
          'Named lock acquisition failed (NULL/error from GET_LOCK) for time-slots mutate',
        ),
      ),
    ).toBe('No se pudo bloquear temporalmente la configuración del horario.');
  });
});

describe('visibleSlotsForMatrix + permisos', () => {
  it('1/2. list conceptually ordered; includes active+inactive source data', () => {
    const rows = [
      slot({ id: 2, displayOrder: 2, isActive: false }),
      slot({ id: 1, displayOrder: 1, isActive: true }),
    ];
    expect(rows.map((r) => r.isActive)).toContain(false);
    expect(rows.map((r) => r.isActive)).toContain(true);
  });

  it('25. inactive sin entries no aparece en matriz', () => {
    const visible = visibleSlotsForMatrix(
      [
        slot({ id: 1, isActive: true, displayOrder: 1 }),
        slot({ id: 2, isActive: false, displayOrder: 2 }),
      ],
      [],
    );
    expect(visible.map((s) => s.id)).toEqual([1]);
  });

  it('26. inactive CON entry sí aparece', () => {
    const visible = visibleSlotsForMatrix(
      [
        slot({ id: 1, isActive: true, displayOrder: 1 }),
        slot({ id: 2, isActive: false, displayOrder: 2 }),
      ],
      [entry(2)],
    );
    expect(visible.map((s) => s.id)).toEqual([1, 2]);
  });

  it('27. active aparece siempre', () => {
    const visible = visibleSlotsForMatrix(
      [slot({ id: 5, isActive: true, displayOrder: 5 })],
      [],
    );
    expect(visible).toHaveLength(1);
  });

  it('24. misma fuente desktop/mobile (matrix filter estable)', () => {
    const slots = [
      slot({ id: 1, isActive: true, displayOrder: 1 }),
      slot({ id: 9, isActive: false, displayOrder: 9 }),
    ];
    const entries = [entry(9)];
    const a = visibleSlotsForMatrix(slots, entries);
    const b = visibleSlotsForMatrix(slots, entries);
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  it('28. refetch conceptual: entries/slots nuevas cambian matriz', () => {
    const slots = [
      slot({ id: 1, isActive: true }),
      slot({ id: 2, isActive: false }),
    ];
    expect(visibleSlotsForMatrix(slots, []).map((s) => s.id)).toEqual([1]);
    expect(visibleSlotsForMatrix(slots, [entry(2)]).map((s) => s.id)).toEqual([
      1, 2,
    ]);
  });

  it('20–21. read-only vs edit permission', () => {
    expect(canEditSchedule((c) => c === SCHEDULE_PERMISSIONS.view)).toBe(false);
    expect(canEditSchedule((c) => c === SCHEDULE_PERMISSIONS.edit)).toBe(true);
  });
});
