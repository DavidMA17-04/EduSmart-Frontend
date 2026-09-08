const MAX_BULK_IMPORT_BYTES = 10 * 1024 * 1024;
const ALLOWED_BULK_IMPORT_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const;

export function getBulkImportExtension(fileName: string): string {
  const lower = fileName.toLowerCase();
  const dot = lower.lastIndexOf('.');
  return dot >= 0 ? lower.slice(dot) : '';
}

export function validateBulkImportFile(file: File): string | null {
  const extension = getBulkImportExtension(file.name);
  if (!(ALLOWED_BULK_IMPORT_EXTENSIONS as readonly string[]).includes(extension)) {
    return 'Solo se permiten archivos con extensión .xlsx, .xls o .csv.';
  }
  if (file.size > MAX_BULK_IMPORT_BYTES) {
    return 'El archivo supera el límite máximo de 10 MB.';
  }
  return null;
}

export { MAX_BULK_IMPORT_BYTES, ALLOWED_BULK_IMPORT_EXTENSIONS };
