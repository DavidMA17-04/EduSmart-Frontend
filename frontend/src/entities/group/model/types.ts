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
  firstName: string;
  lastName: string;
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
  section?: { id: number; name: string; gradeLevel?: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupPayload {
  name: string;
  studentCount?: number;
  sectionId: number;
  academicPeriodId?: number;
  guideTeacherId?: number | null;
}

export type UpdateGroupPayload = Partial<CreateGroupPayload>;
export interface AssignGuideTeacherPayload { guideTeacherId: number | null; }
