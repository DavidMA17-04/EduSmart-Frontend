import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AttendanceAvailableOffering,
  AttendanceGroup,
  AttendanceHistoryItem,
  AttendanceHistorySummary,
  AttendanceRegistrationMethod,
  AttendanceStatus,
} from '@/entities/attendance';
import { STUDENT_ROLE_NAME } from '@/entities/role';
import { HttpError } from '@/shared/api';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { attendanceApi } from '../api/attendanceApi';
import { ATTENDANCE_PERMISSIONS } from './attendanceRouting';

export type HistoryStatusFilter = AttendanceStatus | '';
export type HistoryMethodFilter = AttendanceRegistrationMethod | '';
export type HistoryPageSize = 10 | 25 | 50;
export type HistoryExportFormat = 'pdf' | 'excel';

type HistoryOfferingOption = {
  teachingAssignmentId: number;
  name: string;
};

const DEFAULT_LIMIT: HistoryPageSize = 25;

const EMPTY_SUMMARY: AttendanceHistorySummary = {
  total: 0,
  present: 0,
  late: 0,
  absent: 0,
  justified: 0,
  attendancePercent: 0,
  band: 'Sin datos',
};

function rolesIncludeStudent(roles: readonly string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((role) => {
    const value = String(role).trim().toLowerCase();
    return (
      value === STUDENT_ROLE_NAME.toLowerCase() ||
      value === 'estudiante' ||
      value === 'student'
    );
  });
}

export function useAttendanceHistoryPanel() {
  const user = getSessionUser();
  const isStudentView = useMemo(() => {
    if (sessionHasPermission(ATTENDANCE_PERMISSIONS.view)) return false;
    if (sessionHasPermission(ATTENDANCE_PERMISSIONS.viewOwn)) return true;
    return rolesIncludeStudent(user?.roles);
  }, [user?.roles]);

  const [groups, setGroups] = useState<AttendanceGroup[]>([]);
  const [offerings, setOfferings] = useState<AttendanceAvailableOffering[]>([]);
  const [courseOptions, setCourseOptions] = useState<HistoryOfferingOption[]>(
    [],
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupId, setGroupId] = useState('');
  const [teachingAssignmentId, setTeachingAssignmentId] = useState('');
  const [status, setStatus] = useState<HistoryStatusFilter>('');
  const [registrationMethod, setRegistrationMethod] =
    useState<HistoryMethodFilter>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<HistoryPageSize>(DEFAULT_LIMIT);

  const [items, setItems] = useState<AttendanceHistoryItem[]>([]);
  const [summary, setSummary] =
    useState<AttendanceHistorySummary>(EMPTY_SUMMARY);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isStudentView) {
      setFiltersReady(true);
      return;
    }
    let active = true;
    attendanceApi
      .listAttendanceGroups()
      .then((rows) => {
        if (!active) return;
        setGroups(rows);
        setFiltersReady(true);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof HttpError
            ? err.message
            : 'No se pudieron cargar los filtros de asistencia.',
        );
        setFiltersReady(true);
      });
    return () => {
      active = false;
    };
  }, [isStudentView]);

  useEffect(() => {
    if (isStudentView) return;
    const gid = Number(groupId);
    if (!groupId || !Number.isInteger(gid) || gid <= 0) {
      setOfferings([]);
      setTeachingAssignmentId('');
      return;
    }
    let active = true;
    attendanceApi
      .getAvailableOfferings(gid)
      .then((rows) => {
        if (!active) return;
        setOfferings(rows);
        setTeachingAssignmentId((current) => {
          if (!current) return current;
          return rows.some((r) => String(r.teachingAssignmentId) === current)
            ? current
            : '';
        });
      })
      .catch(() => {
        if (!active) return;
        setOfferings([]);
      });
    return () => {
      active = false;
    };
  }, [groupId, isStudentView]);

  useEffect(() => {
    setPage(1);
  }, [
    startDate,
    endDate,
    groupId,
    teachingAssignmentId,
    status,
    registrationMethod,
    debouncedSearch,
    limit,
  ]);

  const activeFilters = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      groupId: !isStudentView && groupId ? Number(groupId) : undefined,
      teachingAssignmentId: teachingAssignmentId
        ? Number(teachingAssignmentId)
        : undefined,
      status: status || undefined,
      registrationMethod: registrationMethod || undefined,
      search:
        !isStudentView && debouncedSearch.trim()
          ? debouncedSearch.trim()
          : undefined,
    }),
    [
      startDate,
      endDate,
      groupId,
      teachingAssignmentId,
      status,
      registrationMethod,
      debouncedSearch,
      isStudentView,
    ],
  );

  const load = useCallback(async () => {
    if (!filtersReady) return;
    setIsLoading(true);
    try {
      const [pageResult, summaryResult] = await Promise.all([
        attendanceApi.searchAttendanceHistory({
          ...activeFilters,
          page,
          limit,
          sortBy: 'sessionDate',
          sortOrder: 'DESC',
        }),
        attendanceApi.getAttendanceHistorySummary(activeFilters),
      ]);
      setItems(pageResult.items);
      setTotal(pageResult.total);
      setTotalPages(pageResult.totalPages);
      setSummary(summaryResult);
      setError(null);
    } catch (err) {
      setItems([]);
      setTotal(0);
      setTotalPages(0);
      setSummary(EMPTY_SUMMARY);
      setError(
        err instanceof HttpError
          ? err.message
          : 'No se pudo cargar el historial de asistencia.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [filtersReady, activeFilters, page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setGroupId('');
    setTeachingAssignmentId('');
    setStatus('');
    setRegistrationMethod('');
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
    setLimit(DEFAULT_LIMIT);
  };

  const exportHistory = async (format: HistoryExportFormat) => {
    setIsExporting(true);
    try {
      await attendanceApi.exportAttendanceHistory(activeFilters, format);
      setError(null);
    } catch (err) {
      setError(
        err instanceof HttpError
          ? err.message
          : 'No se pudo exportar el historial de asistencia.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!isStudentView || teachingAssignmentId) return;
    const map = new Map<number, HistoryOfferingOption>();
    for (const row of items) {
      if (!map.has(row.teachingAssignmentId)) {
        map.set(row.teachingAssignmentId, {
          teachingAssignmentId: row.teachingAssignmentId,
          name: row.offering.name,
        });
      }
    }
    if (map.size > 0) {
      setCourseOptions(Array.from(map.values()));
    }
  }, [isStudentView, teachingAssignmentId, items]);

  const offeringOptions: HistoryOfferingOption[] = isStudentView
    ? courseOptions
    : offerings.map((o) => ({
        teachingAssignmentId: o.teachingAssignmentId,
        name: o.name,
      }));

  return {
    isStudentView,
    groups,
    offerings: offeringOptions,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    groupId,
    setGroupId,
    teachingAssignmentId,
    setTeachingAssignmentId,
    status,
    setStatus,
    registrationMethod,
    setRegistrationMethod,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    items,
    summary,
    total,
    totalPages: Math.max(totalPages, total > 0 ? 1 : 0),
    isLoading,
    isExporting,
    error,
    clearFilters,
    exportHistory,
    reload: load,
  };
}
