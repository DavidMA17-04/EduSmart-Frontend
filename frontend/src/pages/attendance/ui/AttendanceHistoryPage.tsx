import { History } from 'lucide-react';
import { ATTENDANCE_HOME_PATH } from '@/features/manage-attendance';
import { AttendanceHistoryPanel } from '@/widgets/attendance-history-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceHistoryPage.module.css';

export const AttendanceHistoryPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a Asistencias', to: ATTENDANCE_HOME_PATH }}
      breadcrumbs={[
        { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
        { label: 'Historial' },
      ]}
      icon={History}
      subtitle="Consulta y filtra registros de asistencia por fecha, grupo, estado y método."
      title="Historial de asistencia"
    />
    <AttendanceHistoryPanel />
  </section>
);
