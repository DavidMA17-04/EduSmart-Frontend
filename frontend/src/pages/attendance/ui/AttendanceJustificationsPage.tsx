import { ClipboardList } from 'lucide-react';
import {
  ATTENDANCE_HOME_PATH,
  JustificationsInboxPanel,
} from '@/features/manage-attendance';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceHomePage.module.css';

export const AttendanceJustificationsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a asistencias', to: ATTENDANCE_HOME_PATH }}
      breadcrumbs={[
        { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
        { label: 'Justificaciones' },
      ]}
      icon={ClipboardList}
      subtitle="Bandeja de solicitudes y dictamen de ausencias (WF-39 / WF-40)."
      title="Justificaciones"
    />
    <JustificationsInboxPanel />
  </section>
);
