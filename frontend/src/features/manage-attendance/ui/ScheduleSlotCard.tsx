import { Check } from 'lucide-react';
import type { AttendanceScheduleOccurrence } from '@/entities/attendance';
import { Badge } from '@/shared/ui';
import type { NewAttendanceSlotAction } from '../model/useCreateAttendanceSessionFlow';
import styles from './ScheduleSlotCard.module.css';

function formatTimeRange(start: string, end: string): string {
  const trim = (t: string) => t.slice(0, 5);
  return `${trim(start)} – ${trim(end)}`;
}

const ACTION_HINT: Record<NewAttendanceSlotAction, string> = {
  take: 'Tomar asistencia',
  continue: 'Sesión abierta — continuar',
  view: 'Sesión cerrada — ver',
  blocked: 'No disponible',
};

type Props = {
  occurrence: AttendanceScheduleOccurrence;
  action: NewAttendanceSlotAction;
  selected: boolean;
  disabled?: boolean;
  onSelect: (occurrence: AttendanceScheduleOccurrence) => void;
};

export function ScheduleSlotCard({
  occurrence,
  action,
  selected,
  disabled = false,
  onSelect,
}: Props) {
  const isBlocked = action === 'blocked';
  return (
    <button
      aria-pressed={selected}
      className={`${styles.card} ${selected ? styles.selected : ''} ${
        isBlocked ? styles.blocked : ''
      }`}
      disabled={disabled || isBlocked}
      onClick={() => onSelect(occurrence)}
      type="button"
    >
      <span className={styles.time}>
        {formatTimeRange(occurrence.startTime, occurrence.endTime)}
      </span>
      <span className={styles.main}>
        <strong className={styles.name}>
          {occurrence.offeringName ?? 'Clase'}
        </strong>
        <span className={styles.meta}>
          <Badge tone="neutral">{occurrence.labelKind ?? 'Clase'}</Badge>
          <span className={styles.hint}>{ACTION_HINT[action]}</span>
        </span>
      </span>
      {selected && !isBlocked ? (
        <span aria-hidden="true" className={styles.check}>
          <Check size={18} strokeWidth={2.5} />
        </span>
      ) : (
        <span aria-hidden="true" className={styles.checkPlaceholder} />
      )}
    </button>
  );
}
