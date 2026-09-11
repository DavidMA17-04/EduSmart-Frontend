import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AttendanceScheduleContext } from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import {
  buildFromSchedulePayload,
  humanizeFromScheduleError,
  indexOccurrencesByEntryId,
  MY_SCHEDULE_ATTENDANCE_COPY,
  resolveMyScheduleAttendanceCta,
  shouldFetchAttendanceScheduleContext,
} from './myScheduleAttendance';

const context: AttendanceScheduleContext = {
  date: '2026-09-14',
  dayOfWeek: 1,
  occurrences: [
    {
      anchorEntryId: 10,
      entryIds: [10, 11],
      teachingAssignmentId: 5,
      startTime: '07:00:00',
      endTime: '08:20:00',
      withinStartWindow: true,
      attendanceSession: null,
    },
    {
      anchorEntryId: 20,
      entryIds: [20],
      teachingAssignmentId: 8,
      startTime: '09:00:00',
      endTime: '09:40:00',
      withinStartWindow: false,
      attendanceSession: { id: 3, status: 'OPEN' },
    },
    {
      anchorEntryId: 30,
      entryIds: [30],
      teachingAssignmentId: 8,
      startTime: '10:00:00',
      endTime: '10:40:00',
      withinStartWindow: false,
      attendanceSession: { id: 4, status: 'CLOSED' },
    },
  ],
};

