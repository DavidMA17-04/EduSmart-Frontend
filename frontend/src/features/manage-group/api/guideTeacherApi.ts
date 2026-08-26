import type { CreateGuideTeacherPayload, GuideTeacher, UpdateGuideTeacherPayload } from '@/entities/group';
import type { AdministrativeUser } from '@/entities/user';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await httpClient<ApiEnvelope<T>>(path, init)).data;
}

export function toGuideTeacher(user: AdministrativeUser): GuideTeacher {
  const firstName = user.firstName?.trim() ?? '';
  const lastName = user.lastName?.trim() ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name?.trim() || user.email || 'Docente';
  return {
    id: user.id,
    name,
    nationalId: user.nationalId ?? '',
    firstName,
    lastName,
    email: user.email ?? '',
    phone: user.phone ?? null,
  };
}

export const guideTeacherApi = {
  list: async () => {
    const users = await request<AdministrativeUser[]>('/users/guide-teachers');
    return users.map(toGuideTeacher);
  },
  create: async (payload: CreateGuideTeacherPayload) => {
    const user = await request<AdministrativeUser>('/users/guide-teachers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return toGuideTeacher(user);
  },
  update: async (id: number, payload: UpdateGuideTeacherPayload) => {
    const user = await request<AdministrativeUser>(`/users/guide-teachers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return toGuideTeacher(user);
  },
  remove: (id: number) =>
    request<AdministrativeUser>(`/users/guide-teachers/${id}`, { method: 'DELETE' }),
};
