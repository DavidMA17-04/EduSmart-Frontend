import type {
  AttendanceAvailableOffering,
  AttendanceGroup,
  AttendanceRecordMutationResult,
  AttendanceRosterStudent,
  AttendanceScheduleContext,
  AttendanceSessionDetail,
  AttendanceSessionMutationResult,
  CreateAttendanceSessionFromScheduleInput,
  CreateAttendanceSessionInput,
  SaveAttendanceRecordsInput,
} from '@/entities/attendance';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

const request = async <T>(path: string, init?: RequestInit): Promise<T> =>
  (await httpClient<ApiEnvelope<T>>(path, init)).data;

export const attendanceApi = {
  listAttendanceGroups: () => request<AttendanceGroup[]>('/attendance/groups'),

  getAvailableOfferings: (groupId: number) =>
    request<AttendanceAvailableOffering[]>(
      `/attendance/groups/${groupId}/available-offerings`,
    ),

  getScheduleContext: (filters: { periodId?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.periodId != null) {
      params.set('periodId', String(filters.periodId));
    }
    const qs = params.toString();
    return request<AttendanceScheduleContext>(
      `/attendance/schedule-context${qs ? `?${qs}` : ''}`,
    );
  },

  createAttendanceSession: (input: CreateAttendanceSessionInput) =>
    request<AttendanceSessionMutationResult>('/attendance/sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  createAttendanceSessionFromSchedule: (
    input: CreateAttendanceSessionFromScheduleInput,
  ) =>
    request<AttendanceSessionMutationResult>(
      '/attendance/sessions/from-schedule',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    ),

  getAttendanceSession: (sessionId: number) =>
    request<AttendanceSessionDetail>(`/attendance/sessions/${sessionId}`),

  getAttendanceRoster: (sessionId: number) =>
    request<AttendanceRosterStudent[]>(
      `/attendance/sessions/${sessionId}/roster`,
    ),

  saveAttendanceRecords: (
    sessionId: number,
    input: SaveAttendanceRecordsInput,
  ) =>
    request<AttendanceRecordMutationResult[]>(
      `/attendance/sessions/${sessionId}/records`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      },
    ),

  closeAttendanceSession: (sessionId: number) =>
    request<AttendanceSessionMutationResult>(
      `/attendance/sessions/${sessionId}/close`,
      { method: 'POST' },
    ),
};
