import { describe, expect, it } from 'vitest';
import {
  splitLastNames,
  toCreatePayload,
  validateUserForm,
  type UserFormValues,
} from './useUserForm';

const base: UserFormValues = {
  nationalId: '1-2345-6789',
  firstName: 'Ana',
  lastName: 'Pérez Soto',
  email: 'Ana@CTPHOJANCHA.ed.cr',
  phone: '88887777',
  password: 'Secret123',
  confirmPassword: 'Secret123',
  status: 'ACTIVE',
  roleIds: [1],
  departmentId: '',
  groupId: '',
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

  it('omits empty password and phone and never sends confirmPassword', () => {
    const payload = toCreatePayload({ ...base, password: '  ', phone: '', confirmPassword: 'x' });
    expect(payload.password).toBeUndefined();
    expect(payload.phone).toBeUndefined();
    expect(payload).not.toHaveProperty('confirmPassword');
  });

  it('envía groupId solo si hay Estudiante ACTIVE', () => {
    const withSection = toCreatePayload(
      { ...base, groupId: 12 },
      { studentRoleSelected: true },
    );
    expect(withSection.groupId).toBe(12);

    const pending = toCreatePayload(
      { ...base, status: 'PENDING', groupId: 12 },
      { studentRoleSelected: true },
    );
    expect(pending.groupId).toBeUndefined();

    const notStudent = toCreatePayload({ ...base, groupId: 12 });
    expect(notStudent.groupId).toBeUndefined();
  });
});

describe('validateUserForm', () => {
  it('passes a complete create form', () => {
    expect(validateUserForm(base, 'create')).toEqual({});
  });

  it('requires nationalId, names, email and roles', () => {
    const errors = validateUserForm(
      {
        ...base,
        nationalId: '',
        firstName: '',
        lastName: '',
        email: '',
        roleIds: [],
      },
      'create',
    );
    expect(errors.nationalId).toBeTruthy();
    expect(errors.firstName).toBeTruthy();
    expect(errors.lastName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.roleIds).toBeTruthy();
  });

  it('rejects invalid email and nationalId', () => {
    const errors = validateUserForm(
      { ...base, email: 'no-email', nationalId: '123' },
      'create',
    );
    expect(errors.email).toMatch(/formato/i);
    expect(errors.nationalId).toMatch(/9 y 12/);
  });

  it('requires temporary password and confirmation on create', () => {
    const missing = validateUserForm({ ...base, password: '', confirmPassword: '' }, 'create');
    expect(missing.password).toMatch(/requerida/i);
    expect(missing.confirmPassword).toMatch(/Confirme/i);

    const mismatch = validateUserForm(
      { ...base, password: 'Secret123', confirmPassword: 'Other123' },
      'create',
    );
    expect(mismatch.confirmPassword).toMatch(/coinciden/i);
  });

  it('exige sección cuando requiresGroup está activo', () => {
    const errors = validateUserForm(base, 'create', { requiresGroup: true });
    expect(errors.groupId).toMatch(/sección/i);
    expect(
      validateUserForm({ ...base, groupId: 12 }, 'create', { requiresGroup: true }),
    ).not.toHaveProperty('groupId');
    expect(validateUserForm(base, 'edit', { requiresGroup: true }).groupId).toMatch(/sección/i);
  });

  it('allows empty password on edit and validates length only when provided', () => {
    expect(
      validateUserForm({ ...base, password: '', confirmPassword: '' }, 'edit'),
    ).toEqual({});

    const short = validateUserForm({ ...base, password: 'short', confirmPassword: '' }, 'edit');
    expect(short.password).toMatch(/8 y 72/);
    expect(short.confirmPassword).toBeUndefined();
  });
});
