import type { AcademicGroup } from '@/entities/group';

export type SectionStatus = 'ACTIVE' | 'INACTIVE';

export interface Section {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: SectionStatus;
  groups?: AcademicGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionPayload {
  code: string;
  name: string;
  description?: string;
  status?: SectionStatus;
}

export type UpdateSectionPayload = Partial<CreateSectionPayload>;