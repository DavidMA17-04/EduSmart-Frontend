export interface GuideTeacher {
  id: number;
  name: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface CreateGuideTeacherPayload {
  nationalId: string;
  /** Nombres de pila (campo backend: name) */
  name: string;
  /** Primer apellido */
  first_lastname: string;
  /** Segundo apellido (opcional) */
  second_lastname?: string;
  email: string;
  phone?: string;
}

export type UpdateGuideTeacherPayload = Partial<CreateGuideTeacherPayload>;

export interface AcademicGroup {
  id: number;
  name: string;
  studentCount: number;
  sectionId: number;
  academicPeriodId?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  guideTeacherId: number | null;
  guideTeacher?: GuideTeacher | null;
  specialtyId: number | null;
  specialty?: { id: number; name: string } | null;
  section?: { id: number; name: string; gradeLevel?: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupPayload {
  name: string;
  studentCount?: number;
  sectionId: number;
  specialtyId?: number | null;
  academicPeriodId?: number;
  guideTeacherId?: number | null;
}

export type UpdateGroupPayload = Partial<CreateGroupPayload>;
export interface AssignGuideTeacherPayload { guideTeacherId: number | null; }
