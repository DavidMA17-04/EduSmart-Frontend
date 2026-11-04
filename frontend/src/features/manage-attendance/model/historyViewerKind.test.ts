import { describe, expect, it } from 'vitest';
import { resolveHistoryViewerKind } from './useAttendanceHistoryPanel';

const has = (...codes: string[]) => (code: string) => codes.includes(code);

describe('resolveHistoryViewerKind', () => {
  it('treats attendance.view as staff', () => {
    expect(resolveHistoryViewerKind(['Docente'], has('attendance.view'))).toBe('staff');
  });

  it('treats an Estudiante with view_own as student', () => {
    expect(resolveHistoryViewerKind(['Estudiante'], has('attendance.view_own'))).toBe('student');
  });

  it('treats an Encargado with view_own as guardian', () => {
    expect(resolveHistoryViewerKind(['Encargado'], has('attendance.view_own'))).toBe('guardian');
  });

  it('keeps own scope when a user is both guardian and student', () => {
    expect(
      resolveHistoryViewerKind(['Encargado', 'Estudiante'], has('attendance.view_own')),
    ).toBe('student');
  });

  it('falls back to staff without own-scope signals', () => {
    expect(resolveHistoryViewerKind(['Docente'], has())).toBe('staff');
  });
});
