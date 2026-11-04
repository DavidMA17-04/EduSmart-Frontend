import { describe, expect, it } from 'vitest';
import { resolveMyScheduleEmptyCopy } from './myScheduleEmptyCopy';
import { MY_SCHEDULE_COPY } from './useMySchedulePanel';

describe('resolveMyScheduleEmptyCopy', () => {
  it('docente conserva el empty de clases asignadas', () => {
    expect(resolveMyScheduleEmptyCopy('teacher')).toEqual({
      title: MY_SCHEDULE_COPY.emptyTitle,
      description: MY_SCHEDULE_COPY.emptyDescription,
    });
  });

  it('estudiante sin matrícula no reutiliza el empty del docente', () => {
    const copy = resolveMyScheduleEmptyCopy('student', 'no-enrollment');
    expect(copy.title).toBe('Sin matrícula activa');
    expect(copy.description).toMatch(/matriculado/i);
    expect(copy.title).not.toBe(MY_SCHEDULE_COPY.emptyTitle);
    expect(copy.description).not.toBe(MY_SCHEDULE_COPY.emptyDescription);
  });

  it('estudiante sin horario nombra la sección si existe', () => {
    const copy = resolveMyScheduleEmptyCopy('student', 'no-schedule', '10-1');
    expect(copy.title).toBe('Aún no tienes horario');
    expect(copy.description).toContain('10-1');
    expect(copy.description).not.toBe(MY_SCHEDULE_COPY.emptyDescription);
  });
});
