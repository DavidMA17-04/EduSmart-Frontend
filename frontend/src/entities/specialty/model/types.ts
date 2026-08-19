export type SpecialtyStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';

export interface Specialty {
  id: string;
  code: string;
  name: string;
  area: string;
  description: string | null;
  /** Duración almacenada por backend como número de períodos académicos. */
  duration: number;
  status: SpecialtyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyPayload {
  code: string;
  name: string;
  area: string;
  description?: string;
  duration: number;
  status?: SpecialtyStatus;
}

export type UpdateSpecialtyPayload = Partial<CreateSpecialtyPayload>;
