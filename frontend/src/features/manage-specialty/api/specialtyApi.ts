import type { CreateSpecialtyPayload, Specialty, UpdateSpecialtyPayload } from '@/entities/specialty';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const specialtyApi = {
  list: () => request<Specialty[]>('/specialties'),
  getById: (id: number) => request<Specialty>(`/specialties/${id}`),
  create: (payload: CreateSpecialtyPayload) => request<Specialty>('/specialties', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: UpdateSpecialtyPayload) => request<Specialty>(`/specialties/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivate: (id: number) => request<Specialty>(`/specialties/${id}`, { method: 'DELETE' }),
};