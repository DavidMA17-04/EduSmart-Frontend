import { describe, expect, it } from 'vitest';
import {
  sanitizeOtpDigits,
  setOtpDigit,
  clearOtpDigitAt,
} from './otpCodeUtils';

describe('otpCodeUtils', () => {
  it('sanitizeOtpDigits strips non-digits and caps length', () => {
    expect(sanitizeOtpDigits('12a3-45 6x789')).toBe('123456');
    expect(sanitizeOtpDigits('')).toBe('');
  });

  it('setOtpDigit inserts and advances focus', () => {
    expect(setOtpDigit('', 0, '1')).toEqual({ value: '1', focusIndex: 1 });
    expect(setOtpDigit('12', 2, '3')).toEqual({ value: '123', focusIndex: 3 });
    expect(setOtpDigit('123456', 5, '9')).toEqual({ value: '123459', focusIndex: 5 });
  });

  it('clearOtpDigitAt removes and moves focus back', () => {
    expect(clearOtpDigitAt('123', 2)).toEqual({ value: '12', focusIndex: 1 });
    expect(clearOtpDigitAt('123', 0)).toEqual({ value: '23', focusIndex: 0 });
    expect(clearOtpDigitAt('', 0)).toEqual({ value: '', focusIndex: 0 });
  });
});
