import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/shared/api/httpClient';
import { subjectApi, teachingAssignmentApi } from './teachingAssignmentApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

describe('teachingAssignmentApi', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('list sin filtros → GET /teaching-assignments', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await expect(teachingAssignmentApi.list()).resolves.toEqual([]);
    expect(mockedHttp).toHaveBeenCalledWith('/teaching-assignments', undefined);
  });

  it('list con teacherId, groupId, periodId', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await teachingAssignmentApi.list({
      teacherId: 5,
      groupId: 3,
      periodId: 1,
    });
    expect(mockedHttp).toHaveBeenCalledWith(
      '/teaching-assignments?teacherId=5&groupId=3&periodId=1',
      undefined,
    );
  });

  it('create SUBJECT payload XOR specialty null', async () => {
    const payload = {
      userId: 5,
      groupId: 3,
      offeringKind: 'SUBJECT' as const,
      subjectId: 2,
      specialtyId: null,
      academicPeriodId: 1,
    };
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { id: 10, ...payload },
    });
    await teachingAssignmentApi.create(payload);
    expect(mockedHttp).toHaveBeenCalledWith('/teaching-assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('update → PUT /teaching-assignments/:id', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: { id: 10 } });
    await teachingAssignmentApi.update(10, {
      offeringKind: 'EXPLORATORY_WORKSHOP',
      specialtyId: 4,
      subjectId: null,
    });
    expect(mockedHttp).toHaveBeenCalledWith('/teaching-assignments/10', {
      method: 'PUT',
      body: JSON.stringify({
        offeringKind: 'EXPLORATORY_WORKSHOP',
        specialtyId: 4,
        subjectId: null,
      }),
    });
  });

  it('subjectApi.list → GET /subjects', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await subjectApi.list();
    expect(mockedHttp).toHaveBeenCalledWith('/subjects', undefined);
  });

  it('propaga HttpError 409 de duplicate', async () => {
    mockedHttp.mockRejectedValueOnce(
      new HttpError(409, 'A teaching assignment already exists'),
    );
    await expect(
      teachingAssignmentApi.create({
        userId: 1,
        groupId: 1,
        offeringKind: 'SUBJECT',
        subjectId: 1,
        specialtyId: null,
      }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
