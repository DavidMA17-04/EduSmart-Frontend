import { useAuthStore } from '@/features/auth';
import { getAccessToken } from '@/shared/auth';
import { HttpError, httpClient } from '@/shared/api/httpClient';
import type {
  CreatePermitPayload,
  DepartureHistoryFilters,
  GuardianValidationResult,
  PaginatedDepartures,
  RegisterDeparturePayload,
  RegisterDepartureResult,
  ScheduledPermit,
  ScheduledPermitStatus,
  TodayKpis,
  ValidateGuardianPayload,
} from '../model/types';

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

/** El backend envuelve toda respuesta JSON en `{ success, message, data }`. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const payload = await httpClient<ApiEnvelope<T>>(path, init);
  return payload.data;
}

function query(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

/** Descarga autenticada de un archivo (Excel / PDF). */
async function download(path: string, fallbackName: string): Promise<void> {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { headers });
  } catch {
    throw new Error(`No se pudo conectar con la API en ${apiBaseUrl}. Verifique que el backend esté activo.`);
  }
  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/login') window.location.assign('/login');
    throw new HttpError(401, 'No autorizado.');
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const raw = payload?.message;
    const message = Array.isArray(raw) ? raw.filter(Boolean).join(' ') : raw;
    throw new HttpError(response.status, message ?? 'No se pudo descargar el reporte.');
  }

  const disposition = response.headers.get('Content-Disposition') ?? '';
  const fileName = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? fallbackName;
  const url = URL.createObjectURL(await response.blob());
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const departuresApi = {
  validateGuardian: (payload: ValidateGuardianPayload) =>
    request<GuardianValidationResult>('/student-departures/validate-guardian', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterDeparturePayload) =>
    request<RegisterDepartureResult>('/student-departures', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  todayKpis: () => request<TodayKpis>('/student-departures/today-kpis'),

  history: (filters: DepartureHistoryFilters) =>
    request<PaginatedDepartures>(`/student-departures/history${query(filters)}`),

  exportExcel: (filters: DepartureHistoryFilters) => {
    const { page: _page, limit: _limit, ...rest } = filters;
    return download(`/student-departures/export/excel${query(rest)}`, 'bitacora-salidas.xlsx');
  },

  exportPdf: (filters: DepartureHistoryFilters) => {
    const { page: _page, limit: _limit, ...rest } = filters;
    return download(`/student-departures/export/pdf${query(rest)}`, 'bitacora-salidas.pdf');
  },

  permitsToday: () => request<ScheduledPermit[]>('/scheduled-permits/today'),

  permits: (filter: { date?: string; status?: ScheduledPermitStatus }) =>
    request<ScheduledPermit[]>(`/scheduled-permits${query(filter)}`),

  createPermit: (payload: CreatePermitPayload) =>
    request<ScheduledPermit>('/scheduled-permits', { method: 'POST', body: JSON.stringify(payload) }),

  completePermit: (id: string) =>
    request<ScheduledPermit>(`/scheduled-permits/${id}/complete`, { method: 'PATCH' }),
};

export const departureGroupsApi = {
  list: () => request<Array<{ id: number; name: string; sectionName: string | null }>>('/student-departures/groups'),
};