describe('my-schedule attendance integration (F)', () => {
  it('1/2. shouldFetch: teacher+view yes; student no', () => {
    expect(
      shouldFetchAttendanceScheduleContext({
        variant: 'teacher',
        canViewAttendance: true,
      }),
    ).toBe(true);
    expect(
      shouldFetchAttendanceScheduleContext({
        variant: 'student',
        canViewAttendance: true,
      }),
    ).toBe(false);
    expect(
      shouldFetchAttendanceScheduleContext({
        variant: 'teacher',
        canViewAttendance: false,
      }),
    ).toBe(false);
  });

  it('3. no session + within window → Tomar on anchor', () => {
    const map = indexOccurrencesByEntryId(context);
    expect(
      resolveMyScheduleAttendanceCta({
        entryId: 10,
        variant: 'teacher',
        canViewAttendance: true,
        canCreateAttendance: true,
        occurrence: map.get(10),
      }),
    ).toMatchObject({
      kind: 'take',
      label: MY_SCHEDULE_ATTENDANCE_COPY.take,
      scheduleEntryId: 10,
    });
  });

  it('4. fuera ventana → no Tomar', () => {
    const occurrence = {
      ...context.occurrences[0],
      withinStartWindow: false,
      attendanceSession: null,
    };
    expect(
      resolveMyScheduleAttendanceCta({
        entryId: 10,
        variant: 'teacher',
        canViewAttendance: true,
        canCreateAttendance: true,
        occurrence,
      }),
    ).toBeNull();
  });

  it('5. OPEN → Continuar', () => {
    const map = indexOccurrencesByEntryId(context);
    expect(
      resolveMyScheduleAttendanceCta({
        entryId: 20,
        variant: 'teacher',
        canViewAttendance: true,
        canCreateAttendance: true,
        occurrence: map.get(20),
      }),
    ).toMatchObject({
      kind: 'continue',
      sessionId: 3,
      label: MY_SCHEDULE_ATTENDANCE_COPY.continue,
    });
  });

  it('6. CLOSED → Ver + registrada', () => {
    const map = indexOccurrencesByEntryId(context);
    expect(
      resolveMyScheduleAttendanceCta({
        entryId: 30,
        variant: 'teacher',
        canViewAttendance: true,
        canCreateAttendance: false,
        occurrence: map.get(30),
      }),
    ).toMatchObject({
      kind: 'view',
      sessionId: 4,
      badgeLabel: MY_SCHEDULE_ATTENDANCE_COPY.registered,
    });
  });

  it('8. payload solo scheduleEntryId', () => {
    expect(buildFromSchedulePayload(10)).toEqual({ scheduleEntryId: 10 });
    expect(Object.keys(buildFromSchedulePayload(10))).toEqual([
      'scheduleEntryId',
    ]);
  });

  it('12–13. multi-block: CTA solo anchor; miembro comparte occurrence', () => {
    const map = indexOccurrencesByEntryId(context);
    expect(map.get(10)).toBe(map.get(11));
    expect(
      resolveMyScheduleAttendanceCta({
        entryId: 11,
        variant: 'teacher',
        canViewAttendance: true,
        canCreateAttendance: true,
        occurrence: map.get(11),
      }),
    ).toBeNull();
  });

  it('14. student nunca CTA', () => {
    const map = indexOccurrencesByEntryId(context);
    expect(
      resolveMyScheduleAttendanceCta({
        entryId: 10,
        variant: 'student',
        canViewAttendance: true,
        canCreateAttendance: true,
        occurrence: map.get(10),
      }),
    ).toBeNull();
  });

  it('15. sin attendance.create → no Tomar', () => {
    const map = indexOccurrencesByEntryId(context);
    expect(
      resolveMyScheduleAttendanceCta({
        entryId: 10,
        variant: 'teacher',
        canViewAttendance: true,
        canCreateAttendance: false,
        occurrence: map.get(10),
      }),
    ).toBeNull();
  });

  it('17–18. wrong day / outside window UX', () => {
    expect(
      humanizeFromScheduleError(
        new HttpError(400, 'ATTENDANCE_SCHEDULE_WRONG_DAY'),
      ),
    ).toBe(MY_SCHEDULE_ATTENDANCE_COPY.wrongDay);
    expect(
      humanizeFromScheduleError(
        new HttpError(400, 'ATTENDANCE_OUTSIDE_SCHEDULE_WINDOW'),
      ),
    ).toBe(MY_SCHEDULE_ATTENDANCE_COPY.outsideWindow);
  });

  it('7/9–11/19–20. panel wires take/continue/view + desktop/mobile', () => {
    const panelSrc = readFileSync(
      resolve(
        __dirname,
        '../../../widgets/my-schedule-panel/ui/MySchedulePanel.tsx',
      ),
      'utf8',
    );
    expect(panelSrc).toContain('createAttendanceSessionFromSchedule');
    expect(panelSrc).toContain('buildFromSchedulePayload');
    expect(panelSrc).toContain('ATTENDANCE_SESSION_PATH');
    expect(panelSrc).toContain('resolveSessionPathAfterCreate');
    expect(panelSrc).toContain('desktopMatrixWrap');
    expect(panelSrc).toContain('mobileDayList');
    expect(panelSrc).toContain('my-schedule-attendance-cta');
    expect(panelSrc).not.toContain('teacherId');
    expect(panelSrc).not.toContain('groupId');
  });

  it('16. context failure does not block schedule (soft notice)', () => {
    const panelSrc = readFileSync(
      resolve(
        __dirname,
        '../../../widgets/my-schedule-panel/ui/MySchedulePanel.tsx',
      ),
      'utf8',
    );
    const hookSrc = readFileSync(
      resolve(__dirname, './useMySchedulePanel.ts'),
      'utf8',
    );
    expect(hookSrc).toContain('shouldFetchAttendanceScheduleContext');
    expect(hookSrc).toContain('getScheduleContext');
    expect(panelSrc).toContain('my-schedule-attendance-context-error');
    expect(panelSrc).toContain('MY_SCHEDULE_ATTENDANCE_COPY.contextFailed');
  });

  it('21. manual attendance flow still present', () => {
    const hub = readFileSync(
      resolve(
        __dirname,
        '../../../widgets/attendance-hub-panel/ui/AttendanceHubPanel.tsx',
      ),
      'utf8',
    );
    expect(hub).toContain('ATTENDANCE_NEW_PATH');
    expect(hub).toMatch(/Nueva clase/i);
  });
});
