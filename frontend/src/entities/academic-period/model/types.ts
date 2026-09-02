export type AcademicPeriodStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED';

export interface AcademicPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicPeriodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicPeriodPayload {
  name: string;
  startDate: string;
  endDate: string;
}

export type UpdateAcademicPeriodPayload = Partial<CreateAcademicPeriodPayload>;
