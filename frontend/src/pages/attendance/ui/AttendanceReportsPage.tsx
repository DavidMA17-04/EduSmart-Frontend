import { FileBarChart } from 'lucide-react';
import { ATTENDANCE_HOME_PATH } from '@/features/manage-attendance';
import { AttendanceReportsPanel } from '@/widgets/attendance-reports-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceHistoryPage.module.css';

export const AttendanceReportsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a Asistencias', to: ATTENDANCE_HOME_PATH }}
      breadcrumbs={[
        { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
        { label: 'Reportes' },
      ]}
      icon={FileBarChart}
      subtitle="Filtra por período, grupo y asignatura; previsualiza indicadores y descarga PDF o Excel institucionales."
      title="Reportes de asistencia"
    />
    <AttendanceReportsPanel />
  </section>
);
