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
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { getMySchedule } from '../api/myScheduleApi';
import {
  indexOccurrencesByEntryId,
  shouldFetchAttendanceScheduleContext,
} from './myScheduleAttendance';
import { resolveMyScheduleCardVariant } from './mySchedulePresentation';

function pickDefaultPeriodId(periods: AcademicPeriod[]): string {
  const active = periods.find((p) => p.status === 'ACTIVE');
  if (active) return String(active.id);
  return periods[0] ? String(periods[0].id) : '';
}

export const MY_SCHEDULE_COPY = {
  title: 'Mi horario',
  subtitle: 'Consulta tus clases asignadas durante la semana.',
  emptyTitle: 'Sin clases asignadas',
  emptyDescription: 'No tienes clases asignadas para este período.',
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
      const list = await academicPeriodApi.list();
      setPeriods(list);
      setPeriodId((prev) => prev || pickDefaultPeriodId(list));
    } catch {
      setCatalogError('No se pudieron cargar los períodos académicos.');
      setPeriods([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadSchedule = useCallback(async (nextPeriodId: string) => {
    if (!nextPeriodId) {
      setTimeSlots([]);
      setEntries([]);
      setScheduleError(null);
      return;
    }
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const data = await getMySchedule({ periodId: Number(nextPeriodId) });
      setTimeSlots(data.timeSlots ?? []);
      setEntries(data.entries ?? []);
    } catch {
      setScheduleError(MY_SCHEDULE_COPY.errorMessage);
      setTimeSlots([]);
      setEntries([]);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

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
    void loadPeriods();
  }, [loadPeriods]);

  useEffect(() => {
    if (!periodId) return;
    void loadSchedule(periodId);
  }, [periodId, loadSchedule]);

  useEffect(() => {
    if (!periodId) return;
    void loadAttendanceContext(periodId);
  }, [periodId, loadAttendanceContext]);

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
    if (catalogError) void loadPeriods();
    if (scheduleError && periodId) void loadSchedule(periodId);
    if (attendanceContextError && periodId) {
      void loadAttendanceContext(periodId);
    }
  }, [
    catalogError,
    scheduleError,
    attendanceContextError,
    periodId,
    loadPeriods,
    loadSchedule,
    loadAttendanceContext,
  ]);

  return {
    periods,
    periodId,
    setPeriodId,
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
    reloadSchedule: () => loadSchedule(periodId),
    isEmptySuccess:
      !scheduleLoading && !scheduleError && !catalogError && entries.length === 0,
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
