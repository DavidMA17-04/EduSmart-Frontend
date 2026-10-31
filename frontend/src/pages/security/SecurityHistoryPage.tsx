import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, History, RotateCcw, Search } from 'lucide-react';
import { sessionHasPermission } from '@/shared/auth';
import {
  BTN_SECONDARY,
  CARD,
  DEPARTURE_PERMISSIONS,
  DeparturesTable,
  ExportButtons,
  INPUT,
  LABEL,
  useSecurityDeparturesHistory,
  type DepartureHistoryFilters,
  type DepartureStatus,
  type DepartureType,
} from '@/features/student-departures';
import { departureGroupsApi } from '@/features/student-departures/api/departuresApi';
import { costaRicaToday } from '@/features/student-departures/model/format';
import '@/features/student-departures/ui/security.css';
import { SecurityPageHeader } from './SecurityPageHeader';

const PAGE_SIZE = 20;

function daysAgo(base: string, days: number): string {
  const date = new Date(`${base}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

interface FormState {
  startDate: string;
  endDate: string;
  groupId: string;
  status: '' | DepartureStatus;
  departureType: '' | DepartureType;
  search: string;
}

function initialForm(): FormState {
  const today = costaRicaToday();
  return { startDate: daysAgo(today, 6), endDate: today, groupId: '', status: '', departureType: '', search: '' };
}

/** /security/history — bitácora histórica con filtros, paginación y exportación. */
export function SecurityHistoryPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const canExport = sessionHasPermission(DEPARTURE_PERMISSIONS.export);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(form.search.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [form.search]);

  const groups = useQuery({ queryKey: ['student-departures', 'groups'], queryFn: departureGroupsApi.list, staleTime: 5 * 60_000 });

  const filters = useMemo<DepartureHistoryFilters>(() => {
    const value: DepartureHistoryFilters = {};
    if (form.startDate) value.startDate = form.startDate;
    if (form.endDate) value.endDate = form.endDate;
    if (form.groupId) value.groupId = Number(form.groupId);
    if (form.status) value.status = form.status;
    if (form.departureType) value.departureType = form.departureType;
    if (debouncedSearch) value.search = debouncedSearch;
    return value;
  }, [form.startDate, form.endDate, form.groupId, form.status, form.departureType, debouncedSearch]);

  useEffect(() => setPage(1), [filters]);

  const rangeInvalid = Boolean(form.startDate && form.endDate && form.startDate > form.endDate);
  const { data, isLoading, isFetching, isError } = useSecurityDeparturesHistory(
    rangeInvalid ? { ...filters, endDate: filters.startDate } : { ...filters, page, limit: PAGE_SIZE },
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const totalPages = data?.totalPages ?? 1;
  const from = data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const to = data ? Math.min(data.page * data.limit, data.total) : 0;

  return (
    <div className="edu-security bg-slate-50 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <SecurityPageHeader
          icon={History}
          title="Bitácora de salidas"
          subtitle="Consulta histórica de salidas autorizadas e intentos denegados."
        />

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-5`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label htmlFor="h-start" className={LABEL}>Desde</label>
              <input id="h-start" type="date" value={form.startDate} max={form.endDate || undefined} onChange={(e) => update('startDate', e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="h-end" className={LABEL}>Hasta</label>
              <input id="h-end" type="date" value={form.endDate} min={form.startDate || undefined} onChange={(e) => update('endDate', e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="h-group" className={LABEL}>Sección</label>
              <select id="h-group" value={form.groupId} onChange={(e) => update('groupId', e.target.value)} className={INPUT}>
                <option value="">Todas</option>
                {(groups.data ?? []).map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="h-status" className={LABEL}>Estado</label>
              <select id="h-status" value={form.status} onChange={(e) => update('status', e.target.value as FormState['status'])} className={INPUT}>
                <option value="">Todos</option>
                <option value="AUTHORIZED">Autorizada</option>
                <option value="REJECTED">Denegada</option>
              </select>
            </div>
            <div>
              <label htmlFor="h-type" className={LABEL}>Tipo</label>
              <select id="h-type" value={form.departureType} onChange={(e) => update('departureType', e.target.value as FormState['departureType'])} className={INPUT}>
                <option value="">Todos</option>
                <option value="REGULAR">Regular</option>
                <option value="EARLY">Anticipada</option>
                <option value="EMERGENCY">Emergencia</option>
              </select>
            </div>
            <div>
              <label htmlFor="h-search" className={LABEL}>Buscar</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input id="h-search" value={form.search} onChange={(e) => update('search', e.target.value)} className={`${INPUT} pl-9`} placeholder="Nombre o cédula" />
              </div>
            </div>
          </div>
          {rangeInvalid && (
            <p className="mt-3 text-sm text-rose-700" role="alert">La fecha inicial no puede ser posterior a la final.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {canExport && !rangeInvalid && <ExportButtons filters={filters} />}
            <button type="button" onClick={() => setForm(initialForm())} className={BTN_SECONDARY}>
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </button>
          </div>
        </motion.section>

        <section className={CARD}>
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 data-preserve-case className="text-sm font-bold text-slate-900">Registros</h2>
            <span className="text-xs text-slate-500 tabular">
              {data ? (data.total === 0 ? 'Sin resultados' : `${from}–${to} de ${data.total}`) : ' '}
            </span>
          </div>
          {isError ? (
            <p className="px-5 py-10 text-center text-sm text-rose-700">No se pudo cargar la bitácora. Intente de nuevo.</p>
          ) : (
            <div className={`transition-opacity ${isFetching && !isLoading ? 'opacity-70' : ''}`}>
              <DeparturesTable items={rangeInvalid ? [] : data?.items ?? []} loading={isLoading} showDate emptyText="No hay salidas registradas con estos filtros." />
            </div>
          )}
          {data && totalPages > 1 && !rangeInvalid && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`${BTN_SECONDARY} !py-1.5`}>
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <span className="text-xs text-slate-500 tabular">Página {data.page} de {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`${BTN_SECONDARY} !py-1.5`}>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
