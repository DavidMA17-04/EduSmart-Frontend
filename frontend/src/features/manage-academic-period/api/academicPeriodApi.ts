import type { AcademicPeriod, CreateAcademicPeriodPayload, UpdateAcademicPeriodPayload } from '@/entities/academic-period';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const academicPeriodApi = {
  list: () => request<AcademicPeriod[]>('/academic-periods'),
  create: (payload: CreateAcademicPeriodPayload) =>
    request<AcademicPeriod>('/academic-periods', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateAcademicPeriodPayload) =>
    request<AcademicPeriod>(`/academic-periods/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  activate: (id: string) => request<AcademicPeriod>(`/academic-periods/${id}/activate`, { method: 'PATCH' }),
  close: (id: string) => request<AcademicPeriod>(`/academic-periods/${id}/close`, { method: 'PATCH' }),
  reopen: (id: string) => request<AcademicPeriod>(`/academic-periods/${id}/reopen`, { method: 'PATCH' }),
};
