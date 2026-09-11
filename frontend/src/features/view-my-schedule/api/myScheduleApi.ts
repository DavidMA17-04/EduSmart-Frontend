import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

export type MyScheduleQuery = {
  periodId?: number;
  dayOfWeek?: number;
};

export type MyScheduleResponse = {
  timeSlots: ScheduleTimeSlot[];
  entries: ScheduleEntry[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await httpClient<ApiEnvelope<T>>(path, init)).data;
}

function toMyScheduleSearchParams(filters: MyScheduleQuery = {}): string {
  const params = new URLSearchParams();
  if (filters.periodId != null) params.set('periodId', String(filters.periodId));
  if (filters.dayOfWeek != null) params.set('dayOfWeek', String(filters.dayOfWeek));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Actor-scoped teacher schedule — never sends teacherId/groupId/userId. */
export async function getMySchedule(
  filters: MyScheduleQuery = {},
): Promise<MyScheduleResponse> {
  return request<MyScheduleResponse>(
    `/schedule/my-schedule${toMyScheduleSearchParams(filters)}`,
  );
}

export const myScheduleApi = {
  getMySchedule,
  toMyScheduleSearchParams,
};
