import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/shared/api/httpClient';

vi.mock('@/shared/api', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api/httpClient')>(
    '@/shared/api/httpClient',
  );
  return { httpClient: vi.fn(), HttpError: actual.HttpError };
});
vi.mock('@/shared/auth', () => ({ getAccessToken: () => 'token-123' }));
vi.mock('@/features/auth', () => ({
  useAuthStore: { getState: () => ({ logout: vi.fn() }) },
}));

import { attendanceApi } from './attendanceApi';

const evidence = {
  id: 50,
  fileName: 'constancia.pdf',
  mimeType: 'application/pdf',
  fileSizeBytes: 2048,
  url: '/attendance/justifications/3/evidence/50',
  uploadedByUserId: 5,
  createdAt: '2026-10-07T10:00:00.000Z',
};

describe('attendanceApi.openJustificationEvidence (PBI-27)', () => {
  const fetchMock = vi.fn();
  const openMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    openMock.mockReset().mockReturnValue({});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {
      open: openMock,
      setTimeout: vi.fn(),
      location: { pathname: '/attendance/justifications', assign: vi.fn() },
    });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:evidence'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('descarga con Bearer desde el endpoint autenticado y abre el blob', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => new Blob(['%PDF']),
    });

    await attendanceApi.openJustificationEvidence(evidence);

    const [url, init] = fetchMock.mock.calls[0] as [string, { headers: Headers }];
    expect(url).toMatch(/\/attendance\/justifications\/3\/evidence\/50$/);
    expect(url).not.toContain('/uploads/');
    expect(init.headers.get('Authorization')).toBe('Bearer token-123');
    expect(openMock).toHaveBeenCalledWith('blob:evidence', '_blank');
  });

  it.each([403, 404])('responde %s con mensaje de acceso y no abre pestaña', async (status) => {
    fetchMock.mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ message: 'Evidencia no encontrada' }),
    });

    await expect(attendanceApi.openJustificationEvidence(evidence)).rejects.toMatchObject({
      status,
      message: 'No tiene acceso a esta evidencia o ya no existe.',
    });
    await expect(
      attendanceApi.openJustificationEvidence(evidence),
    ).rejects.toBeInstanceOf(HttpError);
    expect(openMock).not.toHaveBeenCalled();
  });
});
