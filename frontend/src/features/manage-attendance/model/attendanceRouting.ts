/** Route + permission contracts for the attendance admin module (Phase 1B). */

export const ATTENDANCE_HOME_PATH = '/admin/attendance';
export const ATTENDANCE_NEW_PATH = '/admin/attendance/new';
export const ATTENDANCE_SESSION_PATH = (sessionId: number | string) =>
  `/admin/attendance/sessions/${sessionId}`;

export const ATTENDANCE_PERMISSIONS = {
  view: 'attendance.view',
  create: 'attendance.create',
  edit: 'attendance.edit',
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
] as const;

export function canCreateAttendanceClass(
  hasPermission: (code: string) => boolean,
): boolean {
  return hasPermission(ATTENDANCE_PERMISSIONS.create);
}

/** Parse `:sessionId` from the route; invalid → null (no API call in this TODO). */
export function parseAttendanceSessionId(
  raw: string | undefined,
): number | null {
  if (raw == null || raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}
