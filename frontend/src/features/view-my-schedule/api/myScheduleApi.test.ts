import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getMySchedule, myScheduleApi } from './myScheduleApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

describe('getMySchedule API (D2)', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('1. getMySchedule → GET /schedule/my-schedule', async () => {
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { timeSlots: [], entries: [] },
    });
    await expect(getMySchedule()).resolves.toEqual({
      timeSlots: [],
      entries: [],
    });
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/my-schedule', undefined);
  });

  it('2. periodId se serializa correctamente', async () => {
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { timeSlots: [], entries: [] },
    });
    await getMySchedule({ periodId: 3 });
    expect(mockedHttp).toHaveBeenCalledWith(
      '/schedule/my-schedule?periodId=3',
      undefined,
    );
  });

  it('3. dayOfWeek se serializa correctamente', async () => {
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { timeSlots: [], entries: [] },
    });
    await getMySchedule({ dayOfWeek: 2 });
    expect(mockedHttp).toHaveBeenCalledWith(
      '/schedule/my-schedule?dayOfWeek=2',
      undefined,
    );
  });

  it('4. NO envía teacherId/groupId/userId', () => {
    const qs = myScheduleApi.toMyScheduleSearchParams({
      periodId: 1,
      dayOfWeek: 3,
    });
    expect(qs).toBe('?periodId=1&dayOfWeek=3');
    expect(qs).not.toContain('teacherId');
    expect(qs).not.toContain('groupId');
    expect(qs).not.toContain('userId');
    const leak = myScheduleApi.toMyScheduleSearchParams(
      Object.assign({ periodId: 1 }, {
        teacherId: 522,
        groupId: 1,
        userId: 9,
      }) as { periodId: number },
    );
    expect(leak).toBe('?periodId=1');
  });

  it('5. response timeSlots + entries se conserva', async () => {
    const payload = {
      timeSlots: [
        {
          id: 1,
          lessonNumber: 1,
          name: 'L1',
          startTime: '07:00:00',
          endTime: '07:40:00',
          displayOrder: 1,
          slotType: 'CLASS' as const,
          isActive: true,
        },
      ],
      entries: [
        {
          entryId: 9,
          dayOfWeek: 1,
          timeSlot: {
            id: 1,
            name: 'L1',
            startTime: '07:00:00',
            endTime: '07:40:00',
            displayOrder: 1,
            slotType: 'CLASS' as const,
          },
          teachingAssignment: {
            id: 5,
            teacher: { id: 520, name: 'Doc' },
            group: { id: 3, name: '7-1', gradeLevel: 7 },
            offering: {
              kind: 'SUBJECT',
              id: 1,
              name: 'Matemática',
              labelKind: 'Materia',
            },
            academicPeriod: { id: 1, name: 'P' },
          },
        },
      ],
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data: payload });
    await expect(getMySchedule({ periodId: 1 })).resolves.toEqual(payload);
  });
});
