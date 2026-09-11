import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildInstitutionMetrics } from './institutionStats';
import type { CampusSnapshot } from '@/features/public';

describe('buildInstitutionMetrics', () => {
  it('keeps zero as a valid metric', () => {
    const snapshot: CampusSnapshot = {
      totalUsers: 0,
      activeUsers: 0,
      totalSpecialties: 0,
      totalExploratoryWorkshops: 0,
      totalSections: 0,
    };
    const metrics = buildInstitutionMetrics(snapshot);
    expect(metrics).toHaveLength(4);
    expect(metrics.every((item) => item.value === 0)).toBe(true);
  });

  it('omits nullish / non-finite values', () => {
    const snapshot = {
      totalUsers: 10,
      activeUsers: 8,
      totalSpecialties: undefined,
      totalExploratoryWorkshops: null,
      totalSections: Number.NaN,
    } as unknown as CampusSnapshot;

    const metrics = buildInstitutionMetrics(snapshot);
    expect(metrics).toEqual([{ key: 'users', value: 10, label: 'Usuarios en EduSmart' }]);
  });

  it('returns empty list when snapshot is null (hide KPI)', () => {
    expect(buildInstitutionMetrics(null)).toEqual([]);
  });

  it('single metric means no rotation needed', () => {
    const metrics = buildInstitutionMetrics({
      totalUsers: 42,
      activeUsers: 40,
      totalSpecialties: undefined as unknown as number,
      totalExploratoryWorkshops: undefined as unknown as number,
      totalSections: undefined as unknown as number,
    });
    expect(metrics).toHaveLength(1);
    expect(metrics.length > 1).toBe(false);
  });

  it('multiple metrics enable rotation', () => {
    const metrics = buildInstitutionMetrics({
      totalUsers: 42,
      activeUsers: 40,
      totalSpecialties: 7,
      totalExploratoryWorkshops: 12,
      totalSections: 8,
    });
    expect(metrics.length).toBeGreaterThan(1);
  });
});

describe('InstitutionStatsCard accessibility contract', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(path.join(here, 'InstitutionStatsCard.tsx'), 'utf8');

  it('does not use aria-live for automatic announcements', () => {
    expect(source.includes('aria-live')).toBe(false);
  });

  it('does not aria-hide the whole KPI card', () => {
    expect(source).not.toMatch(/aria-hidden=\{?true\}?[\s\S]{0,40}className=\{styles\.card\}/);
    expect(source).toMatch(/role="group"/);
  });
});
