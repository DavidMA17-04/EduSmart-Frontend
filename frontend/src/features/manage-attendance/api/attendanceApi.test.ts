import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/shared/api/httpClient';
import { attendanceApi } from './attendanceApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

describe('attendanceApi', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('1. listAttendanceGroups → GET /attendance/groups', async () => {
    const data = [
      { groupId: 3, name: '7-1', gradeLevel: 7, sectionId: 2 },
    ];
    mockedHttp.mockResolvedValueOnce({ success: true, data });

    await expect(attendanceApi.listAttendanceGroups()).resolves.toEqual(data);
    expect(mockedHttp).toHaveBeenCalledWith('/attendance/groups', undefined);
  });

  it('2. getAvailableOfferings(3) → GET .../groups/3/available-offerings', async () => {
    const data = [
      {
        teachingAssignmentId: 4,
        offeringKind: 'SUBJECT',
        offeringId: 1,
        name: 'Matemáticas',
        labelKind: 'Asignatura',
      },
    ];
    mockedHttp.mockResolvedValueOnce({ success: true, data });

    await expect(attendanceApi.getAvailableOfferings(3)).resolves.toEqual(data);
    expect(mockedHttp).toHaveBeenCalledWith(
      '/attendance/groups/3/available-offerings',
      undefined,
    );
  });

  it('3. createAttendanceSession POST body correcto', async () => {
    const created = {
      id: 7,
      teachingAssignmentId: 4,
      sessionDate: '2026-09-11',
      startedAt: '2026-09-11T16:00:00.000Z',
      closedAt: null,
      status: 'OPEN',
      createdByUserId: 505,
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data: created });

    const input = { groupId: 3, teachingAssignmentId: 4 };
    await expect(attendanceApi.createAttendanceSession(input)).resolves.toEqual(
      created,
    );
    expect(mockedHttp).toHaveBeenCalledWith('/attendance/sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  it('4. getAttendanceSession(7) → GET /attendance/sessions/7', async () => {
    const data = {
      sessionId: 7,
      status: 'OPEN',
      sessionDate: '2026-09-11',
      startedAt: '2026-09-11T16:00:00.000Z',
      closedAt: null,
      teachingAssignmentId: 4,
      group: { id: 3, name: '7-1', gradeLevel: 7 },
      offering: {
        kind: 'SUBJECT',
        id: 1,
        name: 'Matemáticas',
        labelKind: 'Asignatura',
      },
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data });

    await expect(attendanceApi.getAttendanceSession(7)).resolves.toEqual(data);
    expect(mockedHttp).toHaveBeenCalledWith(
      '/attendance/sessions/7',
      undefined,
    );
  });

  it('5. getAttendanceRoster(7) → GET .../7/roster', async () => {
    const data = [
      {
        userId: 2,
        nationalId: 'x',
        fullName: 'Estudiante A',
        attendance: null,
      },
    ];
    mockedHttp.mockResolvedValueOnce({ success: true, data });

    await expect(attendanceApi.getAttendanceRoster(7)).resolves.toEqual(data);
    expect(mockedHttp).toHaveBeenCalledWith(
      '/attendance/sessions/7/roster',
      undefined,
    );
  });

  it('6. saveAttendanceRecords PUT body exacto', async () => {
    const input = {
      records: [{ studentUserId: 2, status: 'PRESENT' as const }],
    };
    const data = [
      {
        id: 1,
        attendanceSessionId: 7,
        studentUserId: 2,
        status: 'PRESENT',
        registrationMethod: 'MANUAL',
        registeredAt: '2026-09-11T16:01:00.000Z',
        registeredByUserId: 505,
        updatedAt: '2026-09-11T16:01:00.000Z',
        updatedByUserId: null,
      },
    ];
    mockedHttp.mockResolvedValueOnce({ success: true, data });

    await expect(
      attendanceApi.saveAttendanceRecords(7, input),
    ).resolves.toEqual(data);
    expect(mockedHttp).toHaveBeenCalledWith('/attendance/sessions/7/records', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  });

  it('7. closeAttendanceSession POST /attendance/sessions/7/close', async () => {
    const data = {
      id: 7,
      teachingAssignmentId: 4,
      sessionDate: '2026-09-11',
      startedAt: '2026-09-11T16:00:00.000Z',
      closedAt: '2026-09-11T17:00:00.000Z',
      status: 'CLOSED',
      createdByUserId: 505,
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data });

    await expect(attendanceApi.closeAttendanceSession(7)).resolves.toEqual(data);
    expect(mockedHttp).toHaveBeenCalledWith('/attendance/sessions/7/close', {
      method: 'POST',
    });
  });

  it('8. response data se unwrappea del envelope', async () => {
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: [{ groupId: 1, name: 'G', gradeLevel: 8, sectionId: 1 }],
    });
    const result = await attendanceApi.listAttendanceGroups();
    expect(result[0].groupId).toBe(1);
  });

  it('9. HttpError se propaga; API no lo oculta', async () => {
    mockedHttp.mockRejectedValueOnce(new HttpError(403, 'Forbidden'));
    await expect(attendanceApi.getAttendanceSession(7)).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  it('F. getScheduleContext → GET /attendance/schedule-context', async () => {
    const data = {
      date: '2026-09-14',
      dayOfWeek: 1,
      occurrences: [],
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data });
    await expect(attendanceApi.getScheduleContext()).resolves.toEqual(data);
    expect(mockedHttp).toHaveBeenCalledWith(
      '/attendance/schedule-context',
      undefined,
    );
  });

  it('F. getScheduleContext periodId query', async () => {
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { date: '2026-09-14', dayOfWeek: 1, occurrences: [] },
    });
    await attendanceApi.getScheduleContext({ periodId: 1 });
    expect(mockedHttp).toHaveBeenCalledWith(
      '/attendance/schedule-context?periodId=1',
      undefined,
    );
  });

  it('F. from-schedule POST solo scheduleEntryId', async () => {
    const created = {
      id: 12,
      teachingAssignmentId: 5,
      scheduleEntryId: 10,
      sessionDate: '2026-09-14',
      startedAt: '2026-09-14T13:00:00.000Z',
      closedAt: null,
      status: 'OPEN' as const,
      createdByUserId: 520,
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data: created });
    await expect(
      attendanceApi.createAttendanceSessionFromSchedule({
        scheduleEntryId: 10,
      }),
    ).resolves.toEqual(created);
    expect(mockedHttp).toHaveBeenCalledWith(
      '/attendance/sessions/from-schedule',
      {
        method: 'POST',
        body: JSON.stringify({ scheduleEntryId: 10 }),
      },
    );
    const body = JSON.parse(
      String((mockedHttp.mock.calls[0]?.[1] as { body?: string })?.body),
    );
    expect(body).toEqual({ scheduleEntryId: 10 });
    expect(body).not.toHaveProperty('groupId');
    expect(body).not.toHaveProperty('teachingAssignmentId');
  });
});

