import type { CreateSectionPayload, Section, UpdateSectionPayload } from '@/entities/section';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };
const request = async <T>(path: string, init?: RequestInit): Promise<T> => (await httpClient<ApiEnvelope<T>>(path, init)).data;

export const sectionApi = {
  list: () => request<Section[]>('/sections'),
  getById: (id: string) => request<Section>(`/sections/${id}`),
  create: (payload: CreateSectionPayload) => request<Section>('/sections', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateSectionPayload) => request<Section>(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivate: (id: string) => request<Section>(`/sections/${id}`, { method: 'DELETE' }),
};