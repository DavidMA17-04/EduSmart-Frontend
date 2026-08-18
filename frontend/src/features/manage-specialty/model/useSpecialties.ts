import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Specialty, SpecialtyStatus } from '@/entities/specialty';
import { specialtyApi } from '../api/specialtyApi';

export type SpecialtyStatusFilter = 'ALL' | SpecialtyStatus;

export function useSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SpecialtyStatusFilter>('ALL');
  const [area, setArea] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try { setSpecialties(await specialtyApi.list()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las especialidades.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const areas = useMemo(() => [...new Set(specialties.map((specialty) => specialty.area))].sort(), [specialties]);
  const filteredSpecialties = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return specialties.filter((specialty) => (status === 'ALL' || specialty.status === status)
      && (area === 'ALL' || specialty.area === area)
      && (!query || [specialty.code, specialty.name, specialty.area].some((value) => value.toLocaleLowerCase().includes(query))));
  }, [area, search, specialties, status]);
  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / pageSize));
  const paginatedSpecialties = useMemo(
    () => filteredSpecialties.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredSpecialties],
  );

  useEffect(() => { setCurrentPage(1); }, [area, search, status]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  return { specialties: paginatedSpecialties, allSpecialties: specialties, areas, search, setSearch, status, setStatus, area, setArea, currentPage, setCurrentPage, totalPages, isLoading, error, reload: load };
}