describe('attendance contract sample shapes', () => {
  it('session detail CLOSED includes closedAt; OPEN uses null', () => {
    const open = {
      sessionId: 1,
      status: 'OPEN' as const,
      sessionDate: '2026-09-11',
      startedAt: '2026-09-11T16:00:00.000Z',
      closedAt: null,
      teachingAssignmentId: 4,
      group: { id: 3, name: '7-1', gradeLevel: 7 },
      offering: {
        kind: 'SUBJECT' as const,
        id: 1,
        name: 'Mate',
        labelKind: 'Asignatura',
      },
    };
    const closed = {
      ...open,
      status: 'CLOSED' as const,
      closedAt: '2026-09-11T17:00:00.000Z',
    };
    expect(open.closedAt).toBeNull();
    expect(closed.closedAt).toBeTruthy();
  });

  it('offering kinds SUBJECT / WORKSHOP / SPECIALTY', () => {
    const kinds = [
      'SUBJECT',
      'EXPLORATORY_WORKSHOP',
      'TECHNICAL_SPECIALTY',
    ] as const;
    expect(kinds).toHaveLength(3);
  });

  it('roster attendance null vs PRESENT/ABSENT/LATE', () => {
    const unmarked = { userId: 1, nationalId: 'n', fullName: 'A', attendance: null };
    const present = {
      ...unmarked,
      attendance: {
        id: 1,
        status: 'PRESENT' as const,
        registrationMethod: 'MANUAL' as const,
        registeredAt: '2026-09-11T16:01:00.000Z',
        registeredByUserId: 505,
        updatedAt: '2026-09-11T16:01:00.000Z',
        updatedByUserId: null,
      },
    };
    expect(unmarked.attendance).toBeNull();
    expect(['PRESENT', 'ABSENT', 'LATE']).toContain(present.attendance.status);
  });
});
