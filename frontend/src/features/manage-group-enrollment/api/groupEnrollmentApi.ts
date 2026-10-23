import { httpClient } from '@/shared/api';
import type {
  CreateGroupEnrollmentPayload,
  GroupEnrollmentListItem,
  GroupEnrollmentStatus,
} from '../model/types';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await httpClient<ApiEnvelope<T>>(path, init)).data;
}

export const groupEnrollmentApi = {
  listByGroup: (groupId: number, status?: GroupEnrollmentStatus) => {
    const params = new URLSearchParams({ groupId: String(groupId) });
    if (status) params.set('status', status);
    return request<GroupEnrollmentListItem[]>(
      `/group-enrollments?${params.toString()}`,
    );
  },

  create: (payload: CreateGroupEnrollmentPayload) =>
    request<GroupEnrollmentListItem | Record<string, unknown>>(
      '/group-enrollments',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
};
