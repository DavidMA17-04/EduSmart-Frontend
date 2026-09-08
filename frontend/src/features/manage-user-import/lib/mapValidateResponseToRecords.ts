import type { ValidateBulkImportResponse } from '../api/userImportApi';
import type { ImportedUserRecord } from '@/pages/Admin/Users/mocks/importedUsersMock';
import {
  hasDbEmailConflict,
  hasDbNationalIdConflict,
  hasDbRoleConflict,
  mapBackendInvalidFields,
} from './validateImportPreviewRow';

export function mapValidateResponseToRecords(
  importPayload: ValidateBulkImportResponse,
): ImportedUserRecord[] {
  const sourceList = importPayload.records || importPayload.rows || [];
  return sourceList.map((r, idx) => {
    const identification = r.national_id || r.identification || '';
    const email = r.email || '';
    const errorMessages = r.errorMessages || [];
    return {
      id: r.tempId || `tmp-row-${idx + 1}`,
      rowNumber: r.row || r.rowNumber || idx + 1,
      identification,
      names: r.name || r.names || '',
      firstLastname: r.first_lastname || r.firstLastname || '',
      secondLastname: r.second_lastname || r.secondLastname || '',
      email,
      role: (r.role as ImportedUserRecord['role']) || 'ESTUDIANTE',
      section: r.section || '',
      phone: r.phone || undefined,
      userStatus: (r.user_status as ImportedUserRecord['userStatus']) || 'ACTIVE',
      status: r.status || 'VALID',
      invalidFields: mapBackendInvalidFields(r.invalidFields),
      errorMessages,
      warningMessages: r.warningMessages || [],
      dbConflictNationalId: hasDbNationalIdConflict(errorMessages)
        ? identification.trim()
        : null,
      dbConflictEmail: hasDbEmailConflict(errorMessages)
        ? email.trim().toLowerCase()
        : null,
      dbConflictRole: hasDbRoleConflict(errorMessages)
        ? String(r.role || '').trim()
        : null,
    };
  });
}
