import { describe, expect, it } from 'vitest';
import type { AttendanceRosterStudent } from '@/entities/attendance';
import {
  applyDraftStatusChange,
  ATTENDANCE_STATUS_OPTIONS,
  buildInitialDraft,
  collectDirtyStudentIds,
  filterRosterByQuery,
  isAttendanceSessionReadOnly,
  isStudentDirty,
  setStudentDraftStatus,
  summarizeDraft,
} from './attendanceDraft';

const roster: AttendanceRosterStudent[] = [
  {
    userId: 1,
    nationalId: '1-2345-6789',
    fullName: 'Ana Rodríguez',
    attendance: null,
  },
  {
    userId: 2,
    nationalId: '2-1111-2222',
    fullName: 'Bruno Soto',
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
    nationalId: '3-0000-0000',
    fullName: 'Carla Mora',
    attendance: {
      id: 11,
      status: 'ABSENT',
      registrationMethod: 'MANUAL',
      registeredAt: '2026-09-11T16:00:00.000Z',
      registeredByUserId: 505,
      updatedAt: '2026-09-11T16:00:00.000Z',
      updatedByUserId: null,
    },
  },
  {
    userId: 4,
    nationalId: '4-5555-6666',
    fullName: 'Diego Rojas',
    attendance: {
      id: 12,
      status: 'LATE',
      registrationMethod: 'MANUAL',
      registeredAt: '2026-09-11T16:00:00.000Z',
      registeredByUserId: 505,
      updatedAt: '2026-09-11T16:00:00.000Z',
      updatedByUserId: null,
    },
  },
];

describe('attendanceDraft', () => {
  it('1. roster null → initial null', () => {
    const initial = buildInitialDraft(roster);
    expect(initial[1]).toBeNull();
  });

  it('2. roster PRESENT → initial PRESENT', () => {
    const initial = buildInitialDraft(roster);
    expect(initial[2]).toBe('PRESENT');
  });

  it('3. cambiar null → PRESENT => dirty', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 1, 'PRESENT');
    expect(isStudentDirty(initial, draft, 1)).toBe(true);
  });

  it('4. cambiar PRESENT → LATE => dirty', () => {
    const initial = buildInitialDraft(roster);
    const draft = setStudentDraftStatus(initial, 2, 'LATE');
    expect(isStudentDirty(initial, draft, 2)).toBe(true);
  });

  it('5. cambiar PRESENT → LATE → PRESENT => ya NO dirty', () => {
    const initial = buildInitialDraft(roster);
    const mid = setStudentDraftStatus(initial, 2, 'LATE');
    const draft = setStudentDraftStatus(mid, 2, 'PRESENT');
    expect(isStudentDirty(initial, draft, 2)).toBe(false);
    expect(collectDirtyStudentIds(initial, draft, [1, 2, 3, 4])).toEqual([]);
  });

  it('6. counts correctos PRESENT/ABSENT/LATE/null', () => {
    const draft = buildInitialDraft(roster);
    expect(summarizeDraft(draft, [1, 2, 3, 4])).toEqual({
      present: 1,
      absent: 1,
      late: 1,
      unmarked: 1,
      total: 4,
    });
  });

  it('7. summary usa roster completo (no solo filtro)', () => {
    const draft = buildInitialDraft(roster);
    const visible = filterRosterByQuery(roster, 'Ana');
    expect(visible).toHaveLength(1);
    expect(summarizeDraft(draft, roster.map((r) => r.userId)).total).toBe(4);
  });

  it('8. search fullName case-insensitive', () => {
    expect(filterRosterByQuery(roster, 'ana rodríguez')).toHaveLength(1);
    expect(filterRosterByQuery(roster, 'ANA')).toHaveLength(1);
  });

  it('9. search nationalId', () => {
    expect(filterRosterByQuery(roster, '2-1111')).toHaveLength(1);
    expect(filterRosterByQuery(roster, '1-2345-6789')[0]?.userId).toBe(1);
  });

  it('10. CLOSED no permite cambio', () => {
    const draft = buildInitialDraft(roster);
    const next = applyDraftStatusChange({
      sessionStatus: 'CLOSED',
      canEdit: true,
      draft,
      userId: 1,
      nextStatus: 'PRESENT',
    });
    expect(next).toEqual(draft);
    expect(isAttendanceSessionReadOnly('CLOSED')).toBe(true);
    expect(isAttendanceSessionReadOnly('OPEN')).toBe(false);
  });
});

describe('AttendanceStatusControl contract', () => {
  it('statuses válidos PRESENT/ABSENT/LATE + labels', () => {
    expect(ATTENDANCE_STATUS_OPTIONS.map((o) => o.value)).toEqual([
      'PRESENT',
      'ABSENT',
      'LATE',
    ]);
    expect(ATTENDANCE_STATUS_OPTIONS.map((o) => o.label)).toEqual([
      'Presente',
      'Ausente',
      'Tarde',
    ]);
  });

  it('null permitido como draft sin marcar', () => {
    const initial = buildInitialDraft([roster[0]]);
    expect(initial[1]).toBeNull();
  });

  it('disabled cuando CLOSED vía isAttendanceSessionReadOnly', () => {
    expect(isAttendanceSessionReadOnly('CLOSED')).toBe(true);
  });
});
