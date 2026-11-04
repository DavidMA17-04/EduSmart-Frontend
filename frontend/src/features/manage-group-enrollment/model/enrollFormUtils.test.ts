import { describe, expect, it } from 'vitest';
import {
  buildCreateEnrollmentPayload,
  validateEnrollStudentForm,
} from './enrollFormUtils';

describe('enrollFormUtils', () => {
  it('exige estudiante y fecha', () => {
    expect(validateEnrollStudentForm({ userId: '', startsOn: '' })).toEqual({
      userId: 'Seleccione un estudiante.',
      startsOn: 'Indique la fecha de inicio (AAAA-MM-DD).',
    });
  });

  it('buildCreateEnrollmentPayload', () => {
    expect(
      buildCreateEnrollmentPayload(20, {
        userId: '7',
        startsOn: '2026-02-01',
      }),
    ).toEqual({ userId: 7, groupId: 20, startsOn: '2026-02-01' });
  });
});
