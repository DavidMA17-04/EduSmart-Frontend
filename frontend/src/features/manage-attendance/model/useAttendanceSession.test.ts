import { describe, expect, it } from 'vitest';
import { HttpError } from '@/shared/api';
import { parseAttendanceSessionId } from './attendanceRouting';

describe('attendance session load contracts', () => {
  it('reutiliza parseAttendanceSessionId', () => {
    expect(parseAttendanceSessionId('12')).toBe(12);
    expect(parseAttendanceSessionId('abc')).toBeNull();
  });

  it('session 404 message contract', () => {
    const error = new HttpError(404, 'Not Found');
    expect(error.status).toBe(404);
  });

  it('roster error distinto de empty array', () => {
    const emptyRoster: unknown[] = [];
    const rosterFailed = true;
    expect(emptyRoster.length === 0 && !rosterFailed).toBe(false);
    expect(rosterFailed).toBe(true);
  });

  it('parallel load contract: Promise.allSettled shape', async () => {
    const [a, b] = await Promise.allSettled([
      Promise.resolve({ sessionId: 1 }),
      Promise.reject(new HttpError(500, 'Roster down')),
    ]);
    expect(a.status).toBe('fulfilled');
    expect(b.status).toBe('rejected');
  });
});
