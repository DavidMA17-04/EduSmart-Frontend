import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AttendanceRosterStudent,
  AttendanceSessionDetail,
  AttendanceStatus,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import { sessionHasPermission } from '@/shared/auth';
import { attendanceApi } from '../api/attendanceApi';
import {
  applyClosedSessionLocally,
  buildFinalizeConfirmCopy,
  getFinalizeButtonState,
  isAttendanceSessionAlreadyClosedError,
  shouldContinueCloseAfterSave,
  type AttendanceFinalizeOutcome,
} from './attendanceClose';
import { ATTENDANCE_PERMISSIONS } from './attendanceRouting';
import { flowErrorMessage } from './createAttendanceSessionFlow';
import {
  applyDraftStatusChange,
  buildDirtyAttendancePayload,
  buildInitialDraft,
  canSaveAttendanceChanges,
  cloneDraft,
  collectDirtyStudentIds,
  filterRosterByQuery,
  getSaveButtonState,
  isAttendanceSessionEditable,
  isAttendanceSessionNotOpenError,
  isStudentDirty,
  reconcileDraftAfterSave,
  summarizeDraft,
  type AttendanceDraftMap,
  type AttendanceSaveOutcome,
} from './attendanceDraft';

export type SessionLoadErrorKind = 'not_found' | 'forbidden' | 'generic';

export type AttendanceSaveResult = {
  outcome: AttendanceSaveOutcome;
  message: string | null;
};

export type AttendanceFinalizeResult = {
  outcome: AttendanceFinalizeOutcome;
  message: string | null;
  savedBeforeClose: boolean;
};

function classifyLoadError(reason: unknown): {
  kind: SessionLoadErrorKind;
  message: string;
} {
  if (reason instanceof HttpError) {
    if (reason.status === 404) {
      return {
        kind: 'not_found',
        message: 'No encontramos esta sesión de asistencia.',
      };
    }
    if (reason.status === 403) {
      return {
        kind: 'forbidden',
        message: reason.message || 'No tienes permiso para ver esta sesión.',
      };
    }
    return { kind: 'generic', message: reason.message };
  }
  return {
    kind: 'generic',
    message: flowErrorMessage(reason, 'No se pudo cargar la sesión.'),
  };
}

