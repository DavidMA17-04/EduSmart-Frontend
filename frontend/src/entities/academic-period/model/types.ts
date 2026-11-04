export type AcademicPeriodStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED';

export interface AcademicPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicPeriodStatus;
  academicYearId?: string | number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicPeriodPayload {
  name: string;
  startDate: string;
  endDate: string;
  academicYearId?: string | number | null;
}

export type UpdateAcademicPeriodPayload = Partial<CreateAcademicPeriodPayload>;
