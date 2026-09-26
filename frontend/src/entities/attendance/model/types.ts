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
  lessonNumber: number | null;
  lessonTotal: number | null;
  scheduleStartTime: string | null;
  scheduleEndTime: string | null;
  registeredBy: { id: number | null; fullName: string };
  lateMinutes: number | null;
}

export interface AttendanceHistoryPage {
  items: AttendanceHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /attendance/history/summary */
export interface AttendanceHistorySummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  justified: number;
  attendancePercent: number;
  band: 'Excelente' | 'Bueno' | 'Regular' | 'En riesgo' | 'Sin datos';
}

export type AbsenteeismRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AbsenteeismStudentRisk {
  studentUserId: number;
  fullName: string;
  nationalId: string;
  group: { id: number; name: string } | null;
  unjustifiedAbsencesMonth: number;
  absencesPeriod: number;
  consecutiveAbsences: number;
  attendancePercent: number;
  lastAbsenceDate: string | null;
  riskLevel: AbsenteeismRiskLevel;
  triggeredRules: string[];
  alertId: number | null;
}

export interface AbsenteeismAlertRule {
  id: number;
  code: string;
  label: string;
  thresholdValue: number;
  riskLevel: AbsenteeismRiskLevel;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AbsenteeismPersistedAlert {
  id: number;
  riskLevel: AbsenteeismRiskLevel;
  status: string;
  ruleCodes: string[];
  unjustifiedAbsencesMonth: number;
  absencesPeriod: number;
  consecutiveAbsences: number;
  attendancePercent: number;
  lastAbsenceDate: string | null;
  triggeredAt: string;
  student: { id: number; fullName: string; nationalId: string };
  group: { id: number; name: string } | null;
}

export interface AbsenteeismDashboard {
  kpis: {
    highRisk: number;
    mediumRisk: number;
    normal: number;
    absencesThisMonth: number;
  };
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  highRiskStudents: AbsenteeismStudentRisk[];
  recentAlerts: Array<{
    id: number;
    studentFullName: string;
    riskLevel: AbsenteeismRiskLevel;
    title: string;
    body: string;
    triggeredAt: string;
    readAt: string | null;
  }>;
  criteria: Array<{ code: string; label: string; thresholdValue: number }>;
  trend: Array<{ month: string; high: number; medium: number; low: number }>;
  evaluatedAt: string;
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

/** GET /attendance/analytics/* and /attendance/reports/export/* */
export interface AttendanceAnalyticsFilters {
  startDate?: string;
  endDate?: string;
  groupId?: number;
  courseId?: number;
  academicPeriodId?: number;
  teachingAssignmentId?: number;
  status?: AttendanceStatus;
}

export interface AttendanceStatusCounts {
  present: number;
  absent: number;
  late: number;
  justified: number;
  total: number;
  attendanceRate: number;
}

export interface AttendanceGroupRate {
  groupId: number;
  groupName: string;
  totalRecords: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalJustified: number;
  attendanceRate: number;
}

export interface AttendanceTrendPoint {
  period: string;
  attendanceRate: number;
  present: number;
  absent: number;
  late: number;
  justified: number;
  total: number;
}

export interface AttendanceAlert {
  studentUserId: number;
  fullName: string;
  nationalId: string;
  groupName: string;
  totalAbsent: number;
  totalRecords: number;
  absenceRate: number;
  consecutiveAbsences: number;
}

export interface AttendanceAnalyticsSummary {
  scope: 'institutional' | 'teacher';
  startDate: string | null;
  endDate: string | null;
  totalSessions: number;
  averageAttendanceRate: number;
  totalJustifications: number;
  counts: AttendanceStatusCounts;
  byGroup: AttendanceGroupRate[];
  trend: AttendanceTrendPoint[];
}

export interface AttendanceDashboardKpis {
  scope: 'institutional' | 'teacher';
  asOfDate: string;
  criticalAbsenceRate: number;
  today: {
    attendanceRate: number;
    expectedStudents: number;
    registeredStudents: number;
    present: number;
    absent: number;
    late: number;
    justified: number;
  };
  kpis: {
    todayRate: number;
    presentCount: number;
    criticalAbsences: number;
    openSessions: number;
  };
  trend: AttendanceTrendPoint[];
  distribution: AttendanceStatusCounts;
  groupRates: AttendanceGroupRate[];
  alerts: AttendanceAlert[];
}
