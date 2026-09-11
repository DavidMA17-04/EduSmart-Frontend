import type {
  CreateTeachingAssignmentPayload,
  SubjectCatalogItem,
  TeachingAssignment,
  TeachingAssignmentListFilters,
  UpdateTeachingAssignmentPayload,
} from '@/entities/teaching-assignment';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await httpClient<ApiEnvelope<T>>(path, init)).data;
}

function toSearchParams(filters: TeachingAssignmentListFilters): string {
  const params = new URLSearchParams();
  if (filters.teacherId != null) params.set('teacherId', String(filters.teacherId));
  if (filters.groupId != null) params.set('groupId', String(filters.groupId));
  if (filters.periodId != null) params.set('periodId', String(filters.periodId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const teachingAssignmentApi = {
  list: (filters: TeachingAssignmentListFilters = {}) =>
    request<TeachingAssignment[]>(
      `/teaching-assignments${toSearchParams(filters)}`,
    ),

  getById: (id: number) =>
    request<TeachingAssignment>(`/teaching-assignments/${id}`),

  create: (payload: CreateTeachingAssignmentPayload) =>
    request<TeachingAssignment>('/teaching-assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateTeachingAssignmentPayload) =>
    request<TeachingAssignment>(`/teaching-assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

export const subjectApi = {
  list: () => request<SubjectCatalogItem[]>('/subjects'),
};
