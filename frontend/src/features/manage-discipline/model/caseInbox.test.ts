import { describe, expect, it } from 'vitest';
import { caseListQuery, DEADLINE_LABELS, STATUS_LABELS } from './caseInbox';

describe('bandeja de expedientes', () => {
  it('traduce estado y plazo', () => {
    expect(STATUS_LABELS.INVESTIGATING).toBe('En investigación');
    expect(DEADLINE_LABELS.DUE_SOON).toBe('Por vencer');
    expect(DEADLINE_LABELS.OVERDUE).toBe('Vencido');
  });

  it('arma la consulta solo con los filtros elegidos', () => {
    expect(caseListQuery({})).toBe('');
    expect(caseListQuery({ status: 'REPORTED', severity: 'SERIOUS', deadline: 'OVERDUE', page: 2 })).toBe(
      '?status=REPORTED&severity=SERIOUS&deadline=OVERDUE&page=2',
    );
  });
});
