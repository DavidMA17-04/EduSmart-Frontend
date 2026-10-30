import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/shared/api/httpClient';
import { guardianLinkApi } from './guardianLinkApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

const link = {
  id: 9,
  guardianUserId: 21,
  studentUserId: 22,
  relationship: 'Madre',
  createdAt: '2026-10-01T00:00:00.000Z',
  guardian: {
    id: 21,
    nationalId: '809000004',
    name: 'Roberto DiscQA',
    first_lastname: 'DiscQA',
    second_lastname: null,
    email: 'roberto@ctphojancha.ed.cr',
    status: 'ACTIVE',
  },
  student: {
    id: 22,
    nationalId: '809000005',
    name: 'Estudiante DiscQA',
    first_lastname: 'DiscQA',
    second_lastname: null,
    email: 'estudiante@ctphojancha.ed.cr',
    status: 'ACTIVE',
  },
};

describe('guardianLinkApi', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('lista los vínculos de la sesión autenticada', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [link] });
    await expect(guardianLinkApi.listMine()).resolves.toEqual([link]);
    expect(mockedHttp).toHaveBeenCalledWith('/users/me/guardian-links', undefined);
  });

  it('lista los vínculos de la ficha', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: [link] });
    await expect(guardianLinkApi.list(22)).resolves.toEqual([link]);
    expect(mockedHttp).toHaveBeenCalledWith('/users/22/guardian-links', undefined);
  });

  it('crea el vínculo con la contraparte', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: link });
    await expect(
      guardianLinkApi.create(22, { counterpartUserId: 21, relationship: 'Madre' }),
    ).resolves.toEqual(link);
    expect(mockedHttp).toHaveBeenCalledWith('/users/22/guardian-links', {
      method: 'POST',
      body: JSON.stringify({ counterpartUserId: 21, relationship: 'Madre' }),
    });
  });

  it('propaga el 409 de duplicado', async () => {
    mockedHttp.mockRejectedValueOnce(
      new HttpError(409, 'Este encargado ya está vinculado con este estudiante.'),
    );
    await expect(guardianLinkApi.create(22, { counterpartUserId: 21 })).rejects.toMatchObject({
      status: 409,
    });
  });

  it('quita el vínculo', async () => {
    mockedHttp.mockResolvedValueOnce(undefined);
    await guardianLinkApi.remove(9);
    expect(mockedHttp).toHaveBeenCalledWith('/guardian-links/9', { method: 'DELETE' });
  });
});
