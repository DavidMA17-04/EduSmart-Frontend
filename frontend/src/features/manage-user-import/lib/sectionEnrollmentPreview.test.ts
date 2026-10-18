import { describe, expect, it } from 'vitest';
import type { ImportedUserRecord } from '@/pages/Admin/Users/mocks/importedUsersMock';
import { rejectedRowsFromError } from '../api/userImportApi';
import { mapValidateResponseToRecords } from './mapValidateResponseToRecords';
import {
  applyServerRejections,
  revalidateImportPreviewRecords,
} from './validateImportPreviewRow';

const apiRow = (overrides: Record<string, unknown> = {}) => ({
  row: 1,
  status: 'VALID' as const,
  national_id: '101110111',
  name: 'Ana',
  first_lastname: 'Pérez',
  email: 'ana@ctphojancha.ed.cr',
  role: 'ESTUDIANTE',
  section: '10-1',
  user_status: 'ACTIVE' as const,
  ...overrides,
});

const response = (records: ReturnType<typeof apiRow>[]) => ({
  total: records.length,
  valid: 0,
  validPercentage: 0,
  warnings: 0,
  warningsPercentage: 0,
  errors: 0,
  errorsPercentage: 0,
  breakdown: { duplicateNationalId: 0, duplicateEmail: 0, requiredFieldsMissing: 0, invalidEmail: 0 },
  records,
});

describe('PBI-05 sección y matrícula en la vista previa', () => {
  it('conserva el grupo resuelto por el servidor', () => {
    const [row] = mapValidateResponseToRecords(
      response([
        apiRow({
          resolvedGroup: {
            groupId: 12,
            groupName: '10-1',
            academicPeriodId: 7,
            academicPeriodName: 'Curso 2026',
          },
        }),
      ]),
    );
    expect(row.resolvedGroupName).toBe('10-1');
    expect(row.sectionAtValidation).toBe('10-1');
  });

  it('la advertencia de sección del servidor sobrevive a la revalidación local', () => {
    const warning = 'Sección "9-9" no encontrada en un curso lectivo activo; se creará sin matrícula.';
    const records = mapValidateResponseToRecords(
      response([apiRow({ section: '9-9', status: 'WARNING', warningMessages: [warning] })]),
    );

    const [row] = revalidateImportPreviewRecords(records);

    expect(row.status).toBe('WARNING');
    expect(row.warningMessages).toContain(warning);
  });

  it('al editar la sección se descarta la advertencia vieja (se verifica al importar)', () => {
    const warning = 'Sección "9-9" no encontrada en un curso lectivo activo; se creará sin matrícula.';
    const records = mapValidateResponseToRecords(
      response([apiRow({ section: '9-9', status: 'WARNING', warningMessages: [warning] })]),
    );
    const edited: ImportedUserRecord[] = records.map((r) => ({ ...r, section: '10-1' }));

    const [row] = revalidateImportPreviewRecords(edited);

    expect(row.status).toBe('VALID');
    expect(row.warningMessages).not.toContain(warning);
  });

  it('marca como ERROR las filas rechazadas por el servidor y retiene el choque con BD', () => {
    const records = mapValidateResponseToRecords(response([apiRow(), apiRow({ row: 2 })]));
    const rejected = rejectedRowsFromError({
      code: 'BULK_IMPORT_DUPLICATE',
      rows: [
        {
          row: 2,
          invalidFields: ['email'],
          errorMessages: ['El correo (ana@ctphojancha.ed.cr) ya se encuentra registrado en el sistema.'],
        },
      ],
    });

    const marked = applyServerRejections(records, rejected);
    expect(marked[0].status).toBe('VALID');
    expect(marked[1].status).toBe('ERROR');
    expect(marked[1].invalidFields).toEqual(['email']);

    const afterEdit = revalidateImportPreviewRecords(
      marked.map((r) => (r.rowNumber === 2 ? { ...r, names: 'Ana María' } : r)),
    );
    expect(afterEdit[1].status).toBe('ERROR');
  });

  it('rejectedRowsFromError ignora payloads sin filas', () => {
    expect(rejectedRowsFromError(undefined)).toEqual([]);
    expect(rejectedRowsFromError({ message: 'x' })).toEqual([]);
  });
});
