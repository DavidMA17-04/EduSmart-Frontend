import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userApi } from './userApi';

vi.mock('@/shared/api', () => ({
  httpClient: vi.fn(),
}));

import { httpClient } from '@/shared/api';

const mockedHttp = vi.mocked(httpClient);

const ownFicha = {
  id: 88,
  nationalId: '118760543',
  name: 'Aaron',
  first_lastname: 'Solano',
  second_lastname: 'Cordero',
  email: 'solanoaaron853@gmail.com',
  phone: '88880000',
  status: 'ACTIVE',
  roles: [{ id: 3, name: 'Estudiante', status: 'ACTIVE' }],
  enrollment: null,
};

describe('userApi own profile', () => {
  beforeEach(() => {
    mockedHttp.mockReset();
  });

  it('getMe llama GET /users/me y no /users/:id ni /students', async () => {
    mockedHttp.mockResolvedValueOnce({ success: true, data: ownFicha });

    const me = await userApi.getMe();

    expect(me.email).toBe('solanoaaron853@gmail.com');
    expect(me.enrollment).toBeNull();
    expect(mockedHttp).toHaveBeenCalledWith('/users/me', undefined);
    expect(mockedHttp.mock.calls.flat().join(' ')).not.toMatch(/\/users\/\d/);
    expect(mockedHttp.mock.calls.flat().join(' ')).not.toContain('/students');
  });

  it('updateMe parchea teléfono en /users/me', async () => {
    mockedHttp.mockResolvedValueOnce({
      success: true,
      data: { ...ownFicha, phone: '70001122' },
    });

    const me = await userApi.updateMe({ phone: '70001122' });

    expect(me.phone).toBe('70001122');
    expect(mockedHttp).toHaveBeenCalledWith('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ phone: '70001122' }),
    });
  });
});
