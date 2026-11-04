export type SpecialtyStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';

export type SpecialtyKind = 'EXPLORATORY_WORKSHOP' | 'TECHNICAL_SPECIALTY';

export interface Specialty {
  id: number;
  name: string;
  description: string | null;
  status: SpecialtyStatus;
  kind: SpecialtyKind;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyPayload {
  name: string;
  description?: string;
  status?: SpecialtyStatus;
  kind?: SpecialtyKind;
}

export type UpdateSpecialtyPayload = Partial<CreateSpecialtyPayload>;

export interface SpecialtyHubCover {
  kind: SpecialtyKind;
  imageUrl: string | null;
}
