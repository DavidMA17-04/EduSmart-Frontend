/** Route + permission contracts for the attendance admin module (Phase 1B + PBI-27/28). */

export const ATTENDANCE_HOME_PATH = '/admin/attendance';
export const ATTENDANCE_NEW_PATH = '/admin/attendance/new';
export const ATTENDANCE_HISTORY_PATH = '/admin/attendance/history';
export const ATTENDANCE_ALERTS_PATH = '/admin/attendance/alerts';
export const ATTENDANCE_REPORTS_PATH = '/admin/attendance/reports';
export const ATTENDANCE_JUSTIFICATIONS_PATH = '/admin/attendance/justifications';
export const ATTENDANCE_REDEEM_PATH = '/admin/attendance/redeem';
/** Alias amigable para estudiantes (redirige al canje en AdminShell). */
export const STUDENT_ATTENDANCE_PATH = '/student/attendance';
export const ATTENDANCE_SESSION_PATH = (sessionId: number | string) =>
  `/admin/attendance/sessions/${sessionId}`;

export const ATTENDANCE_PERMISSIONS = {
  view: 'attendance.view',
  viewOwn: 'attendance.view_own',
  create: 'attendance.create',
  edit: 'attendance.edit',
  justify: 'attendance.justify',
  review: 'attendance.review',
} as const;

/** Guards applied in AppRouter via RequirePermission. */
export const ATTENDANCE_ROUTE_GUARDS = [
  {
    path: ATTENDANCE_HOME_PATH,
    permission: ATTENDANCE_PERMISSIONS.view,
    page: 'AttendanceHomePage',
  },
  {
    path: ATTENDANCE_HISTORY_PATH,
    permission: ATTENDANCE_PERMISSIONS.view,
    anyOf: [ATTENDANCE_PERMISSIONS.view, ATTENDANCE_PERMISSIONS.viewOwn],
    page: 'AttendanceHistoryPage',
  },
  {
    path: ATTENDANCE_ALERTS_PATH,
    permission: ATTENDANCE_PERMISSIONS.view,
    page: 'AbsenteeismAlertsPage',
  },
  {
    path: ATTENDANCE_REPORTS_PATH,
    permission: ATTENDANCE_PERMISSIONS.view,
    page: 'AttendanceReportsPage',
  },
  {
    path: ATTENDANCE_NEW_PATH,
    permission: ATTENDANCE_PERMISSIONS.create,
    page: 'AttendanceNewPage',
  },
  {
    path: '/admin/attendance/sessions/:sessionId',
    permission: ATTENDANCE_PERMISSIONS.view,
    page: 'AttendanceSessionPage',
  },
  {
    path: ATTENDANCE_JUSTIFICATIONS_PATH,
    permission: ATTENDANCE_PERMISSIONS.view,
    page: 'AttendanceJustificationsPage',
  },
  {
    path: ATTENDANCE_REDEEM_PATH,
    permission: null,
    page: 'AttendanceRedeemPage',
  },
] as const;

export function canCreateAttendanceClass(
  hasPermission: (code: string) => boolean,
): boolean {
  return hasPermission(ATTENDANCE_PERMISSIONS.create);
}

export function canViewAttendanceHistory(
  hasPermission: (code: string) => boolean,
): boolean {
  return (
    hasPermission(ATTENDANCE_PERMISSIONS.view) ||
    hasPermission(ATTENDANCE_PERMISSIONS.viewOwn)
  );
}

export function canReviewJustifications(
  hasPermission: (code: string) => boolean,
): boolean {
  return hasPermission(ATTENDANCE_PERMISSIONS.review);
}

/** Parse `:sessionId` from the route; invalid → null. */
export function parseAttendanceSessionId(
  raw: string | undefined,
): number | null {
  if (raw == null || raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}
