import { describe, expect, it } from 'vitest';
import {
  DISCIPLINE_CALENDAR_PATH,
  DISCIPLINE_CASES_PATH,
  DISCIPLINE_CATALOG_PATH,
  DISCIPLINE_DASHBOARD_PATH,
  DISCIPLINE_HISTORY_PATH,
  DISCIPLINE_NOTIFICATIONS_PATH,
  DISCIPLINE_PROCESS_PATH,
  DISCIPLINE_REGISTER_PATH,
  DISCIPLINE_APPEALS_PATH,
  DISCIPLINE_APPEALS_NEW_PATH,
  DISCIPLINE_APPEALS_REVIEW_PATH,
  DISCIPLINE_APPEALS_REPORTS_PATH,
  disciplineAppealReviewPath,
  disciplineAppealTrackingPath,
  disciplineCasePath,
  disciplineHistoryPath,
} from './disciplineRouting';

describe('rutas de disciplina', () => {
  it('apunta al grupo /admin/discipline', () => {
    expect(DISCIPLINE_DASHBOARD_PATH).toBe('/admin/discipline/dashboard');
    expect(DISCIPLINE_CASES_PATH).toBe('/admin/discipline/cases');
    expect(disciplineCasePath(2)).toBe('/admin/discipline/cases/2');
    expect(DISCIPLINE_HISTORY_PATH).toBe('/admin/discipline/history');
    expect(disciplineHistoryPath(7)).toBe('/admin/discipline/history/7');
    expect(DISCIPLINE_NOTIFICATIONS_PATH).toBe('/admin/discipline/notifications');
    expect(DISCIPLINE_REGISTER_PATH).toBe('/admin/discipline/register');
    expect(DISCIPLINE_CATALOG_PATH).toBe('/admin/discipline/catalog');
    expect(DISCIPLINE_CALENDAR_PATH).toBe('/admin/discipline/calendar');
    expect(DISCIPLINE_PROCESS_PATH).toBe('/admin/discipline/process');
    expect(DISCIPLINE_APPEALS_PATH).toBe('/admin/discipline/appeals');
    expect(DISCIPLINE_APPEALS_NEW_PATH).toBe('/admin/discipline/appeals/new');
    expect(DISCIPLINE_APPEALS_REVIEW_PATH).toBe('/admin/discipline/appeals/review');
    expect(disciplineAppealReviewPath(4)).toBe('/admin/discipline/appeals/review/4');
    expect(disciplineAppealTrackingPath(3)).toBe('/admin/discipline/appeals/3');
    expect(DISCIPLINE_APPEALS_REPORTS_PATH).toBe('/admin/discipline/appeals/reports');
    const paths = [
      DISCIPLINE_DASHBOARD_PATH,
      DISCIPLINE_CASES_PATH,
      DISCIPLINE_HISTORY_PATH,
      DISCIPLINE_NOTIFICATIONS_PATH,
      DISCIPLINE_REGISTER_PATH,
      DISCIPLINE_CATALOG_PATH,
      DISCIPLINE_CALENDAR_PATH,
      DISCIPLINE_PROCESS_PATH,
      DISCIPLINE_APPEALS_PATH,
      DISCIPLINE_APPEALS_NEW_PATH,
      DISCIPLINE_APPEALS_REVIEW_PATH,
      DISCIPLINE_APPEALS_REPORTS_PATH,
      disciplineCasePath(2),
      disciplineAppealReviewPath(4),
      disciplineAppealTrackingPath(3),
    ];
    expect(paths.every((path) => path.startsWith('/admin/discipline/'))).toBe(true);
    expect(paths.some((path) => path.startsWith('/admin/appeals'))).toBe(false);
  });
});