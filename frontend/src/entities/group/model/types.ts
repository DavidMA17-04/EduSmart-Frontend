export interface GuideTeacher {
  id: string;
  name: string;
}

export interface AcademicGroup {
  id: string;
  name: string;
  studentCount: number;
  sectionId: string;
  guideTeacherId: string | null;
  guideTeacher?: GuideTeacher | null;
  section?: { id: string; code: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupPayload {
  name: string;
  studentCount?: number;
  sectionId: string;
  guideTeacherId?: string | null;
}

export type UpdateGroupPayload = Partial<CreateGroupPayload>;
export interface AssignGuideTeacherPayload { guideTeacherId: string | null; }