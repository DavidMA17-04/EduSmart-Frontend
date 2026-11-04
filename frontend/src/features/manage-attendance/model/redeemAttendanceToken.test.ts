import { describe, expect, it } from 'vitest';
import {
  formatRedeemSuccessMessage,
  isValidAttendanceCode,
  normalizeAttendanceCode,
  redeemTokenErrorMessage,
} from './redeemAttendanceToken';
import { HttpError } from '@/shared/api';

describe('redeemAttendanceToken helpers', () => {
  it('normaliza a mayúsculas sin espacios', () => {
    expect(normalizeAttendanceCode(' 3x6 scqg2 ')).toBe('3X6SCQG2');
  });

  it('valida longitud alfanumérica', () => {
    expect(isValidAttendanceCode('3X6SCQG2')).toBe(true);
    expect(isValidAttendanceCode('ABC')).toBe(false);
    expect(isValidAttendanceCode('ABC-123')).toBe(false);
  });

  it('mapea errores de token a mensajes claros', () => {
    expect(
      redeemTokenErrorMessage(new HttpError(400, 'Attendance token has expired')),
    ).toMatch(/expir/i);
    expect(
      redeemTokenErrorMessage(new HttpError(404, 'Attendance token not found')),
    ).toMatch(/no es válido/i);
    expect(
      redeemTokenErrorMessage(
        new HttpError(403, 'You are not enrolled in the group for this session'),
      ),
    ).toMatch(/perteneces/i);
  });

  it('formatea confirmación de canje', () => {
    const message = formatRedeemSuccessMessage({
      attendanceId: 1,
      sessionId: 9,
      studentUserId: 501,
      status: 'PRESENT',
      registrationMethod: 'TOKEN',
      registeredAt: '2026-09-11T14:00:00.000Z',
      alreadyRedeemed: false,
      sessionDate: '2026-09-11',
      groupName: '10-1',
      offeringName: 'Matemática',
      offeringLabelKind: 'SUBJECT',
    });
    expect(message).toContain('Matemática');
    expect(message).toContain('10-1');
  });
});
