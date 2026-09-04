import { describe, expect, it } from 'vitest';
import { splitLastNames, toCreatePayload, type UserFormValues } from './useUserForm';

const base: UserFormValues = {
  nationalId: '1-2345-6789',
  firstName: 'Ana',
  lastName: 'Pérez Soto',
  email: 'Ana@CTPHOJANCHA.ed.cr',
  phone: '88887777',
  password: 'Secret123',
  status: 'ACTIVE',
  roleIds: [1],
};

describe('splitLastNames', () => {
  it('splits first and remaining last names', () => {
    expect(splitLastNames('Pérez Soto')).toEqual({
      first_lastname: 'Pérez',
      second_lastname: 'Soto',
    });
  });

  it('keeps a single last name without second_lastname', () => {
    expect(splitLastNames('Rojas')).toEqual({ first_lastname: 'Rojas' });
  });
});

describe('toCreatePayload', () => {
  it('maps form values to backend create payload', () => {
    expect(toCreatePayload(base)).toEqual({
      nationalId: '123456789',
      name: 'Ana',
      first_lastname: 'Pérez',
      second_lastname: 'Soto',
      email: 'ana@ctphojancha.ed.cr',
      phone: '88887777',
      password: 'Secret123',
      status: 'ACTIVE',
      roleIds: [1],
    });
  });

  it('omits empty password and phone', () => {
    const payload = toCreatePayload({ ...base, password: '  ', phone: '' });
    expect(payload.password).toBeUndefined();
    expect(payload.phone).toBeUndefined();
  });
});
