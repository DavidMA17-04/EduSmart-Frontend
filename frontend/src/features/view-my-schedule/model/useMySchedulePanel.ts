import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AcademicPeriod } from '@/entities/academic-period';
import type { AttendanceScheduleContext } from '@/entities/attendance';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import { academicPeriodApi } from '@/features/manage-academic-period/api/academicPeriodApi';
import {
  ATTENDANCE_PERMISSIONS,
  attendanceApi,
} from '@/features/manage-attendance';
import {
  groupEntriesByCell,
  visibleSlotsForMatrix,
} from '@/features/manage-schedule';
import { filterPeriodsForSessionRole, getSessionUser, sessionHasPermission } from '@/shared/auth';
import { getMySchedule } from '../api/myScheduleApi';
import {
  indexOccurrencesByEntryId,
  shouldFetchAttendanceScheduleContext,
} from './myScheduleAttendance';
import { resolveMyScheduleCardVariant } from './mySchedulePresentation';

/** Prefer the period of the actor's own entries over the first ACTIVE catalog row. */
export function periodIdFromMyScheduleEntries(
  entries: readonly ScheduleEntry[],
): string {
  const id = entries[0]?.teachingAssignment?.academicPeriod?.id;
  return id != null ? String(id) : '';
}

/** Fallback when the teacher has no own entries yet. */
export function preferredPeriodId(
  periods: readonly AcademicPeriod[],
): string {
  const active = periods.find((period) => period.status === 'ACTIVE');
  const chosen = active ?? periods[0];
  return chosen != null ? String(chosen.id) : '';
}

export const MY_SCHEDULE_COPY = {
  title: 'Mi horario',
  subtitle: 'Consulta tus clases asignadas durante la semana.',
  emptyTitle: 'Sin clases asignadas',
  emptyDescription: 'No tienes clases asignadas para este curso lectivo.',
  errorMessage: 'No se pudo cargar tu horario.',
  retryLabel: 'Reintentar',
} as const;

export function useMySchedulePanel() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [timeSlots, setTimeSlots] = useState<ScheduleTimeSlot[]>([]);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [mobileDay, setMobileDay] = useState(1);

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [attendanceContext, setAttendanceContext] =
    useState<AttendanceScheduleContext | null>(null);
  const [attendanceContextError, setAttendanceContextError] = useState<
    string | null
  >(null);
  const [attendanceContextLoading, setAttendanceContextLoading] =
    useState(false);
  const [startingEntryId, setStartingEntryId] = useState<number | null>(null);

  const cardVariant = useMemo(
    () => resolveMyScheduleCardVariant(getSessionUser()?.roles ?? []),
    [],
  );
  const canChoosePeriod = cardVariant !== 'student';
  const canViewAttendance = sessionHasPermission(ATTENDANCE_PERMISSIONS.view);
  const canCreateAttendance = sessionHasPermission(
    ATTENDANCE_PERMISSIONS.create,
  );
  const fetchAttendanceContext = shouldFetchAttendanceScheduleContext({
    variant: cardVariant,
    canViewAttendance,
  });

  const loadPeriods = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const list = filterPeriodsForSessionRole(await academicPeriodApi.list());
      setPeriods(list);
    } catch {
      setCatalogError('No se pudieron cargar los cursos lectivos.');
      setPeriods([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadSchedule = useCallback(async (nextPeriodId: string) => {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const data = await getMySchedule(
        canChoosePeriod && nextPeriodId
          ? { periodId: Number(nextPeriodId) }
          : {},
      );
      setTimeSlots(data.timeSlots ?? []);
      setEntries(data.entries ?? []);
      if (canChoosePeriod && !nextPeriodId) {
        const inferred = periodIdFromMyScheduleEntries(data.entries ?? []);
        if (inferred) {
          setPeriodId(inferred);
        }
      }
    } catch {
      setScheduleError(MY_SCHEDULE_COPY.errorMessage);
      setTimeSlots([]);
      setEntries([]);
    } finally {
      setScheduleLoading(false);
    }
  }, [canChoosePeriod]);

  const loadAttendanceContext = useCallback(
    async (nextPeriodId: string) => {
      if (!fetchAttendanceContext) {
        setAttendanceContext(null);
        setAttendanceContextError(null);
        return;
      }
      setAttendanceContextLoading(true);
      setAttendanceContextError(null);
      try {
        const data = await attendanceApi.getScheduleContext(
          nextPeriodId
            ? { periodId: Number(nextPeriodId) }
            : {},
        );
        setAttendanceContext(data);
      } catch {
        setAttendanceContext(null);
        setAttendanceContextError(
          'No se pudo cargar el estado de asistencia.',
        );
      } finally {
        setAttendanceContextLoading(false);
      }
    },
    [fetchAttendanceContext],
  );

  useEffect(() => {
    if (!canChoosePeriod) {
      setCatalogLoading(false);
      return;
    }
    void loadPeriods();
  }, [canChoosePeriod, loadPeriods]);

  useEffect(() => {
    if (!canChoosePeriod || periodId || catalogLoading || scheduleLoading) return;
    if (entries.length > 0) return;
    const next = preferredPeriodId(periods);
    if (next) setPeriodId(next);
  }, [
    canChoosePeriod,
    periodId,
    catalogLoading,
    scheduleLoading,
    entries.length,
    periods,
  ]);

  useEffect(() => {
    void loadSchedule(canChoosePeriod ? periodId : '');
  }, [canChoosePeriod, periodId, loadSchedule]);

  useEffect(() => {
    if (!canChoosePeriod || !periodId) return;
    void loadAttendanceContext(periodId);
  }, [canChoosePeriod, periodId, loadAttendanceContext]);

  const matrixSlots = useMemo(
    () => visibleSlotsForMatrix(timeSlots, entries),
    [timeSlots, entries],
  );

  const entriesByCell = useMemo(() => groupEntriesByCell(entries), [entries]);

  const occurrenceByEntryId = useMemo(
    () => indexOccurrencesByEntryId(attendanceContext),
    [attendanceContext],
  );

  const retry = useCallback(() => {
    if (canChoosePeriod && catalogError) void loadPeriods();
    if (scheduleError) void loadSchedule(canChoosePeriod ? periodId : '');
    if (canChoosePeriod && attendanceContextError && periodId) {
      void loadAttendanceContext(periodId);
    }
  }, [
    canChoosePeriod,
    catalogError,
    scheduleError,
    attendanceContextError,
    periodId,
    loadPeriods,
    loadSchedule,
    loadAttendanceContext,
  ]);

  const cycleLabel =
    entries[0]?.teachingAssignment?.academicPeriod?.name ?? null;

  return {
    periods,
    periodId,
    setPeriodId,
    canChoosePeriod,
    cycleLabel,
    timeSlots,
    entries,
    matrixSlots,
    entriesByCell,
    mobileDay,
    setMobileDay,
    catalogLoading,
    scheduleLoading,
    catalogError,
    scheduleError,
    retry,
    reloadSchedule: () => loadSchedule(canChoosePeriod ? periodId : ''),
    isEmptySuccess:
      !scheduleLoading && !scheduleError && entries.length === 0,
    cardVariant,
    canViewAttendance,
    canCreateAttendance,
    fetchAttendanceContext,
    attendanceContext,
    attendanceContextError,
    attendanceContextLoading,
    occurrenceByEntryId,
    startingEntryId,
    setStartingEntryId,
    reloadAttendanceContext: () => loadAttendanceContext(periodId),
  };
}

export type MySchedulePanelModel = ReturnType<typeof useMySchedulePanel>;
