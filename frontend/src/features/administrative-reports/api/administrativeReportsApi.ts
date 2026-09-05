import { HttpError, httpClient } from '@/shared/api';
import { clearAccessToken, getAccessToken } from '@/shared/auth';
import type {
  AcademicPeriodReportFilters,
  AcademicPeriodReportRow,
  AcademicStructureReportFilters,
  AcademicStructureReportRow,
  ReportExportFormat,
  ReportResponse,
  UserReportFilters,
  UserReportRow,
} from '../model/types';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

const EXPORT_FILES = {
  users: {
    pdf: 'reporte-usuarios.pdf',
    excel: 'reporte-usuarios.xlsx',
  },
  'academic-structure': {
    pdf: 'reporte-estructura-academica.pdf',
    excel: 'reporte-estructura-academica.xlsx',
  },
  'academic-periods': {
    pdf: 'reporte-periodos-academicos.pdf',
    excel: 'reporte-periodos-academicos.xlsx',
  },
} as const;

function toSearchParams(filters: object): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function requestReport<T>(path: string): Promise<T[]> {
  const response = await httpClient<ReportResponse<T>>(path);
  return response.data;
}

async function parseDownloadError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as {
    message?: string | string[];
  } | null;

  const rawMessage = payload?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage.filter(Boolean).join(' ')
    : rawMessage;

  if (response.status === 401) {
    return 'No autorizado. Inicie sesión para continuar.';
  }

  return message ?? 'No se pudo descargar el archivo.';
}

async function downloadReportFile(
  path: string,
  fileName: string,
  filters: object,
): Promise<void> {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}${toSearchParams(filters)}`, { headers });
  } catch {
    throw new Error(`No se pudo conectar con la API en ${apiBaseUrl}. Verifique que el backend esté activo.`);
  }

  if (response.status === 401) {
    clearAccessToken();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
    throw new HttpError(response.status, await parseDownloadError(response));
  }

  if (!response.ok) {
    throw new HttpError(response.status, await parseDownloadError(response));
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

function exportPath(resource: 'users' | 'academic-structure' | 'academic-periods', format: ReportExportFormat): string {
  return `/administrative-reports/${resource}/${format === 'pdf' ? 'pdf' : 'excel'}`;
}

export const administrativeReportsApi = {
  getUsers: (filters: UserReportFilters = {}) =>
    requestReport<UserReportRow>(`/administrative-reports/users${toSearchParams(filters)}`),

  getAcademicStructure: (filters: AcademicStructureReportFilters = {}) =>
    requestReport<AcademicStructureReportRow>(
      `/administrative-reports/academic-structure${toSearchParams(filters)}`,
    ),

  getAcademicPeriods: (filters: AcademicPeriodReportFilters = {}) =>
    requestReport<AcademicPeriodReportRow>(
      `/administrative-reports/academic-periods${toSearchParams(filters)}`,
    ),

  exportUsers: (format: ReportExportFormat, filters: UserReportFilters = {}) =>
    downloadReportFile(exportPath('users', format), EXPORT_FILES.users[format], filters),

  exportAcademicStructure: (format: ReportExportFormat, filters: AcademicStructureReportFilters = {}) =>
    downloadReportFile(
      exportPath('academic-structure', format),
      EXPORT_FILES['academic-structure'][format],
      filters,
    ),

  exportAcademicPeriods: (format: ReportExportFormat, filters: AcademicPeriodReportFilters = {}) =>
    downloadReportFile(
      exportPath('academic-periods', format),
      EXPORT_FILES['academic-periods'][format],
      filters,
    ),
};
