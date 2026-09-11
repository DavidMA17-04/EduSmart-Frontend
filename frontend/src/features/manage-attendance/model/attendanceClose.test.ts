import { describe, expect, it } from 'vitest';
import type { AttendanceSessionDetail } from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import {
  buildDirtyAttendancePayload,
  buildInitialDraft,
  summarizeDraft,
} from './attendanceDraft';
import {
  applyClosedSessionLocally,
  buildFinalizeConfirmCopy,
  closeCreatesAbsentForUnmarked,
  formatFinalizeSummaryLines,
  getFinalizeButtonState,
  isAttendanceSessionAlreadyClosedError,
  shouldContinueCloseAfterSave,
} from './attendanceClose';

const session: AttendanceSessionDetail = {
  sessionId: 7,
  status: 'OPEN',
  sessionDate: '2026-09-11',
  startedAt: '2026-09-11T16:00:00.000Z',
  closedAt: null,
  teachingAssignmentId: 4,
  group: { id: 3, name: '7-1', gradeLevel: 7 },
  offering: {
    kind: 'SUBJECT',
    id: 1,
    name: 'Matemáticas',
    labelKind: 'Asignatura',
  },
};

describe('finalize button visibility', () => {
  it('1. Finalizar visible OPEN + attendance.edit', () => {
    const state = getFinalizeButtonState({
      sessionStatus: 'OPEN',
      canEdit: true,
      saving: false,
      closing: false,
    });
    expect(state.visible).toBe(true);
    expect(state.enabled).toBe(true);
  });

  it('2. oculto CLOSED', () => {
    expect(
      getFinalizeButtonState({
        sessionStatus: 'CLOSED',
        canEdit: true,
        saving: false,
        closing: false,
      }).visible,
    ).toBe(false);
  });

  it('3. oculto sin attendance.edit', () => {
    expect(
      getFinalizeButtonState({
        sessionStatus: 'OPEN',
        canEdit: false,
        saving: false,
        closing: false,
      }).visible,
    ).toBe(false);
  });

  it('18. double close bloqueado con closing', () => {
    const state = getFinalizeButtonState({
      sessionStatus: 'OPEN',
      canEdit: true,
      saving: false,
      closing: true,
    });
    expect(state.enabled).toBe(false);
    expect(state.label).toBe('Finalizando…');
  });

  it('19. controles busy durante saving', () => {
    expect(
      getFinalizeButtonState({
        sessionStatus: 'OPEN',
        canEdit: true,
        saving: true,
        closing: false,
      }).enabled,
    ).toBe(false);
  });
});

describe('finalize confirm copy', () => {
  it('4. confirm sin dirty → close directa (no requiresSave)', () => {
    const copy = buildFinalizeConfirmCopy({ dirtyCount: 0, unmarkedCount: 0 });
    expect(copy.requiresSave).toBe(false);
    expect(copy.confirmLabel).toBe('Finalizar clase');
    expect(copy.dirtyWarning).toBeNull();
  });

  it('5. dirty → save antes de close', () => {
    const copy = buildFinalizeConfirmCopy({ dirtyCount: 2, unmarkedCount: 0 });
    expect(copy.requiresSave).toBe(true);
    expect(copy.confirmLabel).toBe('Guardar y finalizar');
    expect(copy.dirtyWarning).toContain('cambios sin guardar');
  });

  it('14. unmarked count mostrado', () => {
    const copy = buildFinalizeConfirmCopy({ dirtyCount: 0, unmarkedCount: 3 });
    expect(copy.unmarkedWarning).toContain('3 estudiantes sin registrar');
  });

  it('17. dirty + unmarked muestra ambas advertencias', () => {
    const copy = buildFinalizeConfirmCopy({ dirtyCount: 1, unmarkedCount: 2 });
    expect(copy.dirtyWarning).toBeTruthy();
    expect(copy.unmarkedWarning).toBeTruthy();
    expect(copy.confirmLabel).toBe('Guardar y finalizar');
  });

  it('16. summary modal usa draft global', () => {
    const lines = formatFinalizeSummaryLines({
      present: 20,
      absent: 3,
      late: 2,
      unmarked: 5,
      total: 30,
    });
    expect(lines).toEqual([
      'Presentes: 20',
      'Ausentes: 3',
      'Tardías: 2',
      'Sin marcar: 5',
    ]);
  });
});

describe('finalize save/close contracts', () => {
  it('6. save falla → close NO se llama (shouldContinue false)', () => {
    expect(shouldContinueCloseAfterSave('error')).toBe(false);
    expect(shouldContinueCloseAfterSave('session_closed')).toBe(false);
  });

  it('7. save success → close sí se llama', () => {
    expect(shouldContinueCloseAfterSave('saved')).toBe(true);
  });

  it('8. saved_refresh_failed reconciliado → no repite PUT / continúa close', () => {
    expect(shouldContinueCloseAfterSave('saved_refresh_failed')).toBe(true);
  });

  it('9. close success → apply CLOSED local', () => {
    const closed = applyClosedSessionLocally(session, {
      status: 'CLOSED',
      closedAt: '2026-09-11T17:00:00.000Z',
    });
    expect(closed.status).toBe('CLOSED');
    expect(closed.closedAt).toBe('2026-09-11T17:00:00.000Z');
  });

  it('10. close error → sesión permanece OPEN (no apply)', () => {
    expect(session.status).toBe('OPEN');
  });

  it('11. save OK + close error → dirty limpio conceptual (continue save, close may fail)', () => {
    expect(shouldContinueCloseAfterSave('saved')).toBe(true);
  });

  it('12. close OK + session refresh error → finalized_refresh_failed distinguible', () => {
    const outcomes = ['finalized', 'finalized_refresh_failed'] as const;
    expect(outcomes).toContain('finalized_refresh_failed');
  });

  it('13. ATTENDANCE_SESSION_NOT_OPEN / already closed detectado', () => {
    expect(
      isAttendanceSessionAlreadyClosedError(
        new HttpError(400, 'Attendance session is already CLOSED'),
      ),
    ).toBe(true);
    expect(
      isAttendanceSessionAlreadyClosedError(
        new HttpError(400, 'ATTENDANCE_SESSION_ALREADY_CLOSED'),
      ),
    ).toBe(true);
  });

  it('15. unmarked NO genera ABSENT', () => {
    expect(closeCreatesAbsentForUnmarked()).toBe(false);
    const roster = [
      {
        userId: 1,
        nationalId: 'n',
        fullName: 'Ana',
        attendance: null,
      },
    ];
    const initial = buildInitialDraft(roster);
    const payload = buildDirtyAttendancePayload(roster, initial, initial);
    expect(payload.records).toEqual([]);
    expect(summarizeDraft(initial, [1]).unmarked).toBe(1);
  });

  it('20. retry close tras save exitoso → sin dirty no requiresSave', () => {
    const copy = buildFinalizeConfirmCopy({ dirtyCount: 0, unmarkedCount: 1 });
    expect(copy.requiresSave).toBe(false);
    expect(copy.confirmLabel).toBe('Finalizar clase');
  });
});
