import { useCallback, useEffect, useState } from 'react';
import type {
  AttendanceAvailableOffering,
  AttendanceGroup,
  AttendanceHistoryItem,
  AttendanceRegistrationMethod,
  AttendanceStatus,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import { attendanceApi } from '../api/attendanceApi';

export type HistoryStatusFilter = AttendanceStatus | '';
export type HistoryMethodFilter = AttendanceRegistrationMethod | '';
export type HistoryPageSize = 10 | 25 | 50;

const DEFAULT_LIMIT: HistoryPageSize = 25;

export function useAttendanceHistoryPanel() {
  const [groups, setGroups] = useState<AttendanceGroup[]>([]);
  const [offerings, setOfferings] = useState<AttendanceAvailableOffering[]>([]);

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
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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
  }, [groupId]);

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

  const load = useCallback(async () => {
    if (!filtersReady) return;
    setIsLoading(true);
    try {
      const pageResult = await attendanceApi.searchAttendanceHistory({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        groupId: groupId ? Number(groupId) : undefined,
        teachingAssignmentId: teachingAssignmentId
          ? Number(teachingAssignmentId)
          : undefined,
        status: status || undefined,
        registrationMethod: registrationMethod || undefined,
        search: debouncedSearch.trim() || undefined,
        page,
        limit,
        sortBy: 'sessionDate',
        sortOrder: 'DESC',
      });
      setItems(pageResult.items);
      setTotal(pageResult.total);
      setTotalPages(pageResult.totalPages);
      setError(null);
    } catch (err) {
      setItems([]);
      setTotal(0);
      setTotalPages(0);
      setError(
        err instanceof HttpError
          ? err.message
          : 'No se pudo cargar el historial de asistencia.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    filtersReady,
    startDate,
    endDate,
    groupId,
    teachingAssignmentId,
    status,
    registrationMethod,
    debouncedSearch,
    page,
    limit,
  ]);

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

  return {
    groups,
    offerings,
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
    total,
    totalPages: Math.max(totalPages, total > 0 ? 1 : 0),
    isLoading,
    error,
    clearFilters,
    reload: load,
  };
}
