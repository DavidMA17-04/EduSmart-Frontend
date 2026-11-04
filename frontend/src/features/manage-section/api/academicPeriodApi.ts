import type { AcademicPeriod } from '@/entities/section';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };
const request = async <T>(path: string, init?: RequestInit): Promise<T> =>
  (await httpClient<ApiEnvelope<T>>(path, init)).data;

export const academicPeriodApi = {
  list: () => request<AcademicPeriod[]>('/academic-periods'),
};
