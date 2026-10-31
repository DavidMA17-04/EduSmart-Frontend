import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSessionUser } from '@/shared/auth';
import { housePrefix, resolveHouse } from '@/widgets/app-shell/model/territory';
import { departuresApi } from '../api/departuresApi';
import type {
  CreatePermitPayload,
  DepartureHistoryFilters,
  RegisterDeparturePayload,
  ScheduledPermitStatus,
  ValidateGuardianPayload,
} from './types';

export const departureKeys = {
  all: ['student-departures'] as const,
  kpis: ['student-departures', 'kpis'] as const,
  history: (filters: DepartureHistoryFilters) => ['student-departures', 'history', filters] as const,
  historyRoot: ['student-departures', 'history'] as const,
  permitsToday: ['student-departures', 'permits', 'today'] as const,
  permits: (filter: object) => ['student-departures', 'permits', 'list', filter] as const,
  permitsRoot: ['student-departures', 'permits'] as const,
};

/** Indicadores de la jornada, con refresco automático cada 30 s. */
export function useSecurityKPIs() {
  return useQuery({
    queryKey: departureKeys.kpis,
    queryFn: departuresApi.todayKpis,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

/** Validación inmediata de identidad del encargado presente. */
export function useValidateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ValidateGuardianPayload) => departuresApi.validateGuardian(payload),
    // Un intento denegado queda registrado: refresca indicadores y bitácora.
    onSuccess: (result) => {
      if (!result.authorized) {
        void queryClient.invalidateQueries({ queryKey: departureKeys.all });
      }
    },
  });
}

export function useRegisterDeparture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterDeparturePayload) => departuresApi.register(payload),
    onSettled: () => queryClient.invalidateQueries({ queryKey: departureKeys.all }),
  });
}

/** Bitácora paginada con caché por combinación de filtros. */
export function useSecurityDeparturesHistory(filters: DepartureHistoryFilters, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: departureKeys.history(filters),
    queryFn: () => departuresApi.history(filters),
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
  });
}

/** Permisos programados pendientes para hoy. */
export function useScheduledPermitsToday() {
  return useQuery({
    queryKey: departureKeys.permitsToday,
    queryFn: departuresApi.permitsToday,
    refetchInterval: 60_000,
  });
}

export function useScheduledPermits(filter: { date?: string; status?: ScheduledPermitStatus }) {
  return useQuery({
    queryKey: departureKeys.permits(filter),
    queryFn: () => departuresApi.permits(filter),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePermit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermitPayload) => departuresApi.createPermit(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: departureKeys.all }),
  });
}

export function useCompletePermit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departuresApi.completePermit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: departureKeys.all }),
  });
}

export function useExportDepartures() {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'excel' | 'pdf'; filters: DepartureHistoryFilters }) =>
      format === 'excel' ? departuresApi.exportExcel(filters) : departuresApi.exportPdf(filters),
  });
}

/**
 * Raíz de las pantallas de seguridad según la casa: `/security` para el guarda,
 * `/admin/security` o `/director/security` para el personal.
 */
export function securityBasePath(roles?: readonly string[]): string {
  const house = resolveHouse(roles ?? getSessionUser()?.roles);
  if (!house || house === 'security') return '/security';
  return `${housePrefix(house)}/security`;
}
