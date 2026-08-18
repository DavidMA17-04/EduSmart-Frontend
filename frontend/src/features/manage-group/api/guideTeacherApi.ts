import type { GuideTeacher } from '@/entities/group';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string): Promise<T> {
  return (await httpClient<ApiEnvelope<T>>(path)).data;
}

export const guideTeacherApi = {
  list: () => request<GuideTeacher[]>('/users/guide-teachers'),
};
