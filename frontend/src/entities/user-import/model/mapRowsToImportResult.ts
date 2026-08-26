import type { ImportedUserRow } from '@/types/user';
import type { ImportResult } from '@/entities/user-import';

/**
 * Adapta las filas ya validadas en vista previa al contrato de PBI-06.
 * No sustituye al motor Excel del backend; solo permite mostrar el resultado
 * con la misma forma que devolverá GET /bulk-import/:jobId.
 */
export function mapRowsToImportResult(rows: ImportedUserRow[]): ImportResult {
  const successfulRecords = rows
    .filter((row) => row.isValid)
    .map((row) => ({
      rowNumber: row.rowNumber,
      nationalId: row.data.nationalId,
      firstName: row.data.firstName,
      lastName: row.data.lastName,
      email: row.data.email,
      role: String(row.data.role ?? ''),
    }));

  const errorRecords = rows
    .filter((row) => !row.isValid)
    .flatMap((row) =>
      (row.errors.length ? row.errors : [{ field: undefined, message: 'Registro inválido' }]).map(
        (error) => ({
          rowNumber: row.rowNumber,
          data: {
            nationalId: row.data.nationalId,
            firstName: row.data.firstName,
            lastName: row.data.lastName,
            email: row.data.email,
            role: String(row.data.role ?? ''),
          },
          field: 'field' in error ? error.field : undefined,
          message: error.message,
        }),
      ),
    );

  return {
    type: 'users',
    successfulRecords,
    errorRecords,
    summary: {
      totalRecords: rows.length,
      successfulRecords: successfulRecords.length,
      errorRecords: errorRecords.length,
    },
  };
}
