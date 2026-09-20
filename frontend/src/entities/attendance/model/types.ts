/** Attendance domain types aligned with backend Phase 1A / 1A.2 contracts. */

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED';

export type AttendanceRegistrationMethod = 'MANUAL' | 'TOKEN';

export type AttendanceSessionStatus = 'OPEN' | 'CLOSED';

export type AcademicOfferingKind =
  | 'SUBJECT'
  | 'EXPLORATORY_WORKSHOP'
  | 'TECHNICAL_SPECIALTY';

/** GET /attendance/groups */
export interface AttendanceGroup {
  groupId: number;
  name: string;
  gradeLevel: number;
  sectionId: number;
}

/** GET /attendance/groups/:groupId/available-offerings */
export interface AttendanceAvailableOffering {
  teachingAssignmentId: number;
  offeringKind: AcademicOfferingKind;
  offeringId: number;
  name: string;
  labelKind: string;
}

export interface AttendanceSessionGroupSummary {
  id: number;
  name: string;
  gradeLevel: number;
}

export interface AttendanceSessionOfferingSummary {
  kind: AcademicOfferingKind;
  id: number;
  name: string;
  labelKind: string;
}

/** GET /attendance/sessions/:id (detail view) */
export interface AttendanceSessionDetail {
  sessionId: number;
  status: AttendanceSessionStatus;
  sessionDate: string;
  startedAt: string;
  closedAt: string | null;
  teachingAssignmentId: number;
  attendanceToken?: string | null;
  attendanceTokenExpiresAt?: string | null;
  group: AttendanceSessionGroupSummary;
  offering: AttendanceSessionOfferingSummary;
  calendarException?: AttendanceCalendarException | null;
}

/**
 * POST create / POST close return the TypeORM AttendanceSession entity
 * (property `id`, not `sessionId`). Prefer getAttendanceSession for UI header.
 */
