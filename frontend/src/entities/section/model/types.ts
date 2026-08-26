import type { AcademicGroup } from '@/entities/group';
import type { Specialty } from '@/entities/specialty';

export type SectionStatus = 'ACTIVE' | 'INACTIVE';

export interface AcademicPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED';
}

export interface Section {
  id: number;
  name: string;
  gradeLevel: number;
  description: string | null;
  academicPeriodId: number;
  specialtyId: number | null;
  specialty?: Specialty | null;
  academicPeriod?: AcademicPeriod | null;
  status: SectionStatus;
  groups?: AcademicGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionPayload {
  name: string;
  gradeLevel: number;
  academicPeriodId: number;
  specialtyId?: number | null;
  description?: string;
  status?: SectionStatus;
}

export type UpdateSectionPayload = Partial<CreateSectionPayload>;
