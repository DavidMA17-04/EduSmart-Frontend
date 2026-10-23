import { useAuthStore } from '@/features/auth';
import { HttpError, httpClient } from '@/shared/api';
import { getAccessToken } from '@/shared/auth';
import {
  caseListQuery,
  casesExportPath,
  dashboardQuery,
  historyQuery,
  type DisciplinaryDashboard,
  type DisciplinaryDashboardFilters,
} from '../model/queries';
import type {
  CreatedDisciplinaryCase,
  DisciplinaryCaseDetail,
  DisciplinaryCaseFilters,
  DisciplinaryCasePage,
  DisciplinarySettings,
  DisciplinaryStudentHit,
  StudentConductHistory,
  NonWorkingDay,
  ReadConfirmation,
  GuardianInbox,
  InfractionSeverityRule,
  InfractionType,
  InfractionTypeFilters,
  InfractionTypeInput,
} from '../model/types';

type ApiEnvelope<T> = { success: boolean; data: T };

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

const request = async <T>(path: string, init?: RequestInit): Promise<T> =>
  (await httpClient<ApiEnvelope<T>>(path, init)).data;

async function downloadDisciplineFile(path: string, fileName: string): Promise<void> {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { headers });
  } catch {
    throw new Error(
      `No se pudo conectar con la API en ${apiBaseUrl}. Verifique que el backend esté activo.`,
    );
  }

  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
    throw new HttpError(response.status, 'No autorizado.');
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const raw = payload?.message;
    const message = Array.isArray(raw) ? raw.filter(Boolean).join(' ') : raw;
    throw new HttpError(response.status, message ?? 'No se pudo descargar el reporte.');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function infractionTypesQuery(filters: InfractionTypeFilters): string {
  const params = new URLSearchParams();
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.active !== undefined) params.set('active', String(filters.active));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export class DisciplineApiError extends Error {
  constructor(
    message: string,
    readonly field?: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'DisciplineApiError';
  }
}

async function disciplineWrite<T>(path: string, init: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=UTF-8');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { field?: string; code?: string } | null;
  } | null;
  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/login') window.location.assign('/login');
    throw new DisciplineApiError('No autorizado.');
  }
  if (!response.ok) {
    const data = payload?.data;
    const field = data && typeof data === 'object' ? data.field : undefined;
    const code = data && typeof data === 'object' ? data.code : undefined;
    throw new DisciplineApiError(payload?.message ?? 'No se pudo completar la solicitud.', field, code);
  }
  return (payload as { data: T }).data;
}

