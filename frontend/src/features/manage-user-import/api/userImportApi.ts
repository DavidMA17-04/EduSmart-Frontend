import { httpClient } from '@/shared/api';

export interface BulkImportBreakdown {
  duplicateNationalId: number;
  duplicateEmail: number;
  requiredFieldsMissing: number;
  invalidEmail: number;
}

export interface KPISummary {
  totalRows: number;
  validRows: number;
  validPercentage: number;
  warningRows: number;
  warningPercentage: number;
  errorRows: number;
  errorPercentage: number;
}

export interface ImportedUserRecordApi {
  row: number;
  rowNumber?: number;
  tempId?: string;
  id?: string;
  status: 'VALID' | 'WARNING' | 'ERROR';
  national_id: string;
  identification?: string;
  name: string;
  names?: string;
  first_lastname: string;
  firstLastname?: string;
  second_lastname?: string | null;
  secondLastname?: string | null;
  email: string;
  role: string;
  section?: string | null;
  phone?: string | null;
  observations?: string[];
  invalidFields?: string[];
  errorMessages?: string[];
  warningMessages?: string[];
}

export interface ValidateBulkImportResponse {
  total: number;
  valid: number;
  validPercentage: number;
  warnings: number;
  warningsPercentage: number;
  errors: number;
  errorsPercentage: number;
  breakdown: BulkImportBreakdown;
  records: ImportedUserRecordApi[];
  kpis?: KPISummary;
  rows?: ImportedUserRecordApi[];
}

export interface ConfirmBulkImportResponse {
  importedCount: number;
  message: string;
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
};

export const userImportApi = {
  /**
   * Envía el archivo Excel o CSV al backend para su validación semántica en tiempo real
   */
  validateFile: async (file: File): Promise<ValidateBulkImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient<ApiEnvelope<ValidateBulkImportResponse>>(
      '/bulk-import/validate',
      {
        method: 'POST',
        body: formData,
      },
    );

    return response.data;
  },

  /**
   * Confirma la inserción atómica en base de datos MySQL de los registros válidos
   */
  confirmImport: async (
    validRecords: ImportedUserRecordApi[],
  ): Promise<ConfirmBulkImportResponse> => {
    // Normalizar registros para asegurar compatibilidad completa con el DTO del Backend
    const formattedRecords = validRecords.map((r) => ({
      row: Number(r.row || r.rowNumber || 1),
      status: 'VALID' as const,
      national_id: String(r.national_id || r.identification || '').trim(),
      name: String(r.name || r.names || '').trim(),
      first_lastname: String(r.first_lastname || r.firstLastname || '').trim(),
      second_lastname: (r.second_lastname || r.secondLastname || '').trim() || null,
      email: String(r.email || '').trim().toLowerCase(),
      role: String(r.role || 'ESTUDIANTE').trim(),
      section: (r.section || '').trim() || null,
      phone: (r.phone || '').trim() || null,
    }));

    const response = await httpClient<ApiEnvelope<ConfirmBulkImportResponse>>(
      '/bulk-import/confirm',
      {
        method: 'POST',
        body: JSON.stringify({ validRecords: formattedRecords }),
      },
    );

    return response.data;
  },
};
