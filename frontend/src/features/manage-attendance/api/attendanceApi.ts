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
  CreateJustificationInput,
  JustifiableAbsenceOption,
  JustifiableAbsencesFilters,
  JustificationEvidenceItem,
  JustificationListFilters,
  JustificationListItem,
  JustificationListPageResult,
  ReviewJustificationInput,
  SaveAttendanceRecordsInput,
} from '@/entities/attendance';
import { httpClient } from '@/shared/api';
import {
  justifiableAbsencesMock,
  justificationsMock,
} from '../mocks/justificationsMock';

type ApiEnvelope<T> = { success: boolean; data: T };

const request = async <T>(path: string, init?: RequestInit): Promise<T> =>
  (await httpClient<ApiEnvelope<T>>(path, init)).data;

/**
 * Explicit demo mode (PBI-27 cierre): mocks are ONLY used when
 * VITE_DEMO_JUSTIFICATIONS=true. In real mode API errors propagate
 * to the UI — never a silent fallback to local data.
 */
const isDemoMode = import.meta.env.VITE_DEMO_JUSTIFICATIONS === 'true';

let mockStore: JustificationListItem[] = [...justificationsMock];

function applyListFilters(
  rows: JustificationListItem[],
  filters: JustificationListFilters,
): JustificationListItem[] {
  return rows.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (filters.studentUserId && row.student.userId !== filters.studentUserId) {
      return false;
    }
    if (filters.groupId && row.group.id !== filters.groupId) return false;
    if (filters.dateFrom && row.sessionDate < filters.dateFrom) return false;
    if (filters.dateTo && row.sessionDate > filters.dateTo) return false;
    if (filters.q?.trim()) {
      const q = filters.q.trim().toLowerCase();
      const hay = `${row.student.fullName} ${row.group.name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

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

  listJustifications: async (
    filters: JustificationListFilters = {},
  ): Promise<JustificationListPageResult> => {
    if (isDemoMode) {
      const filtered = applyListFilters(mockStore, filters);
      const pageSize = filters.pageSize ?? filtered.length;
      const page = filters.page ?? 1;
      return {
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        total: filtered.length,
      };
    }
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.studentUserId != null) {
      params.set('studentUserId', String(filters.studentUserId));
    }
    if (filters.groupId != null) params.set('groupId', String(filters.groupId));
    if (filters.q) params.set('q', filters.q);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.page != null) params.set('page', String(filters.page));
    if (filters.pageSize != null) params.set('pageSize', String(filters.pageSize));
    const qs = params.toString();
    const page = await request<{
      data: JustificationListItem[];
      total: number;
      page: number;
      pageSize: number;
    }>(`/attendance/justifications${qs ? `?${qs}` : ''}`);
    return { items: page.data, total: page.total };
  },

  listJustifiableAbsences: async (
    filters: JustifiableAbsencesFilters = {},
  ): Promise<JustifiableAbsenceOption[]> => {
    if (isDemoMode) {
      return [...justifiableAbsencesMock];
    }
    const params = new URLSearchParams();
    if (filters.studentUserId != null) {
      params.set('studentUserId', String(filters.studentUserId));
    }
    const qs = params.toString();
    return request<JustifiableAbsenceOption[]>(
      `/attendance/justifications/justifiable-absences${qs ? `?${qs}` : ''}`,
    );
  },

  createJustification: async (input: CreateJustificationInput) => {
    if (isDemoMode) {
      const created: JustificationListItem = {
        id: Math.max(0, ...mockStore.map((r) => r.id)) + 1,
        status: 'PENDING',
        reason: input.reason,
        decisionNotes: null,
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedByUserId: null,
        attendanceId: input.attendanceId,
        sessionDate: new Date().toISOString().slice(0, 10),
        student: {
          userId: 0,
          fullName: 'Estudiante (mock)',
          nationalId: '',
        },
        group: { id: 0, name: '—' },
        offering: { name: '—', kind: null },
        evidences: [],
      };
      mockStore = [created, ...mockStore];
      return created;
    }
    return request<JustificationListItem>('/attendance/justifications', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  uploadJustificationEvidence: async (justificationId: number, file: File) => {
    if (isDemoMode) {
      const item: JustificationEvidenceItem = {
        id: Date.now(),
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
        url: URL.createObjectURL(file),
        uploadedByUserId: 0,
        createdAt: new Date().toISOString(),
      };
      mockStore = mockStore.map((row) =>
        row.id === justificationId
          ? { ...row, evidences: [...row.evidences, item] }
          : row,
      );
      return item;
    }
    const formData = new FormData();
    formData.append('file', file);
    return request<JustificationEvidenceItem>(
      `/attendance/justifications/${justificationId}/evidence`,
      { method: 'POST', body: formData },
    );
  },

  reviewJustification: async (
    justificationId: number,
    input: ReviewJustificationInput,
  ) => {
    if (isDemoMode) {
      mockStore = mockStore.map((row) =>
        row.id === justificationId
          ? {
              ...row,
              status: input.status,
              decisionNotes: input.decisionNotes ?? null,
              reviewedAt: new Date().toISOString(),
              reviewedByUserId: 1,
            }
          : row,
      );
      return mockStore.find((r) => r.id === justificationId)!;
    }
    return request<JustificationListItem>(
      `/attendance/justifications/${justificationId}/review`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );
  },

  isJustificationsMockMode: () => isDemoMode,
};
