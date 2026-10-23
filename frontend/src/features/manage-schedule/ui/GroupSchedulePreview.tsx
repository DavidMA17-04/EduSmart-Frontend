import { CalendarClock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import {
  SCHEDULE_HOME_PATH,
  SCHEDULE_WEEKDAYS,
  entriesForCell,
  formatSlotRange,
} from '@/features/manage-schedule';
import { Alert, Card, EmptyState } from '@/shared/ui';
import type { GroupSchedulePreviewModel } from '../model/useGroupSchedulePreview';
import styles from './GroupSchedulePreview.module.css';

type Props = {
  model: GroupSchedulePreviewModel;
  groupLabel?: string;
};

const DAY_SHORT: Record<number, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
};

function compactSlotLabel(slot: ScheduleTimeSlot): string {
  if (slot.lessonNumber != null) return `L${slot.lessonNumber}`;
  const match = /^lección\s*(\d+)/i.exec(slot.name.trim());
  if (match) return `L${match[1]}`;
  return slot.name.slice(0, 4);
}

function compactOfferingName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 10) return trimmed;
  return `${trimmed.slice(0, 9)}…`;
}

function entryTooltipLines(
  entry: ScheduleEntry,
  slot: ScheduleTimeSlot,
  dayLabel: string,
): string[] {
  return [
    entry.teachingAssignment.offering.name,
    entry.teachingAssignment.teacher.name,
    `${dayLabel} · ${formatSlotRange(slot.startTime, slot.endTime)}`,
    slot.name,
  ].filter(Boolean);
}

export function GroupSchedulePreview({ model, groupLabel }: Props) {
  if (!model.groupId) {
    return (
      <Card className={styles.panel}>
        <p className={styles.muted}>
          Seleccione una sección para ver su horario semanal.
        </p>
      </Card>
    );
  }

  if (!model.canView) {
    return null;
  }

  const scheduleHref = `${SCHEDULE_HOME_PATH}?groupId=${model.groupId}`;
  const classSlots = model.slots.filter((slot) => slot.slotType === 'CLASS');

  return (
    <Card className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h3>Horario de la sección</h3>
          <p>
            {groupLabel
              ? `Sección ${groupLabel}`
              : `Sección #${model.groupId}`}
            <span className={styles.hint}> · pase el cursor para ver detalle</span>
          </p>
        </div>
        <Link className={styles.link} to={scheduleHref}>
          <ExternalLink size={14} />
          Abrir en Horario
        </Link>
      </div>

      {model.error && <Alert>{model.error}</Alert>}

      {model.loading ? (
        <p className={styles.muted}>Cargando horario…</p>
      ) : !model.hasEntries ? (
        <EmptyState
          description="Asigne clases desde Horario filtrando por esta sección."
          icon={CalendarClock}
          title="Sin horario asignado"
        />
      ) : classSlots.length === 0 ? (
        <p className={styles.muted}>No hay lecciones de clase en el horario.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th className={styles.dayCol} scope="col">
                  Día
                </th>
                {classSlots.map((slot) => (
                  <th
                    className={styles.slotHead}
                    key={slot.id}
                    scope="col"
                    title={`${slot.name} · ${formatSlotRange(slot.startTime, slot.endTime)}`}
                  >
                    {compactSlotLabel(slot)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE_WEEKDAYS.map((day) => (
                <tr key={day.dayOfWeek}>
                  <th className={styles.dayCol} scope="row">
                    {DAY_SHORT[day.dayOfWeek] ?? day.label}
                  </th>
                  {classSlots.map((slot) => {
                    const cellEntries = entriesForCell(
                      model.byCell,
                      day.dayOfWeek,
                      slot.id,
                    );
                    if (cellEntries.length === 0) {
                      return (
                        <td className={styles.classCell} key={slot.id}>
                          <span className={styles.empty}>·</span>
                        </td>
                      );
                    }

                    const primary = cellEntries[0];
                    const more = cellEntries.length - 1;
                    const tipLines = cellEntries.flatMap((entry) =>
                      entryTooltipLines(entry, slot, day.label),
                    );

                    return (
                      <td className={styles.classCell} key={slot.id}>
                        <button
                          aria-label={tipLines.join('. ')}
                          className={styles.chip}
                          type="button"
                        >
                          <span className={styles.chipText}>
                            {compactOfferingName(
                              primary.teachingAssignment.offering.name,
                            )}
                            {more > 0 ? ` +${more}` : ''}
                          </span>
                          <span className={styles.tooltip} role="tooltip">
                            {cellEntries.map((entry) => (
                              <span
                                className={styles.tooltipBlock}
                                key={entry.entryId}
                              >
                                <strong>
                                  {entry.teachingAssignment.offering.name}
                                </strong>
                                <span>
                                  {entry.teachingAssignment.teacher.name}
                                </span>
                                <span>
                                  {day.label} ·{' '}
                                  {formatSlotRange(
                                    slot.startTime,
                                    slot.endTime,
                                  )}
                                </span>
                              </span>
                            ))}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
