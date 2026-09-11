import type { AttendanceRosterStudent, AttendanceStatus } from '@/entities/attendance';
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

export const RosterRow = ({
  student,
  status,
  dirty,
  readOnly,
  onChange,
}: RosterRowProps) => (
  <article className={`${styles.row} ${dirty ? styles.dirty : ''}`}>
    <div className={styles.identity}>
      <strong className={styles.name}>{student.fullName}</strong>
      <span className={styles.nationalId}>{student.nationalId}</span>
      {dirty ? (
        <span className={styles.dirtyHint}>
          <span aria-hidden="true" className={styles.dirtyDot} />
          Cambio sin guardar
        </span>
      ) : null}
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
