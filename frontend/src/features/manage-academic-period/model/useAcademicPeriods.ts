import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AcademicPeriod, AcademicPeriodStatus } from '@/entities/academic-period';
import { academicPeriodApi } from '../api/academicPeriodApi';

export type AcademicPeriodStatusFilter = 'ALL' | AcademicPeriodStatus;

export function useAcademicPeriods() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AcademicPeriodStatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      setPeriods(await academicPeriodApi.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los períodos académicos.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const upsertPeriod = useCallback((period: AcademicPeriod) => {
    setPeriods((current) => {
      const index = current.findIndex((item) => item.id === period.id);
      if (index === -1) return [...current, period];
      const next = [...current];
      next[index] = period;
      return next;
    });
  }, []);

  const filteredPeriods = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return periods.filter((period) => (status === 'ALL' || period.status === status)
      && (!query || period.name.toLocaleLowerCase().includes(query)));
  }, [periods, search, status]);

  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filteredPeriods.length / pageSize));
  const paginatedPeriods = useMemo(
    () => filteredPeriods.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredPeriods],
  );

  useEffect(() => { setCurrentPage(1); }, [search, status]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  return {
    periods: paginatedPeriods,
    allPeriods: periods,
    search,
    setSearch,
    status,
    setStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    isLoading,
    error,
    reload: load,
    upsertPeriod,
  };
}
