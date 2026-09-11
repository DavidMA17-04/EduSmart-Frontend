export const SCHEDULE_HOME_PATH = '/admin/schedule';
export const MY_SCHEDULE_PATH = '/admin/my-schedule';

export const SCHEDULE_PERMISSIONS = {
  view: 'schedules.view',
  viewOwn: 'schedules.view_own',
  edit: 'schedules.edit',
} as const;

export function canEditSchedule(
  hasPermission: (code: string) => boolean,
): boolean {
  return hasPermission(SCHEDULE_PERMISSIONS.edit);
}

/** Docente own schedule — not shown to Admin (who has schedules.view via grant or bypass). */
export function canAccessMySchedule(
  hasPermission: (code: string) => boolean,
): boolean {
  return (
    hasPermission(SCHEDULE_PERMISSIONS.viewOwn) &&
    !hasPermission(SCHEDULE_PERMISSIONS.view)
  );
}
