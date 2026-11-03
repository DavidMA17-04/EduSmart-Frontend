import { describe, expect, it } from 'vitest';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import { buildScheduleExportPayload, buildScheduleSheetRows, scheduleCellText } from './scheduleExport';

function slot(partial: Partial<ScheduleTimeSlot> & Pick<ScheduleTimeSlot, 'id'>): ScheduleTimeSlot {
  return {
    id: partial.id,
    name: partial.name ?? '',
    slotType: partial.slotType ?? 'CLASS',
    startTime: partial.startTime ?? '07:00:00',
    endTime: partial.endTime ?? '07:40:00',
    displayOrder: partial.displayOrder ?? 1,
    lessonNumber: partial.lessonNumber ?? 1,
    isActive: partial.isActive ?? true,
  };
}

function entry(offering: string, group: string, teacher: string): ScheduleEntry {
  return {
    entryId: 1,
    dayOfWeek: 1,
    timeSlot: {
      id: 1,
      name: '',
      startTime: '07:00:00',
      endTime: '07:40:00',
      displayOrder: 1,
      slotType: 'CLASS',
    },
    teachingAssignment: {
      id: 1,
      teacher: { id: 1, name: teacher },
      group: { id: 1, name: group, gradeLevel: 10 },
      offering: { kind: 'SUBJECT', id: 1, name: offering, labelKind: 'Materia' },
      academicPeriod: { id: 1, name: '2026' },
    },
  };
}

describe('scheduleExport', () => {
  it('formats class and break cells', () => {
    const classSlot = slot({ id: 1 });
    const breakSlot = slot({ id: 2, slotType: 'BREAK', name: 'Receso' });
    const map = new Map<string, ScheduleEntry[]>([
      ['1:1', [entry('Matemáticas', '10-A', 'Ana Pérez')]],
    ]);
    expect(scheduleCellText(classSlot, 1, map, true, true)).toBe(
      'Matemáticas · 10-A · Ana Pérez',
    );
    expect(scheduleCellText(classSlot, 2, map, true, true)).toBe('—');
    expect(scheduleCellText(breakSlot, 1, map, true, true)).toBe('Receso');
  });

  it('builds a sheet with weekday columns for the filtered matrix', () => {
    const rows = buildScheduleSheetRows({
      periodLabel: '2026',
      teacherLabel: 'Todos',
      groupLabel: '10-A',
      showTeacher: true,
      showGroup: false,
      slots: [slot({ id: 1, startTime: '07:00:00', endTime: '07:40:00' })],
      entriesByCell: new Map([['1:1', [entry('Matemáticas', '10-A', 'Ana Pérez')]]]),
    });
    expect(rows[0]).toEqual(['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
    expect(rows[1][0]).toContain('07:00');
    expect(rows[1][1]).toBe('Matemáticas · Ana Pérez');
    expect(rows[1][2]).toBe('—');
  });

  it('builds the export payload: subject on top, group/teacher as detail, breaks without entries', () => {
    const classSlot = slot({ id: 1, name: 'Lección 1' });
    const breakSlot = slot({ id: 2, slotType: 'BREAK', name: '', startTime: '08:20:00', endTime: '08:35:00' });
    const payload = buildScheduleExportPayload({
      periodLabel: '2026',
      teacherLabel: 'Todos',
      groupLabel: '10-A',
      showTeacher: true,
      showGroup: false,
      slots: [classSlot, breakSlot],
      entriesByCell: new Map([['3:1', [entry('Matemáticas', '10-A', 'Ana Pérez')]]]),
    });
    expect(payload.rows).toHaveLength(2);
    expect(payload.rows[0]).toMatchObject({ time: '07:00–07:40', label: 'Lección 1', kind: 'CLASS' });
    expect(payload.rows[0].days).toHaveLength(5);
    expect(payload.rows[0].days[2].entries).toEqual([{ title: 'Matemáticas', detail: 'Ana Pérez' }]);
    expect(payload.rows[0].days[0].entries).toEqual([]);
    expect(payload.rows[1]).toMatchObject({ time: '08:20–08:35', label: 'Receso', kind: 'BREAK' });
    expect(payload.rows[1].days.every((day) => day.entries.length === 0)).toBe(true);
  });
});
