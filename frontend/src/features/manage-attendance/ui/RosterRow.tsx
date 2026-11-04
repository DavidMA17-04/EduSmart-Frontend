import type {
  AttendanceRegistrationMethod,
  AttendanceRosterStudent,
  AttendanceStatus,
} from '@/entities/attendance';
import type { DraftStatus } from '../model/attendanceDraft';
import { AttendanceStatusControl } from './AttendanceStatusControl';
import styles from './RosterRow.module.css';

type RosterRowProps = {
  student: AttendanceRosterStudent;
  status: DraftStatus;
  dirty: boolean;
  readOnly: boolean;
  onChange: (status: AttendanceStatus) => void;
};

const METHOD_LABEL: Record<AttendanceRegistrationMethod, string> = {
  MANUAL: 'Manual',
  TOKEN: 'Token',
};

export const RosterRow = ({
  student,
  status,
  dirty,
  readOnly,
  onChange,
}: RosterRowProps) => {
  const method = student.attendance?.registrationMethod ?? null;

  return (
    <article className={`${styles.row} ${dirty ? styles.dirty : ''}`}>
      <div className={styles.identity}>
        <strong className={styles.name}>{student.fullName}</strong>
        <span className={styles.nationalId}>{student.nationalId}</span>
        <div className={styles.metaRow}>
          {method ? (
            <span
              className={`${styles.methodBadge} ${
                method === 'TOKEN' ? styles.methodToken : styles.methodManual
              }`}
            >
              {METHOD_LABEL[method]}
            </span>
          ) : (
            <span className={styles.methodBadgeMuted}>Sin registrar</span>
          )}
          {dirty ? (
            <span className={styles.dirtyHint}>
              <span aria-hidden="true" className={styles.dirtyDot} />
              Cambio sin guardar
            </span>
          ) : null}
        </div>
      </div>
      <div className={styles.control}>
        <AttendanceStatusControl
          disabled={readOnly}
          name={`attendance-${student.userId}`}
          onChange={onChange}
          value={status}
        />
      </div>
    </article>
  );
};
