import type {
  CreateSubjectPayload,
  Subject,
  UpdateSubjectPayload,
} from '@/entities/subject';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await httpClient<ApiEnvelope<T>>(path, init)).data;
}

export const subjectApi = {
  list: () => request<Subject[]>('/subjects'),
  getById: (id: number) => request<Subject>(`/subjects/${id}`),
  create: (payload: CreateSubjectPayload) =>
    request<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: UpdateSubjectPayload) =>
    request<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deactivate: (id: number) =>
    request<Subject>(`/subjects/${id}`, { method: 'DELETE' }),
};
