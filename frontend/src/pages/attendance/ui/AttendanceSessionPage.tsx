import { UserCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  ATTENDANCE_HOME_PATH,
  parseAttendanceSessionId,
} from '@/features/manage-attendance';
import { AttendanceSessionPanel } from '@/widgets/attendance-session-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceSessionPage.module.css';

export const AttendanceSessionPage = () => {
  const { sessionId: rawSessionId } = useParams<{ sessionId: string }>();
  const sessionId = parseAttendanceSessionId(rawSessionId);

  return (
    <section className={styles.page}>
      <PageHeader
        back={{ label: 'Volver a Asistencias', to: ATTENDANCE_HOME_PATH }}
        breadcrumbs={[
          { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
          { label: 'Sesión' },
        ]}
        icon={UserCheck}
        subtitle="Consulta y registra el estado de asistencia de los estudiantes."
        title="Sesión de asistencia"
      />
      <AttendanceSessionPanel sessionId={sessionId} />
    </section>
  );
};
