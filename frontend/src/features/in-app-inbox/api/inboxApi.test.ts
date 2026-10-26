import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inboxApi } from './inboxApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

describe('inboxApi', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('lista la bandeja del actor', async () => {
    const payload = { unreadCount: 0, items: [] };
    mockedHttp.mockResolvedValueOnce({ success: true, data: payload });
    await expect(inboxApi.mine()).resolves.toEqual(payload);
    expect(mockedHttp).toHaveBeenCalledWith('/notifications/mine', undefined);
  });

  it('confirma lectura de disciplina y ausentismo', async () => {
    mockedHttp.mockResolvedValue({ success: true, data: { id: 5, readAt: '2026-10-21T12:00:00.000Z' } });
    await inboxApi.markRead('disciplinary', 5);
    expect(mockedHttp).toHaveBeenCalledWith('/notifications/disciplinary/5/read', {
      method: 'POST',
    });
    await inboxApi.markRead('absenteeism', 9);
    expect(mockedHttp).toHaveBeenCalledWith('/notifications/absenteeism/9/read', {
      method: 'POST',
    });
  });

  it('propaga el error de red y no inventa una bandeja vacía', async () => {
    mockedHttp.mockRejectedValueOnce(new Error('Failed to fetch'));
    await expect(inboxApi.mine()).rejects.toThrow('Failed to fetch');
  });
});
