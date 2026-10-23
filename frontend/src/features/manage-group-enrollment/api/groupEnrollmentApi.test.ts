import { describe, expect, it, vi, beforeEach } from 'vitest';
import { groupEnrollmentApi } from './groupEnrollmentApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

describe('groupEnrollmentApi', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('listByGroup → GET /group-enrollments?groupId=', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await expect(groupEnrollmentApi.listByGroup(20)).resolves.toEqual([]);
    expect(mockedHttp).toHaveBeenCalledWith(
      '/group-enrollments?groupId=20',
      undefined,
    );
  });

  it('listByGroup con status ACTIVE', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [] });
    await groupEnrollmentApi.listByGroup(20, 'ACTIVE');
    expect(mockedHttp).toHaveBeenCalledWith(
      '/group-enrollments?groupId=20&status=ACTIVE',
      undefined,
    );
  });

  it('create → POST /group-enrollments', async () => {
    const payload = {
      userId: 7,
      groupId: 20,
      startsOn: '2026-02-01',
    };
    mockedHttp.mockResolvedValueOnce({ success: true, data: { id: 1, ...payload } });
    await groupEnrollmentApi.create(payload);
    expect(mockedHttp).toHaveBeenCalledWith('/group-enrollments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });
});
