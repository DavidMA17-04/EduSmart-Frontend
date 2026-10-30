import { describe, expect, it } from 'vitest';
import { normalizeUser, userToFormValues } from './userMappers';

describe('normalizeUser enrollment', () => {
  it('conserva la matrícula propia cuando viene en /users/me', () => {
    const user = normalizeUser({
      id: 88,
      name: 'Aaron',
      first_lastname: 'Solano',
      email: 'solanoaaron853@gmail.com',
      enrollment: {
        groupId: 12,
        groupName: 'A',
        sectionLabel: '10-A',
        specialtyName: 'Programación',
        academicPeriodId: 4,
        academicPeriodName: '2026',
        startsOn: '2026-02-01',
        status: 'ACTIVE',
      },
    });
    expect(user.enrollment?.sectionLabel).toBe('10-A');
  });

  it('deja enrollment nulo en usuarios nuevos sin matrícula', () => {
    const user = normalizeUser({
      id: 88,
      email: 'solanoaaron853@gmail.com',
      enrollment: null,
    });
    expect(user.enrollment).toBeNull();
  });

  it('la ficha de edición no precarga groupId (no hay traslado en el combo)', () => {
    const values = userToFormValues(
      normalizeUser({
        id: 88,
        name: 'Aaron',
        enrollment: {
          groupId: 12,
          groupName: 'A',
          sectionLabel: '10-A',
          specialtyName: null,
          academicPeriodId: 4,
          academicPeriodName: '2026',
          startsOn: '2026-02-01',
          status: 'ACTIVE',
        },
      }),
    );
    expect(values.groupId).toBe('');
  });
});
