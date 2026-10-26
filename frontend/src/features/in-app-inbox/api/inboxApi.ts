import { httpClient } from '@/shared/api';
import type { InboxMine, InboxSource } from '../model/types';

type ApiEnvelope<T> = { success: boolean; data: T };

const request = async <T>(path: string, init?: RequestInit): Promise<T> =>
  (await httpClient<ApiEnvelope<T>>(path, init)).data;

export const inboxApi = {
  mine: () => request<InboxMine>('/notifications/mine'),
  markRead: (source: InboxSource, id: number) =>
    request<{ id: number; readAt?: string }>(`/notifications/${source}/${id}/read`, {
      method: 'POST',
    }),
};
