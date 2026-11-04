import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Specialty, SpecialtyKind, SpecialtyStatus } from '@/entities/specialty';
import { specialtyApi } from '../api/specialtyApi';

export type SpecialtyStatusFilter = 'ALL' | SpecialtyStatus;

export function useSpecialties(kind: SpecialtyKind) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SpecialtyStatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      setSpecialties(await specialtyApi.list(kind));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los registros.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const removeSpecialty = useCallback((id: number) => {
    setSpecialties((current) => current.filter((specialty) => specialty.id !== id));
  }, []);

  const filteredSpecialties = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return specialties.filter(
      (specialty) =>
        (status === 'ALL' || specialty.status === status) &&
        (!query ||
          [specialty.name, specialty.description ?? ''].some((value) =>
            value.toLocaleLowerCase().includes(query),
          )),
    );
  }, [search, specialties, status]);

  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / pageSize));
  const paginatedSpecialties = useMemo(
    () => filteredSpecialties.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredSpecialties],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, kind]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return {
    specialties: paginatedSpecialties,
    allSpecialties: specialties,
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
    removeSpecialty,
  };
}
