import { describe, expect, it } from 'vitest';
import {
  generateCompliantPassword,
  getPasswordRequirements,
  isValidInitialPassword,
} from './userFormRules';

describe('password policy', () => {
  it('accepts a strong password', () => {
    expect(isValidInitialPassword('Secret12!')).toBe(true);
    expect(getPasswordRequirements('Secret12!')).toEqual({
      length: true,
      lower: true,
      upper: true,
      digit: true,
      special: true,
    });
  });

  it('rejects weak passwords', () => {
    expect(isValidInitialPassword('secret12')).toBe(false);
    expect(isValidInitialPassword('SECRET12')).toBe(false);
    expect(isValidInitialPassword('Secret!!')).toBe(false);
    expect(isValidInitialPassword('Secret12')).toBe(false);
  });

  it('generates compliant passwords', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(isValidInitialPassword(generateCompliantPassword())).toBe(true);
    }
  });
});
