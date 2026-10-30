import type { UserAccountStatus } from '@/entities/user';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

export type GuardianLinkPerson = {
  id: number;
  nationalId: string | null;
  name: string;
  first_lastname: string | null;
  second_lastname: string | null;
  email: string | null;
  status: UserAccountStatus;
};

export type GuardianStudentLink = {
  id: number;
  guardianUserId: number;
  studentUserId: number;
  relationship: string | null;
  createdAt: string;
  guardian: GuardianLinkPerson;
  student: GuardianLinkPerson;
};

export type CreateGuardianLinkPayload = {
  counterpartUserId: number;
  relationship?: string;
};

async function requestData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const guardianLinkApi = {
  listMine: () => requestData<GuardianStudentLink[]>('/users/me/guardian-links'),
  list: (userId: number) => requestData<GuardianStudentLink[]>(`/users/${userId}/guardian-links`),
  create: (userId: number, payload: CreateGuardianLinkPayload) =>
    requestData<GuardianStudentLink>(`/users/${userId}/guardian-links`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  remove: (linkId: number) =>
    httpClient<void>(`/guardian-links/${linkId}`, { method: 'DELETE' }),
};
