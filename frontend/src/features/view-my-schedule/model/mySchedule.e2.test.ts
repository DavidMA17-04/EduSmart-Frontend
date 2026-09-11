import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import {
  canAccessMySchedule,
  groupEntriesByCell,
  MY_SCHEDULE_PATH,
  nonClassSlotLabel,
  SCHEDULE_PERMISSIONS,
  SCHEDULE_WEEKDAYS,
  visibleSlotsForMatrix,
} from '@/features/manage-schedule';
import {
  MY_SCHEDULE_COPY,
  myScheduleApi,
  resolveMyScheduleCardVariant,
  resolveMyScheduleEntrySecondaryLabel,
} from '@/features/view-my-schedule';

function sampleEntry(
  overrides?: Partial<{
    offeringName: string;
    groupName: string;
    teacherName: string;
    timeSlotId: number;
  }>,
): ScheduleEntry {
  const timeSlotId = overrides?.timeSlotId ?? 1;
  return {
    entryId: 30,
    dayOfWeek: 1,
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
      teacher: {
        id: 520,
        name: overrides?.teacherName ?? 'Eneida Pérez',
      },
      group: {
        id: 3,
        name: overrides?.groupName ?? '7-1',
        gradeLevel: 7,
      },
      offering: {
        kind: 'SUBJECT',
        id: 1,
        name: overrides?.offeringName ?? 'Matemáticas',
        labelKind: 'Materia',
      },
      academicPeriod: { id: 1, name: 'Periodo' },
    },
  };
}

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

describe('my-schedule presentation (E2)', () => {
  it('Docente / TEACHER → teacher presentation', () => {
    expect(resolveMyScheduleCardVariant(['Docente'])).toBe('teacher');
    expect(resolveMyScheduleCardVariant(['TEACHER'])).toBe('teacher');
  });

  it('Estudiante / STUDENT → student presentation', () => {
    expect(resolveMyScheduleCardVariant(['Estudiante'])).toBe('student');
    expect(resolveMyScheduleCardVariant(['STUDENT'])).toBe('student');
  });

  it('10. dual role Docente+Estudiante → presentation Docente', () => {
    expect(resolveMyScheduleCardVariant(['Estudiante', 'Docente'])).toBe(
      'teacher',
    );
    expect(resolveMyScheduleCardVariant(['TEACHER', 'STUDENT'])).toBe('teacher');
  });

  it('4–6. student card: offering + teacher; group not secondary', () => {
    const entry = sampleEntry();
    expect(entry.teachingAssignment.offering.name).toBe('Matemáticas');
    expect(resolveMyScheduleEntrySecondaryLabel(entry, 'student')).toBe(
      'Eneida Pérez',
    );
    expect(resolveMyScheduleEntrySecondaryLabel(entry, 'student')).not.toBe(
      entry.teachingAssignment.group.name,
    );
  });

  it('7–9. teacher card: offering + group; teacher name not secondary', () => {
    const entry = sampleEntry();
    expect(entry.teachingAssignment.offering.name).toBe('Matemáticas');
    expect(resolveMyScheduleEntrySecondaryLabel(entry, 'teacher')).toBe('7-1');
    expect(resolveMyScheduleEntrySecondaryLabel(entry, 'teacher')).not.toBe(
      entry.teachingAssignment.teacher.name,
    );
  });

  it('3. route remains /admin/my-schedule + view_own access', () => {
    expect(MY_SCHEDULE_PATH).toBe('/admin/my-schedule');
    expect(
      canAccessMySchedule((c) => c === SCHEDULE_PERMISSIONS.viewOwn),
    ).toBe(true);
  });

  it('14–15. empty/error copy shared for student', () => {
    expect(MY_SCHEDULE_COPY.emptyDescription).toBe(
      'No tienes clases asignadas para este período.',
    );
    expect(MY_SCHEDULE_COPY.errorMessage).toBe('No se pudo cargar tu horario.');
    expect(MY_SCHEDULE_COPY.retryLabel).toBe('Reintentar');
    expect(MY_SCHEDULE_COPY.emptyDescription).not.toMatch(/grupo/i);
  });

  it('16. período: ACTIVE default + no hardcode group/year', () => {
    const hookSrc = readFileSync(
      resolve(__dirname, './useMySchedulePanel.ts'),
      'utf8',
    );
    expect(hookSrc).toContain("status === 'ACTIVE'");
    expect(hookSrc).not.toContain('2026');
    expect(hookSrc).not.toContain('7-1');
    expect(hookSrc).not.toContain('groupId');
  });

  it('12–13. desktop + mobile both pass card variant', () => {
    const panelSrc = readFileSync(
      resolve(
        __dirname,
        '../../../widgets/my-schedule-panel/ui/MySchedulePanel.tsx',
      ),
      'utf8',
    );
    expect(panelSrc).toContain('desktopMatrixWrap');
    expect(panelSrc).toContain('mobileDayList');
    expect(panelSrc).toContain('cellProps');
    expect(panelSrc).toContain('resolveMyScheduleEntrySecondaryLabel');
    expect(panelSrc).toContain('model.cardVariant');
  });

  it('17. BREAK/LUNCH sin teacher/group en celdas neutrales', () => {
    expect(nonClassSlotLabel('BREAK', 'Receso')).toMatch(/Receso/i);
    expect(nonClassSlotLabel('LUNCH', 'Almuerzo')).toMatch(/Almuerzo/i);
    const panelSrc = readFileSync(
      resolve(
        __dirname,
        '../../../widgets/my-schedule-panel/ui/MySchedulePanel.tsx',
      ),
      'utf8',
    );
    expect(panelSrc).toContain('neutralCell');
    expect(panelSrc).toContain('nonClassSlotLabel');
  });

  it('18. inactive referenced visible for student matrix', () => {
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
    const visible = visibleSlotsForMatrix(
      [inactiveEmpty, inactiveReferenced],
      [sampleEntry({ timeSlotId: 5 })],
    );
    expect(visible.map((s) => s.id)).toEqual([5]);
  });

  it('19. getMySchedule query never includes teacherId/groupId/userId', () => {
    const qs = myScheduleApi.toMyScheduleSearchParams({
      periodId: 1,
      dayOfWeek: 2,
    });
    expect(qs).toBe('?periodId=1&dayOfWeek=2');
    const leak = myScheduleApi.toMyScheduleSearchParams(
      Object.assign({ periodId: 1 }, {
        teacherId: 522,
        groupId: 1,
        userId: 2,
      }) as { periodId: number },
    );
    expect(leak).toBe('?periodId=1');
    expect(leak).not.toMatch(/teacherId|groupId|userId/);
  });

  it('mobile day keys still group by day:slot', () => {
    const byCell = groupEntriesByCell([
      { ...sampleEntry(), entryId: 1, dayOfWeek: 1 },
      { ...sampleEntry(), entryId: 2, dayOfWeek: 3 },
    ]);
    expect(byCell.get('1:1')?.length).toBe(1);
    expect(byCell.get('3:1')?.length).toBe(1);
    expect(SCHEDULE_WEEKDAYS).toHaveLength(5);
  });
});
