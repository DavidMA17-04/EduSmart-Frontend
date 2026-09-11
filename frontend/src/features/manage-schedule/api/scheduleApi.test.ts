import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/shared/api/httpClient';
import {
  createScheduleEntry,
  createScheduleTimeSlot,
  deleteScheduleEntry,
  deleteScheduleTimeSlot,
  getScheduleTimeSlot,
  listScheduleEntries,
  listScheduleTimeSlots,
  scheduleApi,
  updateScheduleEntry,
  updateScheduleTimeSlot,
} from './scheduleApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

describe('scheduleApi', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('1. listTimeSlots → GET /schedule/time-slots', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await expect(listScheduleTimeSlots()).resolves.toEqual([]);
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/time-slots', undefined);
  });

  it('getTimeSlot → GET /schedule/time-slots/:id', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: { id: 1 } });
    await getScheduleTimeSlot(1);
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/time-slots/1', undefined);
  });

  it('createTimeSlot → POST /schedule/time-slots', async () => {
    const payload = {
      name: 'L1',
      startTime: '07:00:00',
      endTime: '07:40:00',
      displayOrder: 1,
      slotType: 'CLASS' as const,
      lessonNumber: 1,
      isActive: true,
    };
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { id: 1, ...payload },
    });
    await createScheduleTimeSlot(payload);
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/time-slots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('updateTimeSlot → PUT /schedule/time-slots/:id', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: { id: 1 } });
    await updateScheduleTimeSlot(1, { isActive: false });
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/time-slots/1', {
      method: 'PUT',
      body: JSON.stringify({ isActive: false }),
    });
  });

  it('deleteTimeSlot → DELETE /schedule/time-slots/:id', async () => {
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { deleted: true },
    });
    await deleteScheduleTimeSlot(1);
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/time-slots/1', {
      method: 'DELETE',
    });
  });

  it('listEntries sin filtros → GET /schedule/entries', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await listScheduleEntries();
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/entries', undefined);
  });

  it('8–10. listEntries con teacherId, groupId, periodId', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await scheduleApi.listEntries({
      teacherId: 5,
      groupId: 3,
      periodId: 1,
    });
    expect(mockedHttp).toHaveBeenCalledWith(
      '/schedule/entries?teacherId=5&groupId=3&periodId=1',
      undefined,
    );
  });

  it('11. createEntry payload exacto', async () => {
    const payload = {
      teachingAssignmentId: 7,
      dayOfWeek: 1,
      timeSlotId: 2,
    };
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { entryId: 10, ...payload },
    });
    await createScheduleEntry(payload);
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('12. updateEntry → PUT /schedule/entries/:id', async () => {
    const payload = {
      teachingAssignmentId: 8,
      dayOfWeek: 2,
      timeSlotId: 3,
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data: { entryId: 10 } });
    await updateScheduleEntry(10, payload);
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/entries/10', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  });

  it('13. deleteEntry → DELETE /schedule/entries/:id', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: null });
    await deleteScheduleEntry(10);
    expect(mockedHttp).toHaveBeenCalledWith('/schedule/entries/10', {
      method: 'DELETE',
    });
  });

  it('propaga HttpError de conflicto', async () => {
    mockedHttp.mockRejectedValueOnce(
      new HttpError(409, 'Teacher already has a schedule entry for this day and time slot'),
    );
    await expect(
      createScheduleEntry({
        teachingAssignmentId: 1,
        dayOfWeek: 1,
        timeSlotId: 1,
      }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
