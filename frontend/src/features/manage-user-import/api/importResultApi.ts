import type { ImportResult, RegisterImportResultPayload } from '@/entities/user-import';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function requestImport<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const importResultApi = {
  getById: (jobId: string) => requestImport<ImportResult>(`/bulk-import/${jobId}`),
  register: (payload: RegisterImportResultPayload) =>
    requestImport<ImportResult>('/bulk-import/results', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
