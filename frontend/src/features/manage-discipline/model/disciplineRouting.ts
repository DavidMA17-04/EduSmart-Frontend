export const DISCIPLINE_PERMISSIONS = {
  view: 'disciplinary.view',
  viewOwn: 'disciplinary.view_own',
  create: 'disciplinary.create',
  review: 'disciplinary.review',
  configure: 'disciplinary.configure',
  export: 'disciplinary.export',
  respond: 'disciplinary.respond',
  resolve: 'disciplinary.resolve',
  appeal: 'disciplinary.appeal',
  precautionary: 'disciplinary.precautionary',
} as const;

export const DISCIPLINE_CASES_PATH = '/admin/discipline/cases';
export const disciplineCasePath = (id: number) => `/admin/discipline/cases/${id}`;
export const DISCIPLINE_NOTIFICATIONS_PATH = '/admin/discipline/notifications';
export const DISCIPLINE_CALENDAR_PATH = '/admin/discipline/calendar';
export const DISCIPLINE_CATALOG_PATH = '/admin/discipline/catalog';
export const DISCIPLINE_PROCESS_PATH = '/admin/discipline/process';
export const DISCIPLINE_REGISTER_PATH = '/admin/discipline/register';
export const DISCIPLINE_HISTORY_PATH = '/admin/discipline/history';
export const disciplineHistoryPath = (studentId: number) => `${DISCIPLINE_HISTORY_PATH}/${studentId}`;
export const DISCIPLINE_DASHBOARD_PATH = '/admin/discipline/dashboard';
