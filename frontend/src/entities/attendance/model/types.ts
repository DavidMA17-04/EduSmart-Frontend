/** Attendance domain types aligned with backend Phase 1A / 1A.2 contracts. */

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

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
  group: AttendanceSessionGroupSummary;
  offering: AttendanceSessionOfferingSummary;
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
}

/** GET /attendance/schedule-context */
export interface AttendanceScheduleContext {
  date: string;
  dayOfWeek: number;
  occurrences: AttendanceScheduleOccurrence[];
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
