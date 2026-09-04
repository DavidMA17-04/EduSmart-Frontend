import { describe, expect, it } from 'vitest';
import type { AdministrativeUser } from '@/entities/user';
import { filterUsers, paginateUsers, totalPagesFor } from './usersDirectoryUtils';

const base = {
  phone: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const;

const users: AdministrativeUser[] = [
  {
    ...base,
    id: 1,
    nationalId: '111',
    name: 'Ana Pérez',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana@ctphojancha.ed.cr',
    status: 'ACTIVE',
    roles: [{ id: 1, name: 'Administrador', status: 'ACTIVE' }],
  },
  {
    ...base,
    id: 2,
    nationalId: '222',
    name: 'Luis Mora',
    firstName: 'Luis',
    lastName: 'Mora',
    email: 'luis@ctphojancha.ed.cr',
    status: 'INACTIVE',
    roles: [{ id: 2, name: 'Docente', status: 'ACTIVE' }],
  },
  {
    ...base,
    id: 3,
    nationalId: '333',
    name: 'Carla Soto',
    firstName: 'Carla',
    lastName: 'Soto',
    email: 'carla@ctphojancha.ed.cr',
    status: 'ACTIVE',
    roles: [{ id: 3, name: 'Estudiante', status: 'ACTIVE' }],
  },
];

describe('filterUsers', () => {
  it('filters by status', () => {
    expect(filterUsers(users, 'ACTIVE', 'ALL', '')).toHaveLength(2);
  });

  it('filters by role', () => {
    expect(filterUsers(users, 'ALL', 2, '').map((u) => u.id)).toEqual([2]);
  });

  it('filters by search term', () => {
    expect(filterUsers(users, 'ALL', 'ALL', 'carla').map((u) => u.id)).toEqual([3]);
  });
});

describe('paginateUsers / totalPagesFor', () => {
  it('paginates with page size 2', () => {
    expect(paginateUsers([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
  });

  it('computes total pages', () => {
    expect(totalPagesFor(25, 10)).toBe(3);
    expect(totalPagesFor(0, 10)).toBe(1);
  });
});
