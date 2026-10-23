import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AttendanceAvailableOffering,
  AttendanceGroup,
  AttendanceScheduleOccurrence,
} from '@/entities/attendance';
import { humanizeFromScheduleError } from '@/features/view-my-schedule/model/myScheduleAttendance';
import { attendanceApi } from '../api/attendanceApi';
import { ATTENDANCE_SESSION_PATH } from './attendanceRouting';
import {
  buildCreateAttendanceSessionPayload,
  canSubmitCreateAttendanceSession,
  flowErrorMessage,
  resolveSessionPathAfterCreate,
  shouldApplyOfferingsResponse,
} from './createAttendanceSessionFlow';

export type NewAttendanceSlotAction = 'take' | 'continue' | 'view' | 'blocked';

export function resolveNewAttendanceSlotAction(
  occurrence: AttendanceScheduleOccurrence,
): NewAttendanceSlotAction {
  const session = occurrence.attendanceSession;
  if (session?.status === 'OPEN') return 'continue';
  if (session?.status === 'CLOSED') return 'view';
  // Local/dev: allow starting even outside the clock window (BE may still enforce in production).
  return 'take';
}

export function useCreateAttendanceSessionFlow() {
  const [groups, setGroups] = useState<AttendanceGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [offerings, setOfferings] = useState<AttendanceAvailableOffering[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [offeringsError, setOfferingsError] = useState<string | null>(null);

  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState<AttendanceScheduleOccurrence[]>(
    [],
  );
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [selectedAnchorEntryId, setSelectedAnchorEntryId] = useState<
    number | null
  >(null);
  const [selectedTeachingAssignmentId, setSelectedTeachingAssignmentId] =
    useState<number | null>(null);
  /** When true, user chose manual offering instead of a schedule slot. */
  const [manualMode, setManualMode] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadRequestIdRef = useRef(0);
  const selectedGroupIdRef = useRef<number | null>(null);
  selectedGroupIdRef.current = selectedGroupId;

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      setGroups(await attendanceApi.listAttendanceGroups());
    } catch (reason) {
      setGroups([]);
      setGroupsError(
        flowErrorMessage(reason, 'No se pudieron cargar los grupos.'),
      );
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  const loadGroupDetails = useCallback(async (groupId: number) => {
    const requestId = ++loadRequestIdRef.current;
    setOfferingsLoading(true);
    setScheduleLoading(true);
    setOfferingsError(null);
    setScheduleError(null);
    setOfferings([]);
    setOccurrences([]);
    setScheduleDate(null);

    const applyId = () =>
      shouldApplyOfferingsResponse(requestId, loadRequestIdRef.current);

    try {
      const [offeringsRows, context] = await Promise.all([
        attendanceApi.getAvailableOfferings(groupId),
        attendanceApi.getScheduleContext({ groupId }),
      ]);
      if (!applyId()) return;
      setOfferings(offeringsRows);
      setOccurrences(context.occurrences ?? []);
      setScheduleDate(context.date ?? null);
    } catch (reason) {
      if (!applyId()) return;
      setOfferings([]);
      setOccurrences([]);
      const msg = flowErrorMessage(
        reason,
        'No se pudieron cargar horario y asignaciones del grupo.',
      );
      setOfferingsError(msg);
      setScheduleError(msg);
    } finally {
      if (applyId()) {
        setOfferingsLoading(false);
        setScheduleLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroupId == null) {
      loadRequestIdRef.current += 1;
      setOfferings([]);
      setOccurrences([]);
      setScheduleDate(null);
      setOfferingsLoading(false);
      setScheduleLoading(false);
      setOfferingsError(null);
      setScheduleError(null);
      return;
    }

    void loadGroupDetails(selectedGroupId);

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [selectedGroupId, loadGroupDetails]);

  const selectGroup = useCallback((groupId: number | null) => {
    setSelectedGroupId(groupId);
    setSelectedTeachingAssignmentId(null);
    setSelectedAnchorEntryId(null);
    setManualMode(false);
    setCreateError(null);
  }, []);

  const selectScheduleSlot = useCallback(
    (occurrence: AttendanceScheduleOccurrence) => {
      setManualMode(false);
      setSelectedAnchorEntryId(occurrence.anchorEntryId);
      setSelectedTeachingAssignmentId(occurrence.teachingAssignmentId);
      setCreateError(null);
    },
    [],
  );

  const selectOffering = useCallback((teachingAssignmentId: number) => {
    setManualMode(true);
    setSelectedAnchorEntryId(null);
    setSelectedTeachingAssignmentId(teachingAssignmentId);
    setCreateError(null);
  }, []);

  const retryGroupDetails = useCallback(() => {
    const groupId = selectedGroupIdRef.current;
    if (groupId == null) return;
    setSelectedTeachingAssignmentId(null);
    setSelectedAnchorEntryId(null);
    setManualMode(false);
    setCreateError(null);
    void loadGroupDetails(groupId);
  }, [loadGroupDetails]);

  const selectedOccurrence =
    occurrences.find((o) => o.anchorEntryId === selectedAnchorEntryId) ?? null;

  const selectedSlotAction = selectedOccurrence
    ? resolveNewAttendanceSlotAction(selectedOccurrence)
    : null;

  const canStartSchedule =
    !manualMode &&
    selectedOccurrence != null &&
    selectedSlotAction != null &&
    selectedSlotAction !== 'blocked' &&
    !scheduleLoading &&
    !creating;

  const canStartManual =
    manualMode &&
    canSubmitCreateAttendanceSession({
      groupId: selectedGroupId,
      teachingAssignmentId: selectedTeachingAssignmentId,
      groupsLoading,
      offeringsLoading,
      creating,
    });

  const canStart = canStartSchedule || canStartManual;

  const startClass = useCallback(async (): Promise<
    { ok: true; path: string } | { ok: false; error: string } | null
  > => {
    if (creating) return null;

    if (!manualMode && selectedOccurrence) {
      const action = resolveNewAttendanceSlotAction(selectedOccurrence);
      if (action === 'continue' || action === 'view') {
        const sessionId = selectedOccurrence.attendanceSession?.id;
        if (sessionId == null) return null;
        return { ok: true, path: ATTENDANCE_SESSION_PATH(sessionId) };
      }
      if (action === 'take') {
        setCreating(true);
        setCreateError(null);
        try {
          const result =
            await attendanceApi.createAttendanceSessionFromSchedule({
              scheduleEntryId: selectedOccurrence.anchorEntryId,
            });
          return { ok: true, path: resolveSessionPathAfterCreate(result) };
        } catch (reason) {
          const error = humanizeFromScheduleError(reason);
          setCreateError(error);
          return { ok: false, error };
        } finally {
          setCreating(false);
        }
      }
      setCreateError(
        'Esta clase está fuera de la ventana de inicio. Use clase extraordinaria o espere el horario.',
      );
      return {
        ok: false,
        error:
          'Esta clase está fuera de la ventana de inicio. Use clase extraordinaria o espere el horario.',
      };
    }

    const payload = buildCreateAttendanceSessionPayload(
      selectedGroupId,
      selectedTeachingAssignmentId,
    );
    if (!payload) return null;

    setCreating(true);
    setCreateError(null);
    try {
      const result = await attendanceApi.createAttendanceSession(payload);
      return { ok: true, path: resolveSessionPathAfterCreate(result) };
    } catch (reason) {
      const error = flowErrorMessage(reason, 'No se pudo iniciar la clase.');
      setCreateError(error);
      return { ok: false, error };
    } finally {
      setCreating(false);
    }
  }, [
    creating,
    manualMode,
    selectedGroupId,
    selectedOccurrence,
    selectedTeachingAssignmentId,
  ]);

  const primaryLabel = (() => {
    if (creating) return 'Iniciando…';
    if (!manualMode && selectedSlotAction === 'continue') {
      return 'Continuar asistencia';
    }
    if (!manualMode && selectedSlotAction === 'view') {
      return 'Ver asistencia';
    }
    if (!manualMode && selectedSlotAction === 'take') {
      return 'Tomar asistencia';
    }
    return 'Iniciar clase';
  })();

  return {
    groups,
    groupsLoading,
    groupsError,
    reloadGroups: loadGroups,
    selectedGroupId,
    selectGroup,
    offerings,
    offeringsLoading,
    offeringsError,
    scheduleLoading,
    scheduleError,
    scheduleDate,
    occurrences,
    retryGroupDetails,
    selectedAnchorEntryId,
    selectedTeachingAssignmentId,
    selectScheduleSlot,
    selectOffering,
    manualMode,
    creating,
    createError,
    canStart,
    primaryLabel,
    startClass,
    resolveSlotAction: resolveNewAttendanceSlotAction,
  };
}
