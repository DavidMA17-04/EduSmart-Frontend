import { describe, expect, it } from 'vitest';
import { historyQuery, mergeHistoryStudents, resolveHistoryStudent } from './conductHistory';

describe('historial de conducta', () => {
  it('arma la consulta de período, estado y gravedad', () => {
    expect(historyQuery({})).toBe('');
    expect(historyQuery({ academicPeriodId: 4, status: 'FIRM', severity: 'SERIOUS' })).toBe(
      '?academicPeriodId=4&status=FIRM&severity=SERIOUS',
    );
  });

  it('el estudiante solo abre su propio historial', () => {
    expect(
      resolveHistoryStudent({
        audience: 'student',
        sessionUserId: 21,
        requestedStudentId: 99,
        allowedStudentIds: [],
      }),
    ).toEqual({ studentId: 21, blocked: false });
  });

  it('el encargado no consulta a un estudiante que no representa', () => {
    expect(
      resolveHistoryStudent({
        audience: 'guardian',
        sessionUserId: 9,
        requestedStudentId: 99,
        allowedStudentIds: [10, 11],
      }),
    ).toEqual({ studentId: null, blocked: true });
    expect(
      resolveHistoryStudent({
        audience: 'guardian',
        sessionUserId: 9,
        requestedStudentId: 11,
        allowedStudentIds: [10, 11],
      }).studentId,
    ).toBe(11);
  });

  it('con un solo representado el encargado entra directo', () => {
    expect(
      resolveHistoryStudent({
        audience: 'guardian',
        sessionUserId: 9,
        requestedStudentId: null,
        allowedStudentIds: [10],
      }).studentId,
    ).toBe(10);
  });

  it('une estudiantes de la bandeja y de las notificaciones sin repetir', () => {
    expect(
      mergeHistoryStudents(
        [{ id: 11, fullName: 'María Sol' }],
        [
          { id: 10, fullName: 'Luis Mora' },
          { id: 11, fullName: 'María Sol' },
        ],
      ).map((student) => student.id),
    ).toEqual([10, 11]);
  });
});