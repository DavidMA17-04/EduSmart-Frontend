export type AcademicOfferingKind =
  | 'SUBJECT'
  | 'EXPLORATORY_WORKSHOP'
  | 'TECHNICAL_SPECIALTY';

export interface TeachingAssignmentTeacher {
  id: number;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export interface TeachingAssignmentGroup {
  id: number;
  name: string;
  section?: { id: number; name: string; gradeLevel?: number } | null;
}

export interface TeachingAssignmentSubject {
  id: number;
  name: string;
  code?: string | null;
  status?: string;
}

export interface TeachingAssignmentSpecialty {
  id: number;
  name: string;
  kind?: string;
}

export interface TeachingAssignmentPeriod {
  id: number;
  name: string;
  status?: string;
}

/** Impartible teaching assignment (offeringKind is always set in list responses). */
export interface TeachingAssignment {
  id: number;
  userId: number;
  groupId: number;
  academicPeriodId: number | null;
  isGuideTeacher: boolean;
  offeringKind: AcademicOfferingKind;
  subjectId: number | null;
  specialtyId: number | null;
  user?: TeachingAssignmentTeacher | null;
  group?: TeachingAssignmentGroup | null;
  subject?: TeachingAssignmentSubject | null;
  specialty?: TeachingAssignmentSpecialty | null;
  academicPeriod?: TeachingAssignmentPeriod | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeachingAssignmentListFilters {
  teacherId?: number;
  groupId?: number;
  periodId?: number;
}

export interface CreateTeachingAssignmentPayload {
  userId: number;
  groupId: number;
  offeringKind: AcademicOfferingKind;
  subjectId?: number | null;
  specialtyId?: number | null;
  academicPeriodId?: number | null;
  isGuideTeacher?: boolean;
}

export type UpdateTeachingAssignmentPayload = Partial<
  Omit<CreateTeachingAssignmentPayload, 'userId' | 'groupId'>
>;

export interface SubjectCatalogItem {
  id: number;
  name: string;
  code?: string | null;
  status: string;
}
