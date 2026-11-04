export type AcademicYearStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED';

export interface AcademicYear {
  id: string | number;
  name: string;
  startDate: string;
  endDate: string;
  status?: AcademicYearStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicYearPayload {
  name: string;
  startDate: string;
  endDate: string;
}

export type UpdateAcademicYearPayload = Partial<CreateAcademicYearPayload>;
