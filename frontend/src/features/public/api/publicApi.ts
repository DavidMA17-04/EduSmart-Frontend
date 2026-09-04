import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

export interface CampusSnapshot {
  activeUsers: number;
  totalUsers: number;
}

export const publicApi = {
  getCampusSnapshot: async (): Promise<CampusSnapshot> => {
    const response = await httpClient<ApiEnvelope<CampusSnapshot>>('/public/campus-snapshot');
    return response.data;
  },
};
