export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  status: DepartmentStatus;
  sortOrder?: number;
}
