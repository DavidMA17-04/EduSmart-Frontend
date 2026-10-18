import type { Department } from '@/entities/department';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

export const departmentApi = {
  listActive: async (): Promise<Department[]> => {
    const response = await httpClient<ApiEnvelope<Department[]> | Department[]>(
      '/departments',
    );
    if (Array.isArray(response)) return response;
    return response.data ?? [];
  },
};
