import { describe, expect, it } from 'vitest';
import { loginInitialFocusTarget } from './loginInitialFocus';

describe('loginInitialFocusTarget', () => {
  it('cédula vacía → enfocar cédula', () => {
    expect(loginInitialFocusTarget('')).toBe('identifier');
    expect(loginInitialFocusTarget('   ')).toBe('identifier');
  });

  it('cédula inválida → enfocar cédula', () => {
    expect(loginInitialFocusTarget('123')).toBe('identifier');
    expect(loginInitialFocusTarget('admin@test.com')).toBe('identifier');
  });

  it('cédula válida → enfocar contraseña', () => {
    expect(loginInitialFocusTarget('100000000')).toBe('password');
    expect(loginInitialFocusTarget('1-2345-6789')).toBe('password');
  });
});
