import { describe, expect, it } from 'vitest';
import {
  canAccessMySchedule,
  MY_SCHEDULE_PATH,
  SCHEDULE_PERMISSIONS,
} from '@/features/manage-schedule';
import { MY_SCHEDULE_COPY } from '@/features/view-my-schedule';
import {
  groupEntriesByCell,
  nonClassSlotLabel,
  SCHEDULE_WEEKDAYS,
  visibleSlotsForMatrix,
} from '@/features/manage-schedule';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function slot(
  partial: Partial<ScheduleTimeSlot> & Pick<ScheduleTimeSlot, 'id' | 'slotType'>,
): ScheduleTimeSlot {
  return {
    lessonNumber: partial.slotType === 'CLASS' ? 1 : null,
    name: partial.name ?? 'S',
    startTime: '07:00:00',
    endTime: '07:40:00',
    displayOrder: partial.displayOrder ?? partial.id,
    isActive: partial.isActive ?? true,
    ...partial,
  };
}

function entry(
  entryId: number,
  dayOfWeek: number,
  timeSlotId: number,
  offeringName = 'Matemática',
  groupName = '7-1',
): ScheduleEntry {
  return {
    entryId,
    dayOfWeek,
    timeSlot: {
      id: timeSlotId,
      name: 'L1',
      startTime: '07:00:00',
      endTime: '07:40:00',
      displayOrder: timeSlotId,
      slotType: 'CLASS',
    },
    teachingAssignment: {
      id: 5,
      teacher: { id: 520, name: 'NO_DEBE_APARECER_EN_CARD' },
      group: { id: 3, name: groupName, gradeLevel: 7 },
      offering: {
        kind: 'SUBJECT',
        id: 1,
        name: offeringName,
        labelKind: 'Materia',
      },
      academicPeriod: { id: 1, name: 'Periodo' },
    },
  };
}

describe('my-schedule access / copy (D2)', () => {
  it('11. título Mi horario', () => {
    expect(MY_SCHEDULE_COPY.title).toBe('Mi horario');
    expect(MY_SCHEDULE_PATH).toBe('/admin/my-schedule');
  });

  it('canAccessMySchedule: view_own sin view', () => {
    expect(
      canAccessMySchedule((c) => c === SCHEDULE_PERMISSIONS.viewOwn),
    ).toBe(true);
  });

  it('canAccessMySchedule: con view (Admin) → false', () => {
    expect(
      canAccessMySchedule(
        (c) =>
          c === SCHEDULE_PERMISSIONS.viewOwn || c === SCHEDULE_PERMISSIONS.view,
      ),
    ).toBe(false);
  });

  it('10. sin view_own → false', () => {
    expect(canAccessMySchedule(() => false)).toBe(false);
  });
});

describe('my-schedule matrix behavior (D2)', () => {
  const classActive = slot({ id: 1, slotType: 'CLASS', displayOrder: 1 });
  const breakSlot = slot({
    id: 2,
    slotType: 'BREAK',
    name: 'Receso',
    displayOrder: 2,
  });
  const lunchSlot = slot({
    id: 3,
    slotType: 'LUNCH',
    name: 'Almuerzo',
    displayOrder: 3,
  });
  const inactiveEmpty = slot({
    id: 4,
    slotType: 'CLASS',
    isActive: false,
    displayOrder: 4,
  });
  const inactiveReferenced = slot({
    id: 5,
    slotType: 'CLASS',
    isActive: false,
    displayOrder: 5,
  });

  const entries = [entry(10, 1, 1), entry(11, 1, 5)];

  it('16/24. matrix slots ordenados y own entries', () => {
    const visible = visibleSlotsForMatrix(
      [inactiveEmpty, lunchSlot, classActive, breakSlot, inactiveReferenced],
      entries,
    );
    expect(visible.map((s) => s.id)).toEqual([1, 2, 3, 5]);
    const byCell = groupEntriesByCell(entries);
    expect(byCell.get('1:1')?.map((e) => e.entryId)).toEqual([10]);
    expect(byCell.get('1:5')?.map((e) => e.entryId)).toEqual([11]);
  });

  it('20–21. BREAK/LUNCH labels', () => {
    expect(nonClassSlotLabel('BREAK', 'Receso')).toMatch(/Receso/i);
    expect(nonClassSlotLabel('LUNCH', 'Almuerzo')).toMatch(/Almuerzo/i);
  });

  it('22–23. inactive referenced visible; empty oculto', () => {
    const visible = visibleSlotsForMatrix(
      [inactiveEmpty, inactiveReferenced],
      [entry(1, 2, 5)],
    );
    expect(visible.map((s) => s.id)).toEqual([5]);
  });

  it('17. mobile day usa misma data (filter by day key)', () => {
    const byCell = groupEntriesByCell([
      entry(1, 1, 1),
      entry(2, 3, 1),
    ]);
    expect(byCell.get(`1:1`)?.length).toBe(1);
    expect(byCell.get(`3:1`)?.length).toBe(1);
    expect(SCHEDULE_WEEKDAYS).toHaveLength(5);
  });

  it('18–19. offering + secondary via presentation helper (teacher→group)', () => {
    const panelSrc = readFileSync(
      resolve(__dirname, '../../../widgets/my-schedule-panel/ui/MySchedulePanel.tsx'),
      'utf8',
    );
    expect(panelSrc).toContain('ta.offering.name');
    expect(panelSrc).toContain('resolveMyScheduleEntrySecondaryLabel');
    expect(panelSrc).toContain('labelKind');
    expect(panelSrc).not.toContain('+ Asignar');
    expect(panelSrc).not.toContain('Editar');
    expect(panelSrc).not.toContain('Quitar');
    expect(panelSrc).not.toContain('Configurar bloques');
  });

  it('12–15. panel read-only (sin mutaciones admin)', () => {
    const panelSrc = readFileSync(
      resolve(__dirname, '../../../widgets/my-schedule-panel/ui/MySchedulePanel.tsx'),
      'utf8',
    );
    expect(panelSrc).not.toMatch(/Asignar/);
    expect(panelSrc).not.toMatch(/onEdit|onRemove|canEdit/);
    expect(panelSrc).not.toMatch(/ScheduleTimeSlotsPanel|ScheduleEntryForm/);
  });

  it('25–28. empty / period copy sin hardcode 2026', () => {
    expect(MY_SCHEDULE_COPY.emptyDescription).toContain('período');
    expect(MY_SCHEDULE_COPY.emptyDescription).not.toContain('2026');
    const hookSrc = readFileSync(
      resolve(__dirname, '../model/useMySchedulePanel.ts'),
      'utf8',
    );
    expect(hookSrc).not.toContain('2026');
    expect(hookSrc).toContain("status === 'ACTIVE'");
    expect(hookSrc).toContain('getMySchedule');
  });

  it('29–31. empty vs error copy + retry', () => {
    expect(MY_SCHEDULE_COPY.errorMessage).toBe('No se pudo cargar tu horario.');
    expect(MY_SCHEDULE_COPY.retryLabel).toBe('Reintentar');
    expect(MY_SCHEDULE_COPY.emptyDescription).not.toEqual(
      MY_SCHEDULE_COPY.errorMessage,
    );
  });
});
