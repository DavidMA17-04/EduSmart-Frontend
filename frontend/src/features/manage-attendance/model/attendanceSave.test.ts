import { describe, expect, it } from 'vitest';
import type { AttendanceRosterStudent } from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import {
  buildDirtyAttendancePayload,
  buildInitialDraft,
  canSaveAttendanceChanges,
  getSaveButtonState,
  isAttendanceSessionNotOpenError,
  reconcileDraftAfterSave,
  setStudentDraftStatus,
} from './attendanceDraft';

const roster: AttendanceRosterStudent[] = [
  {
    userId: 1,
    nationalId: 'n1',
    fullName: 'Ana',
    attendance: null,
  },
  {
    userId: 2,
    nationalId: 'n2',
    fullName: 'Carlos',
    attendance: {
      id: 10,
      status: 'PRESENT',
      registrationMethod: 'MANUAL',
      registeredAt: '2026-09-11T16:00:00.000Z',
      registeredByUserId: 505,
      updatedAt: '2026-09-11T16:00:00.000Z',
      updatedByUserId: null,
    },
  },
  {
    userId: 3,
    nationalId: 'n3',
    fullName: 'Sofía',
    attendance: null,
  },
];

describe('attendance save payload', () => {
  it('1. dirty vacío → payload []', () => {
    const initial = buildInitialDraft(roster);
    expect(buildDirtyAttendancePayload(roster, initial, initial).records).toEqual(
      [],
    );
  });

  it('2. null initial → PRESENT draft → payload PRESENT', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 1, 'PRESENT');
    expect(buildDirtyAttendancePayload(roster, initial, draft).records).toEqual([
      { studentUserId: 1, status: 'PRESENT' },
    ]);
  });

  it('3. PRESENT initial → LATE draft → payload LATE', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 2, 'LATE');
    expect(buildDirtyAttendancePayload(roster, initial, draft).records).toEqual([
      { studentUserId: 2, status: 'LATE' },
    ]);
  });

  it('4. registro no dirty → no se incluye', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 1, 'ABSENT');
    const payload = buildDirtyAttendancePayload(roster, initial, draft);
    expect(payload.records.every((r) => r.studentUserId !== 2)).toBe(true);
  });

  it('5. múltiples dirty → solo esos records', () => {
    const initial = buildInitialDraft(roster);
    let draft = setStudentDraftStatus(initial, 1, 'PRESENT');
    draft = setStudentDraftStatus(draft, 3, 'ABSENT');
    expect(buildDirtyAttendancePayload(roster, initial, draft).records).toEqual([
      { studentUserId: 1, status: 'PRESENT' },
      { studentUserId: 3, status: 'ABSENT' },
    ]);
  });

  it('6. payload conserva orden del roster', () => {
    const initial = buildInitialDraft(roster);
    let draft = setStudentDraftStatus(initial, 3, 'LATE');
    draft = setStudentDraftStatus(draft, 1, 'PRESENT');
    expect(
      buildDirtyAttendancePayload(roster, initial, draft).records.map(
        (r) => r.studentUserId,
      ),
    ).toEqual([1, 3]);
  });

  it('7. nunca envía status null', () => {
    const initial = buildInitialDraft(roster);
    // Simulate illegal null draft (UI cannot do this); payload must skip.
    const draft = { ...initial, 2: null };
    const payload = buildDirtyAttendancePayload(roster, initial, draft);
    expect(payload.records.every((r) => r.status != null)).toBe(true);
    expect(payload.records.find((r) => r.studentUserId === 2)).toBeUndefined();
  });
});

describe('canSave / save button', () => {
  it('8. canSave false sin dirty', () => {
    expect(
      canSaveAttendanceChanges({
        sessionStatus: 'OPEN',
        canEdit: true,
        dirtyCount: 0,
        saving: false,
      }),
    ).toBe(false);
  });

  it('9. canSave false CLOSED', () => {
    expect(
      canSaveAttendanceChanges({
        sessionStatus: 'CLOSED',
        canEdit: true,
        dirtyCount: 2,
        saving: false,
      }),
    ).toBe(false);
  });

  it('10. canSave false sin attendance.edit', () => {
    expect(
      canSaveAttendanceChanges({
        sessionStatus: 'OPEN',
        canEdit: false,
        dirtyCount: 2,
        saving: false,
      }),
    ).toBe(false);
    expect(
      getSaveButtonState({
        sessionStatus: 'OPEN',
        canEdit: false,
        dirtyCount: 2,
        saving: false,
      }).visible,
    ).toBe(false);
  });

  it('11. canSave false saving=true', () => {
    expect(
      canSaveAttendanceChanges({
        sessionStatus: 'OPEN',
        canEdit: true,
        dirtyCount: 2,
        saving: true,
      }),
    ).toBe(false);
  });

  it('16. doble submit bloqueado por saving', () => {
    const state = getSaveButtonState({
      sessionStatus: 'OPEN',
      canEdit: true,
      dirtyCount: 1,
      saving: true,
    });
    expect(state.visible).toBe(true);
    expect(state.enabled).toBe(false);
    expect(state.label).toBe('Guardando…');
  });
});

describe('save outcomes helpers', () => {
  it('12. PUT success + roster refresh → dirty vacío vía rebuild initial', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 1, 'PRESENT');
    const refreshed = [
      {
        ...roster[0],
        attendance: {
          id: 99,
          status: 'PRESENT' as const,
          registrationMethod: 'MANUAL' as const,
          registeredAt: '2026-09-11T16:01:00.000Z',
          registeredByUserId: 505,
          updatedAt: '2026-09-11T16:01:00.000Z',
          updatedByUserId: null,
        },
      },
      roster[1],
      roster[2],
    ];
    const nextInitial = buildInitialDraft(refreshed);
    expect(
      buildDirtyAttendancePayload(refreshed, nextInitial, nextInitial).records,
    ).toEqual([]);
    expect(nextInitial[1]).toBe('PRESENT');
    // previous dirty draft is discarded after refresh
    void draft;
  });

  it('13. PUT error → draft/dirty se conservan (payload sigue dirty)', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 1, 'PRESENT');
    expect(buildDirtyAttendancePayload(roster, initial, draft).records).toHaveLength(
      1,
    );
  });

  it('14. PUT success + refresh failure → reconcile saved-but-refresh-failed', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 1, 'PRESENT');
    const reconciled = reconcileDraftAfterSave(initial, draft, [
      { studentUserId: 1, status: 'PRESENT' },
    ]);
    expect(
      buildDirtyAttendancePayload(
        roster,
        reconciled.initial,
        reconciled.draft,
      ).records,
    ).toEqual([]);
  });

  it('15. ATTENDANCE_SESSION_NOT_OPEN → contrato detectado', () => {
    expect(
      isAttendanceSessionNotOpenError(
        new HttpError(
          400,
          'Attendance records can only be modified while session is OPEN',
        ),
      ),
    ).toBe(true);
    expect(
      isAttendanceSessionNotOpenError(
        new HttpError(400, 'ATTENDANCE_SESSION_NOT_OPEN'),
      ),
    ).toBe(true);
    expect(isAttendanceSessionNotOpenError(new HttpError(403, 'Forbidden'))).toBe(
      false,
    );
  });
});
