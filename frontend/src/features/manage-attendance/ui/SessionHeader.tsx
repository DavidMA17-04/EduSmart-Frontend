import type { AttendanceSessionDetail } from '@/entities/attendance';
import { gradeLevelLabel } from '../model/createAttendanceSessionFlow';
import {
  formatSessionDateLabel,
  sessionStatusLabel,
} from '../model/attendanceDraft';
import { Badge } from '@/shared/ui';
import styles from './SessionHeader.module.css';

type SessionHeaderProps = {
  session: AttendanceSessionDetail;
};

export const SessionHeader = ({ session }: SessionHeaderProps) => {
  const closed = session.status === 'CLOSED';

  return (
    <header className={styles.header}>
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{session.offering.name}</h2>
          <Badge tone={closed ? 'neutral' : 'success'}>
            {sessionStatusLabel(session.status)}
          </Badge>
        </div>
        <p className={styles.meta}>
          Grupo {session.group.name} · {gradeLevelLabel(session.group.gradeLevel)}
        </p>
        <p className={styles.metaSecondary}>
          {session.offering.labelKind} · {formatSessionDateLabel(session.sessionDate)}
        </p>
      </div>
    </header>
  );
};