export function useAttendanceSession(sessionId: number | null) {
  const [session, setSession] = useState<AttendanceSessionDetail | null>(null);
  const [roster, setRoster] = useState<AttendanceRosterStudent[]>([]);
  const [initialDraft, setInitialDraft] = useState<AttendanceDraftMap>({});
  const [draft, setDraft] = useState<AttendanceDraftMap>({});

  const [loading, setLoading] = useState(sessionId != null);
  const [sessionError, setSessionError] = useState<{
    kind: SessionLoadErrorKind;
    message: string;
  } | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const [finalizeOpen, setFinalizeOpen] = useState(false);

  const canEdit = sessionHasPermission(ATTENDANCE_PERMISSIONS.edit);
  const busy = saving || closing;

  const applyRosterRows = useCallback((rows: AttendanceRosterStudent[]) => {
    setRoster(rows);
    const initial = buildInitialDraft(rows);
    setInitialDraft(initial);
    setDraft(cloneDraft(initial));
  }, []);

  useEffect(() => {
    if (sessionId == null) {
      setLoading(false);
      setSession(null);
      setRoster([]);
      setInitialDraft({});
      setDraft({});
      setSessionError(null);
      setRosterError(null);
      setSaveError(null);
      setCloseError(null);
      setRefreshWarning(null);
      setFinalizeOpen(false);
      return;
    }

    let active = true;

    const run = async () => {
      setLoading(true);
      setSessionError(null);
      setRosterError(null);
      setSaveError(null);
      setCloseError(null);
      setRefreshWarning(null);

      const [sessionResult, rosterResult] = await Promise.allSettled([
        attendanceApi.getAttendanceSession(sessionId),
        attendanceApi.getAttendanceRoster(sessionId),
      ]);

      if (!active) return;

      if (sessionResult.status === 'fulfilled') {
        setSession(sessionResult.value);
      } else {
        setSession(null);
        setSessionError(classifyLoadError(sessionResult.reason));
      }

      if (rosterResult.status === 'fulfilled') {
        applyRosterRows(rosterResult.value);
        setRosterError(null);
      } else {
        setRoster([]);
        setInitialDraft({});
        setDraft({});
        setRosterError(
          flowErrorMessage(
            rosterResult.reason,
            'No pudimos cargar los estudiantes.',
          ),
        );
      }

      setLoading(false);
    };

    void run();

    return () => {
      active = false;
    };
  }, [sessionId, applyRosterRows]);

  const reloadRoster = useCallback(async () => {
    if (sessionId == null) return;
    setRosterError(null);
    setRefreshWarning(null);
    try {
      const rows = await attendanceApi.getAttendanceRoster(sessionId);
      applyRosterRows(rows);
    } catch (reason) {
      setRosterError(
        flowErrorMessage(reason, 'No pudimos cargar los estudiantes.'),
      );
    }
  }, [applyRosterRows, sessionId]);

  const reloadSessionMeta = useCallback(async () => {
    if (sessionId == null) return null;
    try {
      const detail = await attendanceApi.getAttendanceSession(sessionId);
      setSession(detail);
      return detail;
    } catch {
      return null;
    }
  }, [sessionId]);

  const editable = isAttendanceSessionEditable({
    sessionStatus: session?.status,
    canEdit,
  });
  const readOnly = !editable;

  const setStatus = useCallback(
    (userId: number, nextStatus: AttendanceStatus) => {
      if (!session || busy) return;
      setDraft((current) =>
        applyDraftStatusChange({
          sessionStatus: session.status,
          canEdit,
          draft: current,
          userId,
          nextStatus,
        }),
      );
      setSaveError(null);
      setCloseError(null);
      setRefreshWarning(null);
    },
    [busy, canEdit, session],
  );

  const studentIds = useMemo(
    () => roster.map((row) => row.userId),
    [roster],
  );

  const dirtyIds = useMemo(
    () =>
      editable
        ? collectDirtyStudentIds(initialDraft, draft, studentIds)
        : [],
    [draft, editable, initialDraft, studentIds],
  );

  const summary = useMemo(
    () => summarizeDraft(draft, studentIds),
    [draft, studentIds],
  );

  const visibleRoster = useMemo(
    () => filterRosterByQuery(roster, searchQuery),
    [roster, searchQuery],
  );

  const isDirtyStudent = useCallback(
    (userId: number) =>
      editable && isStudentDirty(initialDraft, draft, userId),
    [draft, editable, initialDraft],
  );

  const saveButton = getSaveButtonState({
    sessionStatus: session?.status,
    canEdit,
    dirtyCount: dirtyIds.length,
    saving,
    closing,
  });

  const finalizeButton = getFinalizeButtonState({
    sessionStatus: session?.status,
    canEdit,
    saving,
    closing,
  });

  const finalizeConfirm = buildFinalizeConfirmCopy({
    dirtyCount: dirtyIds.length,
    unmarkedCount: summary.unmarked,
  });

  const canSave = canSaveAttendanceChanges({
    sessionStatus: session?.status,
    canEdit,
    dirtyCount: dirtyIds.length,
    saving,
    closing,
  });

  /** Shared PUT primitive used by saveChanges and finalizeClass. */
  const performSave = useCallback(async (): Promise<AttendanceSaveResult> => {
    if (sessionId == null || !session) {
      return { outcome: 'noop', message: null };
    }

    const payload = buildDirtyAttendancePayload(roster, initialDraft, draft);
    if (payload.records.length === 0) {
      return { outcome: 'noop', message: null };
    }

    setSaveError(null);
    setRefreshWarning(null);

    try {
      const saved = await attendanceApi.saveAttendanceRecords(
        sessionId,
        payload,
      );

      try {
        const rows = await attendanceApi.getAttendanceRoster(sessionId);
        applyRosterRows(rows);
        return {
          outcome: 'saved',
          message: 'Asistencia guardada correctamente.',
        };
      } catch {
        const reconciled = reconcileDraftAfterSave(initialDraft, draft, saved);
        setInitialDraft(reconciled.initial);
        setDraft(reconciled.draft);
        const warning =
          'Los cambios se guardaron, pero no pudimos actualizar la lista.';
        setRefreshWarning(warning);
        return { outcome: 'saved_refresh_failed', message: warning };
      }
    } catch (reason) {
      if (isAttendanceSessionNotOpenError(reason)) {
        await reloadSessionMeta();
        try {
          const rows = await attendanceApi.getAttendanceRoster(sessionId);
          applyRosterRows(rows);
        } catch {
          // keep current roster/draft
        }
        const message =
          'Esta sesión ya no está abierta. Los cambios no se pudieron guardar.';
        setSaveError(message);
        return { outcome: 'session_closed', message };
      }

      const message = flowErrorMessage(
        reason,
        'No pudimos guardar los cambios.',
      );
      setSaveError(message);
      return { outcome: 'error', message };
    }
  }, [
    applyRosterRows,
    draft,
    initialDraft,
    reloadSessionMeta,
    roster,
    session,
    sessionId,
  ]);

  const saveChanges = useCallback(async (): Promise<AttendanceSaveResult> => {
    if (sessionId == null || !session) {
      return { outcome: 'noop', message: null };
    }
    if (busy) {
      return { outcome: 'noop', message: null };
    }
    if (
      !canSaveAttendanceChanges({
        sessionStatus: session.status,
        canEdit,
        dirtyCount: dirtyIds.length,
        saving: false,
        closing: false,
      })
    ) {
      return { outcome: 'noop', message: null };
    }

    setSaving(true);
    try {
      return await performSave();
    } finally {
      setSaving(false);
    }
  }, [
    busy,
    canEdit,
    dirtyIds.length,
    performSave,
    session,
    sessionId,
  ]);

  const openFinalizeDialog = useCallback(() => {
    if (!finalizeButton.enabled) return;
    setCloseError(null);
    setFinalizeOpen(true);
  }, [finalizeButton.enabled]);

  const cancelFinalizeDialog = useCallback(() => {
    if (closing) return;
    setFinalizeOpen(false);
  }, [closing]);

  const confirmFinalize = useCallback(async (): Promise<AttendanceFinalizeResult> => {
    if (sessionId == null || !session) {
      return { outcome: 'noop', message: null, savedBeforeClose: false };
    }
    if (busy) {
      return { outcome: 'noop', message: null, savedBeforeClose: false };
    }
    if (session.status !== 'OPEN' || !canEdit) {
      return { outcome: 'noop', message: null, savedBeforeClose: false };
    }

    setClosing(true);
    setCloseError(null);
    let savedBeforeClose = false;

    try {
      if (dirtyIds.length > 0) {
        setSaving(true);
        let saveResult: AttendanceSaveResult;
        try {
          saveResult = await performSave();
        } finally {
          setSaving(false);
        }

        if (!shouldContinueCloseAfterSave(saveResult.outcome)) {
          setFinalizeOpen(false);
          const message =
            saveResult.message ??
            'No pudimos guardar los cambios. La clase no fue finalizada.';
          setSaveError(message);
          return {
            outcome:
              saveResult.outcome === 'session_closed'
                ? 'session_closed'
                : 'save_failed',
            message:
              saveResult.outcome === 'session_closed'
                ? message
                : 'No pudimos guardar los cambios. La clase no fue finalizada.',
            savedBeforeClose: false,
          };
        }

        if (
          saveResult.outcome === 'saved' ||
          saveResult.outcome === 'saved_refresh_failed'
        ) {
          savedBeforeClose = true;
        }
      }

      try {
        const mutation = await attendanceApi.closeAttendanceSession(sessionId);

        try {
          const detail = await attendanceApi.getAttendanceSession(sessionId);
          setSession(detail);
          setFinalizeOpen(false);
          return {
            outcome: 'finalized',
            message: 'Clase finalizada correctamente.',
            savedBeforeClose,
          };
        } catch {
          setSession((current) =>
            current
              ? applyClosedSessionLocally(current, {
                  status: mutation.status ?? 'CLOSED',
                  closedAt: mutation.closedAt ?? new Date().toISOString(),
                })
              : current,
          );
          setFinalizeOpen(false);
          const message =
            'La clase fue finalizada, pero no pudimos actualizar toda la información.';
          setRefreshWarning(message);
          return {
            outcome: 'finalized_refresh_failed',
            message,
            savedBeforeClose,
          };
        }
      } catch (reason) {
        if (isAttendanceSessionAlreadyClosedError(reason)) {
          await reloadSessionMeta();
          setFinalizeOpen(false);
          const message = 'La clase ya había sido finalizada.';
          setCloseError(message);
          return {
            outcome: 'already_closed',
            message,
            savedBeforeClose,
          };
        }

        const message = savedBeforeClose
          ? 'La asistencia se guardó, pero no pudimos finalizar la clase.'
          : flowErrorMessage(reason, 'No pudimos finalizar la clase.');
        setCloseError(message);
        setFinalizeOpen(false);
        return {
          outcome: 'close_failed',
          message,
          savedBeforeClose,
        };
      }
    } finally {
      setClosing(false);
    }
  }, [
    busy,
    canEdit,
    dirtyIds.length,
    performSave,
    reloadSessionMeta,
    session,
    sessionId,
  ]);

  return {
    session,
    roster,
    loading,
    sessionError,
    rosterError,
    reloadRoster,
    reloadSessionMeta,
    searchQuery,
    setSearchQuery,
    visibleRoster,
    draft,
    setStatus,
    readOnly,
    controlsDisabled: readOnly || busy,
    canEdit,
    dirtyIds,
    dirtyCount: dirtyIds.length,
    summary,
    isDirtyStudent,
    saving,
    closing,
    busy,
    saveError,
    closeError,
    refreshWarning,
    saveButton,
    finalizeButton,
    finalizeConfirm,
    finalizeOpen,
    openFinalizeDialog,
    cancelFinalizeDialog,
    canSave,
    saveChanges,
    confirmFinalize,
  };
}
