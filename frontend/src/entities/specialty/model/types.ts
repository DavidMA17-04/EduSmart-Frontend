export type SpecialtyStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';

export interface Specialty {
  id: number;
  name: string;
  description: string | null;
  status: SpecialtyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyPayload {
  name: string;
  description?: string;
  status?: SpecialtyStatus;
}

export type UpdateSpecialtyPayload = Partial<CreateSpecialtyPayload>;
