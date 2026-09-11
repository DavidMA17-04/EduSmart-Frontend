import type { CampusSnapshot } from '@/features/public';

export type InstitutionMetric = {
  key: string;
  value: number;
  label: string;
};

export const INSTITUTION_STATS_SLIDE_MS = 5500;
export const INSTITUTION_STATS_TRANSITION_MS = 520;

/**
 * Builds public KPI slides. `0` is valid; `null`/`undefined`/NaN are omitted.
 */
export function buildInstitutionMetrics(
  snapshot: CampusSnapshot | null | undefined,
): InstitutionMetric[] {
  if (!snapshot) return [];

  const candidates: Array<{ key: string; value: number | null | undefined; label: string }> = [
    {
      key: 'users',
      value: snapshot.totalUsers,
      label: 'Usuarios en EduSmart',
    },
    {
      key: 'specialties',
      value: snapshot.totalSpecialties,
      label: 'Especialidades técnicas',
    },
    {
      key: 'workshops',
      value: snapshot.totalExploratoryWorkshops,
      label: 'Talleres exploratorios',
    },
    {
      key: 'sections',
      value: snapshot.totalSections,
      label: 'Secciones académicas',
    },
  ];

  return candidates
    .filter(
      (item): item is { key: string; value: number; label: string } =>
        typeof item.value === 'number' && Number.isFinite(item.value),
    )
    .map(({ key, value, label }) => ({ key, value, label }));
}

export function formatInstitutionCount(value: number): string {
  return value.toLocaleString('es-CR');
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
