import type { MyScheduleCardVariant } from './mySchedulePresentation';
import { MY_SCHEDULE_COPY } from './useMySchedulePanel';

export type MyScheduleEmptyKind = 'no-enrollment' | 'no-schedule';

export function resolveMyScheduleEmptyCopy(
  variant: MyScheduleCardVariant,
  kind: MyScheduleEmptyKind = 'no-schedule',
  sectionLabel?: string | null,
): { title: string; description: string } {
  if (variant !== 'student') {
    return {
      title: MY_SCHEDULE_COPY.emptyTitle,
      description: MY_SCHEDULE_COPY.emptyDescription,
    };
  }

  if (kind === 'no-enrollment') {
    return {
      title: 'Sin matrícula activa',
      description:
        'Aún no estás matriculado en una sección de un curso lectivo activo. El horario se mostrará cuando tengas matrícula.',
    };
  }

  const section = sectionLabel?.trim();
  return {
    title: 'Aún no tienes horario',
    description: section
      ? `La sección ${section} todavía no tiene lecciones publicadas. Cuando el colegio asigne el horario, aparecerá aquí.`
      : 'Todavía no hay lecciones publicadas para tu sección. Cuando el colegio asigne el horario, aparecerá aquí.',
  };
}
