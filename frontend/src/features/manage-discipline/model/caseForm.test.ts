import { describe, expect, it } from 'vitest';
import { validateCaseForm, type CaseFormValues } from './caseForm';

const now = new Date(2026, 9, 19, 12, 0, 0);

function values(partial: Partial<CaseFormValues> = {}): CaseFormValues {
  return {
    studentUserId: 10,
    infractionTypeId: 2,
    occurredAt: '2026-10-14T10:00',
    place: 'Aula 12',
    description: 'Descripción de los hechos con más de veinte caracteres.',
    witnesses: '',
    lateReportReason: '',
    subjectId: '',
    files: [],
    ...partial,
  };
}

describe('formulario de amonestación', () => {
  it('acepta un registro completo', () => {
    expect(validateCaseForm(values(), 'DIRECT', now)).toEqual({});
  });

  it('exige estudiante, falta, lugar, descripción y fecha no futura', () => {
    const errors = validateCaseForm(
      values({
        studentUserId: null,
        infractionTypeId: null,
        place: '',
        description: 'corta',
        occurredAt: '2026-10-20T10:00',
      }),
      'MINOR' as never,
      now,
    );
    expect(errors.studentUserId).toBeTruthy();
    expect(errors.infractionTypeId).toBeTruthy();
    expect(errors.place).toBeTruthy();
    expect(errors.description).toBeTruthy();
    expect(errors.occurredAt).toMatch(/futura/);
  });

  it('pide justificación si la falta grave se reporta después de 5 días hábiles', () => {
    const errors = validateCaseForm(
      values({ occurredAt: '2026-10-08T10:00' }),
      'DUE_PROCESS',
      now,
    );
    expect(errors.lateReportReason).toBeTruthy();
    expect(
      validateCaseForm(
        values({ occurredAt: '2026-10-08T10:00', lateReportReason: 'El docente estaba incapacitado' }),
        'DUE_PROCESS',
        now,
      ).lateReportReason,
    ).toBeUndefined();
  });

  it('rechaza un archivo que no es PDF, JPG o PNG', () => {
    expect(
      validateCaseForm(values({ files: [{ name: 'acta.docx', size: 100 }] }), 'DIRECT', now).files,
    ).toBeTruthy();
  });
});