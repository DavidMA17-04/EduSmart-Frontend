import { CalendarRange } from 'lucide-react';
import {
  ATTENDANCE_HOME_PATH,
  AttendanceExceptionsPanel,
} from '@/features/manage-attendance';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceHomePage.module.css';

export const AttendanceExceptionsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a asistencias', to: ATTENDANCE_HOME_PATH }}
      breadcrumbs={[
        { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
        { label: 'Excepciones de calendario' },
      ]}
      icon={CalendarRange}
      subtitle="Configura semanas de exámenes y jornadas institucionales (suspensión o justificación automática)."
      title="Excepciones de calendario"
    />
    <AttendanceExceptionsPanel />
  </section>
);