export const disciplineApi = {
  listSeverityRules: () =>
    request<InfractionSeverityRule[]>('/disciplinary/severity-rules'),

  listInfractionTypes: (filters: InfractionTypeFilters = {}) =>
    request<InfractionType[]>(`/disciplinary/infraction-types${infractionTypesQuery(filters)}`),

  exportInfractionTypes: (format: 'pdf' | 'excel', filters: InfractionTypeFilters = {}) =>
    downloadDisciplineFile(
      `/disciplinary/infraction-types/export/${format}${infractionTypesQuery(filters)}`,
      format === 'pdf' ? 'catalogo-faltas.pdf' : 'catalogo-faltas.xlsx',
    ),

  createInfractionType: (input: InfractionTypeInput) =>
    request<InfractionType>('/disciplinary/infraction-types', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateInfractionType: (id: number, input: Partial<InfractionTypeInput> & { isActive?: boolean }) =>
    request<InfractionType>(`/disciplinary/infraction-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deactivateInfractionType: (id: number) =>
    request<InfractionType>(`/disciplinary/infraction-types/${id}`, {
      method: 'DELETE',
    }),

  listInfractionOptions: () =>
    request<InfractionType[]>('/disciplinary/infraction-types/options'),

  listSubjects: () =>
    request<Array<{ id: number; name: string; status: string }>>('/subjects'),

  listNonWorkingDays: () => request<NonWorkingDay[]>('/disciplinary/non-working-days'),

  createNonWorkingDay: (input: { day: string; reason: string }) =>
    disciplineWrite<NonWorkingDay>('/disciplinary/non-working-days', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  deleteNonWorkingDay: (id: number) =>
    disciplineWrite<{ id: number; day: string }>(`/disciplinary/non-working-days/${id}`, { method: 'DELETE' }),

  getDisciplinarySettings: () => request<DisciplinarySettings>('/disciplinary/settings'),

  updateDisciplinarySettings: (input: DisciplinarySettings) =>
    disciplineWrite<DisciplinarySettings>('/disciplinary/settings', {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  listCases: (filters: DisciplinaryCaseFilters = {}) =>
    request<DisciplinaryCasePage>(`/disciplinary/cases${caseListQuery(filters)}`),

  getCase: (id: number) => request<DisciplinaryCaseDetail>(`/disciplinary/cases/${id}`),

  getDashboard: (filters: DisciplinaryDashboardFilters = {}) =>
    request<DisciplinaryDashboard>(`/disciplinary/dashboard${dashboardQuery(filters)}`),

  exportCases: (format: 'excel' | 'pdf', filters: Pick<DisciplinaryDashboardFilters, 'academicPeriodId' | 'groupId'> = {}) =>
    downloadDisciplineFile(casesExportPath(format, filters), format === 'pdf' ? 'expedientes.pdf' : 'expedientes.xlsx'),

  exportStudentHistory: (
    studentId: number,
    format: 'excel' | 'pdf',
    filters: Parameters<typeof historyQuery>[0] = {},
  ) =>
    downloadDisciplineFile(
      `/disciplinary/students/${studentId}/history/export/${format}${historyQuery(filters)}`,
      format === 'pdf' ? `historial-${studentId}.pdf` : `historial-${studentId}.xlsx`,
    ),

  exportCasePdf: (caseId: number, fileName = `expediente-${caseId}.pdf`) =>
    downloadDisciplineFile(`/disciplinary/cases/${caseId}/export/pdf`, fileName),

  getStudentHistory: (
    studentId: number,
    filters: { academicPeriodId?: number; status?: DisciplinaryCaseFilters['status']; severity?: DisciplinaryCaseFilters['severity'] } = {},
  ) =>
    request<StudentConductHistory>(`/disciplinary/students/${studentId}/history${historyQuery(filters)}`),

  downloadCaseEvidence: (caseId: number, evidenceId: number, fileName: string) =>
    downloadDisciplineFile(`/disciplinary/cases/${caseId}/evidences/${evidenceId}/file`, fileName),

  postCaseAction: <T>(path: string, body?: unknown) =>
    disciplineWrite<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),

  searchStudents: (q: string) =>
    request<DisciplinaryStudentHit[]>(`/disciplinary/students?q=${encodeURIComponent(q)}`),

  listMyNotifications: () => request<GuardianInbox>('/disciplinary/notifications/mine'),

  confirmNotificationRead: (id: number) =>
    disciplineWrite<ReadConfirmation>(`/disciplinary/notifications/${id}/read`, { method: 'POST' }),

  fileDefense: (caseId: number, body: string, files: File[] = []) => {
    if (files.length === 0) {
      return disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/defenses`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
    }
    const form = new FormData();
    form.append('body', body);
    for (const file of files.slice(0, 3)) form.append('files', file);
    return disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/defenses`, {
      method: 'POST',
      body: form,
    });
  },

  fileRevocation: (caseId: number, body: string, subsidiary: boolean) =>
    disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/revocations`, {
      method: 'POST',
      body: JSON.stringify({ body, subsidiary }),
    }),

  fileAppeal: (caseId: number, body: string) =>
    disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/appeals`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  sendFormalCommunication: (caseId: number, proposedAction: string) =>
    disciplineWrite<{ communicationId: number }>(`/disciplinary/cases/${caseId}/formal-communication`, {
      method: 'POST',
      body: JSON.stringify({ proposedAction }),
    }),

  deliverFormalCharge: (
    caseId: number,
    input: { proposedAction: string; medium: string; deliveredOn: string; receivedByName: string },
    file?: File,
  ) => {
    const form = new FormData();
    form.append('proposedAction', input.proposedAction);
    form.append('medium', input.medium);
    form.append('deliveredOn', input.deliveredOn);
    form.append('receivedByName', input.receivedByName);
    if (file) form.append('file', file);
    return disciplineWrite<{ communicationId: number }>(`/disciplinary/cases/${caseId}/formal-communication/physical`, {
      method: 'POST',
      body: form,
    });
  },

  recordDelivery: (
    caseId: number,
    communicationId: number,
    input: { medium: string; deliveredOn: string; receivedByName: string },
    file?: File,
  ) => {
    const form = new FormData();
    form.append('medium', input.medium);
    form.append('deliveredOn', input.deliveredOn);
    form.append('receivedByName', input.receivedByName);
    if (file) form.append('file', file);
    return disciplineWrite<{ communicationId: number }>(
      `/disciplinary/cases/${caseId}/communications/${communicationId}/delivery`,
      { method: 'POST', body: form },
    );
  },

  downloadCommunicationPdf: (caseId: number, communicationId: number, fileName: string) =>
    downloadDisciplineFile(
      `/disciplinary/cases/${caseId}/communications/${communicationId}/pdf`,
      fileName,
    ),

  fileWrittenDefense: (caseId: number, body: string, file: File) => {
    const form = new FormData();
    form.append('body', body);
    form.append('file', file);
    return disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/defenses/written`, {
      method: 'POST',
      body: form,
    });
  },

  resolveRevocation: (
    caseId: number,
    appealId: number,
    input: { outcome: string; reasoning: string },
  ) =>
    disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/revocations/${appealId}/resolution`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  resolveAppeal: (
    caseId: number,
    appealId: number,
    input: { outcome: string; reasoning: string; severity?: string },
  ) =>
    disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/appeals/${appealId}/resolution`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  orderPrecautionary: (
    caseId: number,
    input: { startsOn: string; endsOn: string; reason: string; paniCoordination: boolean },
  ) =>
    disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/precautionary-measures`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  createCase: (input: {
    studentUserId: number;
    infractionTypeId: number;
    occurredAt: string;
    place: string;
    description: string;
    witnesses?: string;
    subjectId?: number;
    lateReportReason?: string;
  }) =>
    disciplineWrite<CreatedDisciplinaryCase>('/disciplinary/cases', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  uploadEvidence: (caseId: number, file: File) => {
    const body = new FormData();
    body.append('file', file);
    return disciplineWrite<{ id: number }>(`/disciplinary/cases/${caseId}/evidences`, {
      method: 'POST',
      body,
    });
  },
};
