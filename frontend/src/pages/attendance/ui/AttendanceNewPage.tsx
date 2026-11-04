import { ClipboardPlus } from 'lucide-react';
import { ATTENDANCE_HOME_PATH } from '@/features/manage-attendance';
import { AttendanceNewPanel } from '@/widgets/attendance-new-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceNewPage.module.css';

export const AttendanceNewPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a Asistencias', to: ATTENDANCE_HOME_PATH }}
      breadcrumbs={[
        { label: 'Asistencias', to: ATTENDANCE_HOME_PATH },
        { label: 'Nueva clase' },
      ]}
      icon={ClipboardPlus}
      subtitle="Selecciona el grupo y lo que vas a impartir para iniciar el registro de asistencia."
      title="Nueva clase"
    />
    <AttendanceNewPanel />
  </section>
);
