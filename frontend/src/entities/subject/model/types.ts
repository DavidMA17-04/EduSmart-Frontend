export type SubjectStatus = 'ACTIVE' | 'INACTIVE';

export interface Subject {
  id: number;
  name: string;
  code: string | null;
  status: SubjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectPayload {
  name: string;
  code?: string | null;
  status?: SubjectStatus;
}

export interface UpdateSubjectPayload {
  name?: string;
  code?: string | null;
  status?: SubjectStatus;
}
