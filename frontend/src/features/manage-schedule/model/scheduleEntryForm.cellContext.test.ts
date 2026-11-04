import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveScheduleEntrySubmit } from './scheduleEntrySubmit';

const formSrc = readFileSync(
  resolve(__dirname, '../ui/ScheduleEntryForm.tsx'),
  'utf8',
);
const panelSrc = readFileSync(
  resolve(__dirname, '../../../widgets/schedule-panel/ui/SchedulePanel.tsx'),
  'utf8',
);

const lockedForm = {
  teachingAssignmentId: '7',
  dayOfWeek: '1',
  timeSlotId: '12',
};

describe('schedule assign form locked to cell', () => {
  it('muestra contexto de día y bloque y no ofrece selectores', () => {
    expect(formSrc).toContain('styles.context');
    expect(formSrc).toContain('contextDayLabel');
    expect(formSrc).toContain('contextSlotLabel');
    expect(formSrc).toContain('aria-label="Asignación académica"');
    expect(formSrc).not.toContain('aria-label="Día"');
    expect(formSrc).not.toContain('aria-label="Bloque horario"');
    expect(formSrc).not.toContain('Seleccione un día');
    expect(formSrc).not.toContain('Seleccione un bloque');
    expect(formSrc).toContain('onChange({ teachingAssignmentId: e.target.value })');
    expect(formSrc).not.toContain('onChange({ dayOfWeek');
    expect(formSrc).not.toContain('onChange({ timeSlotId');
  });

  it('el panel no pasa dayOptions ni assignableSlots al formulario', () => {
    expect(panelSrc).toContain('contextDayLabel={model.contextDayLabel}');
    expect(panelSrc).toContain('contextSlotLabel={model.contextSlotLabel}');
    expect(panelSrc).not.toContain('dayOptions=');
    expect(panelSrc).not.toContain('assignableSlots=');
  });

  it('create envía la celda precargada; update solo la asignación', () => {
    const created = resolveScheduleEntrySubmit('create', lockedForm, null);
    expect(created).toEqual({
      ok: true,
      mode: 'create',
      payload: {
        teachingAssignmentId: 7,
        dayOfWeek: 1,
        timeSlotId: 12,
      },
    });

    const updated = resolveScheduleEntrySubmit('edit', lockedForm, 44);
    expect(updated).toEqual({
      ok: true,
      mode: 'update',
      entryId: 44,
      payload: { teachingAssignmentId: 7 },
    });
    if (updated.ok && updated.mode === 'update') {
      expect(updated.payload).not.toHaveProperty('dayOfWeek');
      expect(updated.payload).not.toHaveProperty('timeSlotId');
    }
  });
});
