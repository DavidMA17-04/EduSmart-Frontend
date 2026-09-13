/** Route + permission contracts for the attendance admin module (Phase 1B + PBI-27). */

export const ATTENDANCE_HOME_PATH = '/admin/attendance';
export const ATTENDANCE_NEW_PATH = '/admin/attendance/new';
export const ATTENDANCE_JUSTIFICATIONS_PATH = '/admin/attendance/justifications';
export const ATTENDANCE_SESSION_PATH = (sessionId: number | string) =>
  `/admin/attendance/sessions/${sessionId}`;

export const ATTENDANCE_PERMISSIONS = {
  view: 'attendance.view',
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
] as const;

export function canCreateAttendanceClass(
  hasPermission: (code: string) => boolean,
): boolean {
  return hasPermission(ATTENDANCE_PERMISSIONS.create);
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
