import { describe, expect, it } from 'vitest';
import { costaRicaToday, formatClock, initials, sectionLabel } from './format';

describe('student-departures format', () => {
  it('uses the Costa Rica calendar day (UTC-6)', () => {
    expect(costaRicaToday(new Date('2026-10-30T05:59:00Z'))).toBe('2026-10-29');
    expect(costaRicaToday(new Date('2026-10-30T06:00:00Z'))).toBe('2026-10-30');
  });

  it('formats HH:mm[:ss] as a 12-hour clock', () => {
    expect(formatClock('14:30:00')).toMatch(/2:30/);
    expect(formatClock('07:05')).toMatch(/7:05/);
  });

  it('builds initials and section labels', () => {
    expect(initials('Ana María Rojas')).toBe('AM');
    expect(sectionLabel({ groupName: '10-1', sectionName: null })).toContain('10-1');
    expect(sectionLabel({ groupName: null, sectionName: null })).toBeTruthy();
  });
});
