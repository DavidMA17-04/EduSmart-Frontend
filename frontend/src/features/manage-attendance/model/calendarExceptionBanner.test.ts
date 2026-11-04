import { describe, expect, it } from 'vitest';
import { formatCalendarExceptionBanner } from './calendarExceptionBanner';

describe('formatCalendarExceptionBanner', () => {
  it('returns null without exception', () => {
    expect(formatCalendarExceptionBanner(null)).toBeNull();
  });

  it('describes SUSPENDED exam week', () => {
    const text = formatCalendarExceptionBanner({
      id: 1,
      academicPeriodId: 2,
      sectionId: null,
      title: 'Exámenes I',
      description: null,
      startDate: '2026-05-12',
      endDate: '2026-05-16',
      exceptionType: 'SUSPENDED',
      createdByUserId: 1,
      createdAt: '',
      updatedAt: '',
    });
    expect(text).toContain('Semana de exámenes');
    expect(text).toContain('Exámenes I');
    expect(text).toContain('no penalizan');
  });

  it('describes AUTO_JUSTIFIED period', () => {
    const text = formatCalendarExceptionBanner({
      id: 1,
      academicPeriodId: 2,
      sectionId: null,
      title: 'Jornada institucional',
      description: null,
      startDate: '2026-06-01',
      endDate: '2026-06-02',
      exceptionType: 'AUTO_JUSTIFIED',
      createdByUserId: 1,
      createdAt: '',
      updatedAt: '',
    });
    expect(text).toContain('justifican automáticamente');
  });
});
