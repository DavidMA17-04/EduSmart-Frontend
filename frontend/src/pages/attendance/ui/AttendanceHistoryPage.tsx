import { History } from 'lucide-react';
import { ATTENDANCE_HOME_PATH } from '@/features/manage-attendance';
import { AttendanceHistoryPanel } from '@/widgets/attendance-history-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceHistoryPage.module.css';

export const AttendanceHistoryPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver', to: ATTENDANCE_HOME_PATH }}
      breadcrumbs={[
        { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
        { label: 'Historial de asistencia' },
      ]}
      icon={History}
      subtitle="Consulta el registro histórico de asistencias por curso y lección."
      title="Historial de asistencia"
    />
    <AttendanceHistoryPanel />
  </section>
);
