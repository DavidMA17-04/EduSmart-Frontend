import { History } from 'lucide-react';
import { ATTENDANCE_HOME_PATH } from '@/features/manage-attendance';
import { getSessionUser } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import { houseHome, resolveHouse } from '@/widgets/app-shell/model/territory';
import { AttendanceHistoryPanel } from '@/widgets/attendance-history-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceHistoryPage.module.css';

function historyBackPath(): string {
  const house = resolveHouse(getSessionUser()?.roles);
  if (house === 'student' || house === 'guardian') return houseHome(house);
  return staffPathForSession(ATTENDANCE_HOME_PATH);
}

export const AttendanceHistoryPage = () => {
  const backTo = historyBackPath();
  return (
    <section className={styles.page}>
      <PageHeader
        back={{ label: 'Volver', to: backTo }}
        breadcrumbs={[
          { label: 'Asistencias', to: backTo },
          { label: 'Historial de asistencia' },
        ]}
        icon={History}
        subtitle="Consulta el registro histórico de asistencias por curso y lección."
        title="Historial de asistencia"
      />
      <AttendanceHistoryPanel />
    </section>
  );
};
