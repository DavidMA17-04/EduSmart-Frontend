import type { AcademicGroup, AssignGuideTeacherPayload, CreateGroupPayload, UpdateGroupPayload } from '@/entities/group';
import { httpClient } from '@/shared/api';
type ApiEnvelope<T> = { success: boolean; data: T };
const request = async <T>(path: string, init?: RequestInit): Promise<T> => (await httpClient<ApiEnvelope<T>>(path, init)).data;

export const groupApi = {
  list: () => request<AcademicGroup[]>('/groups'),
  getById: (id: string) => request<AcademicGroup>(`/groups/${id}`),
  create: (payload: CreateGroupPayload) => request<AcademicGroup>('/groups', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateGroupPayload) => request<AcademicGroup>(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  assignGuideTeacher: (id: string, payload: AssignGuideTeacherPayload) => request<AcademicGroup>(`/groups/${id}/guide-teacher`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/groups/${id}`, { method: 'DELETE' }),
};