export interface AttendanceSessionMutationResult {
  id: number;
  teachingAssignmentId: number;
  scheduleEntryId?: number | null;
  sessionDate: string;
  startedAt: string;
  closedAt: string | null;
  status: AttendanceSessionStatus;
  createdByUserId: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Nested mark on roster row (null = unmarked). */
export interface AttendanceRecordSummary {
  id: number;
  status: AttendanceStatus;
  registrationMethod: AttendanceRegistrationMethod;
  registeredAt: string;
  registeredByUserId: number;
  updatedAt: string;
  updatedByUserId: number | null;
}

/** GET /attendance/sessions/:sessionId/roster item */
export interface AttendanceRosterStudent {
  userId: number;
  nationalId: string;
  fullName: string;
  attendance: AttendanceRecordSummary | null;
}

/** PUT records response row (entity serialization). */
export interface AttendanceRecordMutationResult {
  id: number;
  attendanceSessionId: number;
  studentUserId: number;
  status: AttendanceStatus;
  registrationMethod: AttendanceRegistrationMethod;
  registeredAt: string;
  registeredByUserId: number;
  updatedAt: string;
  updatedByUserId: number | null;
}

/** POST /attendance/sessions */
export interface CreateAttendanceSessionInput {
  groupId: number;
  teachingAssignmentId: number;
}

/** POST /attendance/sessions/from-schedule */
export interface CreateAttendanceSessionFromScheduleInput {
  scheduleEntryId: number;
}

/** GET /attendance/schedule-context occurrence item */
export interface AttendanceScheduleOccurrence {
  anchorEntryId: number;
  entryIds: number[];
  teachingAssignmentId: number;
  startTime: string;
  endTime: string;
  withinStartWindow: boolean;
  attendanceSession: null | {
    id: number;
    status: AttendanceSessionStatus;
  };
  calendarException?: AttendanceCalendarException | null;
}

/** GET /attendance/schedule-context */
export interface AttendanceScheduleContext {
  date: string;
  dayOfWeek: number;
  occurrences: AttendanceScheduleOccurrence[];
  calendarException?: AttendanceCalendarException | null;
}

/** Calendar exception for exam weeks (PO-02-15 / fase 4). */
export type AttendanceCalendarExceptionType = 'SUSPENDED' | 'AUTO_JUSTIFIED';

export interface AttendanceCalendarException {
  id: number;
  academicPeriodId: number;
  sectionId: number | null;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  exceptionType: AttendanceCalendarExceptionType;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceCalendarExceptionInput {
  academicPeriodId: number;
  sectionId?: number | null;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  exceptionType: AttendanceCalendarExceptionType;
}

export type UpdateAttendanceCalendarExceptionInput = Partial<
  Omit<CreateAttendanceCalendarExceptionInput, 'academicPeriodId'>
>;

export interface ListAttendanceCalendarExceptionsFilters {
  academicPeriodId?: number;
  sectionId?: number;
}

/** PUT /attendance/sessions/:sessionId/records item */
export interface SaveAttendanceRecordInput {
  studentUserId: number;
  status: AttendanceStatus;
}

/** PUT /attendance/sessions/:sessionId/records body */
export interface SaveAttendanceRecordsInput {
  records: SaveAttendanceRecordInput[];
}

/** PBI-27 justification lifecycle (request status). */
export type JustificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AttendanceJustificationStatus =
  | 'NONE'
  | 'PENDING'
  | 'JUSTIFIED'
  | 'REJECTED';

export interface JustificationEvidenceItem {
  id: number;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  url: string;
  uploadedByUserId: number;
  createdAt: string;
}

export interface JustificationListItem {
  id: number;
  status: JustificationStatus;
  reason: string;
  decisionNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: number | null;
  attendanceId: number;
  sessionDate: string;
  student: { userId: number; fullName: string; nationalId: string };
  group: { id: number; name: string };
  offering: { name: string; kind: string | null };
  evidences: JustificationEvidenceItem[];
}

export interface JustificationListFilters {
  status?: JustificationStatus | '';
  studentUserId?: number;
  groupId?: number;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

/** Paginated GET /attendance/justifications result. */
export interface JustificationListPageResult {
  items: JustificationListItem[];
  total: number;
}

/** GET /attendance/justifications/justifiable-absences filters. */
export interface JustifiableAbsencesFilters {
  studentUserId?: number;
}

export interface CreateJustificationInput {
  attendanceId: number;
  reason: string;
}

export interface ReviewJustificationInput {
  status: 'APPROVED' | 'REJECTED';
  decisionNotes?: string;
}

/** Selectable ABSENT mark for WF-39. */
export interface JustifiableAbsenceOption {
  attendanceId: number;
  sessionDate: string;
  offeringName: string;
  groupName: string;
  studentFullName: string;
}

/** GET /attendance/history query */
export interface AttendanceHistoryFilters {
  startDate?: string;
  endDate?: string;
  groupId?: number;
  teachingAssignmentId?: number;
  studentId?: number;
  status?: AttendanceStatus;
  registrationMethod?: AttendanceRegistrationMethod;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'sessionDate' | 'registeredAt' | 'studentName' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface AttendanceHistoryItem {
  attendanceId: number;
  sessionId: number;
  sessionDate: string;
  startedAt: string;
  registeredAt: string;
  status: AttendanceStatus;
  registrationMethod: AttendanceRegistrationMethod;
  group: { id: number; name: string; gradeLevel: number | null };
  offering: {
    kind: AcademicOfferingKind | null;
    id: number | null;
    name: string;
    labelKind: string;
  };
  teacher: { id: number; fullName: string };
  student: { id: number; nationalId: string; fullName: string };
  teachingAssignmentId: number;
}

export interface AttendanceHistoryPage {
  items: AttendanceHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** POST /attendance/sessions/:id/token */
export interface AttendanceSessionTokenResult {
  sessionId: number;
  token: string;
  expiresAt: string;
}

/** POST /attendance/sessions/redeem-token */
export interface RedeemAttendanceTokenInput {
  token?: string;
  code?: string;
}

export interface RedeemAttendanceTokenResult {
  attendanceId: number;
  sessionId: number;
  studentUserId: number;
  status: AttendanceStatus;
  registrationMethod: AttendanceRegistrationMethod;
  registeredAt: string;
  alreadyRedeemed: boolean;
  sessionDate: string;
  groupName: string;
  offeringName: string;
  offeringLabelKind: string;
}
