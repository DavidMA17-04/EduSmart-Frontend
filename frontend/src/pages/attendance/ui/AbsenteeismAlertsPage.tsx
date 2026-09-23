import { AlertTriangle } from 'lucide-react';
import { ATTENDANCE_HOME_PATH } from '@/features/manage-attendance';
import { AbsenteeismAlertsPanel } from '@/widgets/absenteeism-alerts-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AbsenteeismAlertsPage.module.css';

export const AbsenteeismAlertsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a Asistencias', to: ATTENDANCE_HOME_PATH }}
      breadcrumbs={[
        { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
        { label: 'Alertas de ausentismo' },
      ]}
      icon={AlertTriangle}
      subtitle="Monitorea estudiantes con ausencias recurrentes y recibe alertas preventivas."
      title="Alertas de ausentismo"
    />
    <AbsenteeismAlertsPanel />
  </section>
);
