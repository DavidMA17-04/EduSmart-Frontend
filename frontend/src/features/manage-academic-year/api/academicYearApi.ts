import type {
  AcademicYear,
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
} from '@/entities/academic-year';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

const request = async <T>(path: string, init?: RequestInit): Promise<T> =>
  (await httpClient<ApiEnvelope<T>>(path, init)).data;

export const academicYearApi = {
  list: () => request<AcademicYear[]>('/academic-years'),
  getById: (id: string | number) => request<AcademicYear>(`/academic-years/${id}`),
  create: (payload: CreateAcademicYearPayload) =>
    request<AcademicYear>('/academic-years', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string | number, payload: UpdateAcademicYearPayload) =>
    request<AcademicYear>(`/academic-years/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  activate: (id: string | number) =>
    request<AcademicYear>(`/academic-years/${id}/activate`, { method: 'PATCH' }),
  close: (id: string | number) =>
    request<AcademicYear>(`/academic-years/${id}/close`, { method: 'PATCH' }),
};
