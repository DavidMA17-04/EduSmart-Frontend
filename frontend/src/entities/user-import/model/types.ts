/**
 * Contrato de PBI-06. El origen futuro es un Excel procesado en NestJS;
 * la UI no parsea el archivo: solo representa este resultado.
 */
export interface ImportSuccessRecord {
  rowNumber: number;
  nationalId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  userId?: string;
}

export interface ImportErrorRecord {
  rowNumber: number;
  data?: Record<string, string | undefined>;
  field?: string;
  message: string;
}

export interface ImportResultSummary {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
}

export interface ImportResult {
  jobId?: string;
  type?: string;
  successfulRecords: ImportSuccessRecord[];
  errorRecords: ImportErrorRecord[];
  summary: ImportResultSummary;
}

export interface RegisterImportResultPayload {
  type?: string;
  successfulRecords: ImportSuccessRecord[];
  errorRecords: ImportErrorRecord[];
  summary?: ImportResultSummary;
}
