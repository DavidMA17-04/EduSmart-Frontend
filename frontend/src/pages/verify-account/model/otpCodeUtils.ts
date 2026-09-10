export const OTP_CODE_LENGTH = 6;

/** Keep only digits, capped to OTP length. */
export function sanitizeOtpDigits(raw: string, maxLength = OTP_CODE_LENGTH): string {
  return raw.replace(/\D/g, '').slice(0, maxLength);
}

/** Contiguous OTP model: set digit at index. */
export function setOtpDigit(
  current: string,
  index: number,
  digit: string,
  maxLength = OTP_CODE_LENGTH,
): { value: string; focusIndex: number } {
  const d = sanitizeOtpDigits(digit, 1);
  if (!d) {
    return { value: sanitizeOtpDigits(current, maxLength), focusIndex: index };
  }
  const sanitized = sanitizeOtpDigits(current, maxLength);
  const base = sanitized.slice(0, index);
  const rest = sanitized.slice(index + 1);
  const value = sanitizeOtpDigits(base + d + rest, maxLength);
  return { value, focusIndex: Math.min(index + 1, maxLength - 1) };
}

export function clearOtpDigitAt(
  current: string,
  index: number,
  maxLength = OTP_CODE_LENGTH,
): { value: string; focusIndex: number } {
  const sanitized = sanitizeOtpDigits(current, maxLength);
  if (sanitized.length === 0) {
    return { value: '', focusIndex: 0 };
  }
  if (index >= sanitized.length) {
    return { value: sanitized.slice(0, -1), focusIndex: Math.max(0, sanitized.length - 2) };
  }
  const value = sanitized.slice(0, index) + sanitized.slice(index + 1);
  return { value, focusIndex: Math.max(0, index - 1) };
}
