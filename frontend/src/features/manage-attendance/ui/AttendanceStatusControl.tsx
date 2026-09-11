import type { AttendanceStatus } from '@/entities/attendance';
import {
  ATTENDANCE_STATUS_OPTIONS,
  type DraftStatus,
} from '../model/attendanceDraft';
import styles from './AttendanceStatusControl.module.css';

type AttendanceStatusControlProps = {
  value: DraftStatus;
  disabled?: boolean;
  name: string;
  onChange: (status: AttendanceStatus) => void;
};

const toneClass: Record<AttendanceStatus, string> = {
  PRESENT: styles.present,
  ABSENT: styles.absent,
  LATE: styles.late,
};

export const AttendanceStatusControl = ({
  value,
  disabled = false,
  name,
  onChange,
}: AttendanceStatusControlProps) => (
  <div
    aria-label="Estado de asistencia"
    className={styles.group}
    role="radiogroup"
  >
    {ATTENDANCE_STATUS_OPTIONS.map((option) => {
      const checked = value === option.value;
      return (
        <button
          aria-checked={checked}
          className={`${styles.option} ${toneClass[option.value]} ${
            checked ? styles.checked : ''
          }`}
          disabled={disabled}
          key={option.value}
          name={name}
          onClick={() => onChange(option.value)}
          role="radio"
          type="button"
        >
          <span aria-hidden="true" className={styles.marker}>
            {checked ? '●' : '○'}
          </span>
          <span>{option.label}</span>
        </button>
      );
    })}
  </div>
);
