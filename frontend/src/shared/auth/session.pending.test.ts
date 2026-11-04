import { describe, expect, it } from 'vitest';
import { AUTH_LOGIN_REASON, AuthLoginError } from '@/shared/auth';

describe('AuthLoginError ACCOUNT_PENDING', () => {
  it('exposes structured reason from login envelope', () => {
    const error = new AuthLoginError(
      401,
      'La cuenta está pendiente de verificación. Revise su correo o solicite un código nuevo.',
      AUTH_LOGIN_REASON.ACCOUNT_PENDING,
    );
    expect(error.status).toBe(401);
    expect(error.reason).toBe('ACCOUNT_PENDING');
    expect(error.message).toMatch(/pendiente de verificación/i);
  });

  it('keeps invalid credentials without pending reason', () => {
    const error = new AuthLoginError(401, 'Credenciales inválidas.');
    expect(error.reason).toBeNull();
  });
});
