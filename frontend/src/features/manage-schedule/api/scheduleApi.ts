import type {
  CreateScheduleEntryPayload,
  CreateScheduleTimeSlotPayload,
  ScheduleEntry,
  ScheduleEntryListFilters,
  ScheduleTimeSlot,
  UpdateScheduleEntryPayload,
  UpdateScheduleTimeSlotPayload,
} from '@/entities/schedule';
import { useAuthStore } from '@/features/auth';
import { getAccessToken } from '@/shared/auth';
import { HttpError, httpClient } from '@/shared/api';
import type { ScheduleExportPayload } from '../model/scheduleExport';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await httpClient<ApiEnvelope<T>>(path, init)).data;
}

function toSearchParams(filters: ScheduleEntryListFilters): string {
  const params = new URLSearchParams();
  if (filters.teacherId != null) params.set('teacherId', String(filters.teacherId));
  if (filters.groupId != null) params.set('groupId', String(filters.groupId));
  if (filters.periodId != null) params.set('periodId', String(filters.periodId));
  if (filters.dayOfWeek != null) params.set('dayOfWeek', String(filters.dayOfWeek));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

/** Excel del horario con formato institucional (el servidor solo da formato a la cuadrícula visible). */
async function exportScheduleExcel(payload: ScheduleExportPayload): Promise<Blob> {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/schedule/export/excel`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revise su conexión a internet e intente de nuevo.');
  }
  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/login') window.location.assign('/login');
    throw new HttpError(401, 'No autorizado.');
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const raw = body?.message;
    const message = Array.isArray(raw) ? raw.filter(Boolean).join(' ') : raw;
    throw new HttpError(response.status, message ?? 'No se pudo exportar el horario.');
  }
  return response.blob();
}

export const scheduleApi = {
  exportExcel: exportScheduleExcel,

  listTimeSlots: () => request<ScheduleTimeSlot[]>('/schedule/time-slots'),

  getTimeSlot: (id: number) =>
    request<ScheduleTimeSlot>(`/schedule/time-slots/${id}`),

  createTimeSlot: (payload: CreateScheduleTimeSlotPayload) =>
    request<ScheduleTimeSlot>('/schedule/time-slots', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTimeSlot: (id: number, payload: UpdateScheduleTimeSlotPayload) =>
    request<ScheduleTimeSlot>(`/schedule/time-slots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteTimeSlot: (id: number) =>
    request<{ deleted: true } | ScheduleTimeSlot>(`/schedule/time-slots/${id}`, {
      method: 'DELETE',
    }),

  listEntries: (filters: ScheduleEntryListFilters = {}) =>
    request<ScheduleEntry[]>(`/schedule/entries${toSearchParams(filters)}`),

  createEntry: (payload: CreateScheduleEntryPayload) =>
    request<ScheduleEntry>('/schedule/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEntry: (id: number, payload: UpdateScheduleEntryPayload) =>
    request<ScheduleEntry>(`/schedule/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteEntry: (id: number) =>
    request<unknown>(`/schedule/entries/${id}`, {
      method: 'DELETE',
    }),
};

/** Named helpers matching the C1/C2 contract. */
export const listScheduleTimeSlots = () => scheduleApi.listTimeSlots();
export const getScheduleTimeSlot = (id: number) => scheduleApi.getTimeSlot(id);
export const createScheduleTimeSlot = (input: CreateScheduleTimeSlotPayload) =>
  scheduleApi.createTimeSlot(input);
export const updateScheduleTimeSlot = (
  id: number,
  input: UpdateScheduleTimeSlotPayload,
) => scheduleApi.updateTimeSlot(id, input);
export const deleteScheduleTimeSlot = (id: number) =>
  scheduleApi.deleteTimeSlot(id);
export const listScheduleEntries = (filters?: ScheduleEntryListFilters) =>
  scheduleApi.listEntries(filters);
export const createScheduleEntry = (input: CreateScheduleEntryPayload) =>
  scheduleApi.createEntry(input);
export const updateScheduleEntry = (
  id: number,
  input: UpdateScheduleEntryPayload,
) => scheduleApi.updateEntry(id, input);
export const deleteScheduleEntry = (id: number) => scheduleApi.deleteEntry(id);
