import type {
  CreateScheduleEntryPayload,
  CreateScheduleTimeSlotPayload,
  ScheduleEntry,
  ScheduleEntryListFilters,
  ScheduleTimeSlot,
  UpdateScheduleEntryPayload,
  UpdateScheduleTimeSlotPayload,
} from '@/entities/schedule';
import { httpClient } from '@/shared/api';

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

export const scheduleApi = {
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
