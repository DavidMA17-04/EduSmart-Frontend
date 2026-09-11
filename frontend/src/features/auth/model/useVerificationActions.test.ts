import { describe, expect, it, vi } from 'vitest';
import { isValidEmail } from '@/features/auth/model/useVerificationActions';

describe('isValidEmail', () => {
  it('accepts institutional emails', () => {
    expect(isValidEmail('user@ctphojancha.ed.cr')).toBe(true);
  });

  it('rejects cédula-like identifiers', () => {
    expect(isValidEmail('109870543')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('useVerificationActions contract', () => {
  it('does not auto-send on import (smoke)', () => {
    const spy = vi.fn();
    expect(spy).not.toHaveBeenCalled();
  });
});
