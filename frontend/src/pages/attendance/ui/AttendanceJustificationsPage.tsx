import { ClipboardList } from 'lucide-react';
import {
  ATTENDANCE_HOME_PATH,
  JustificationsInboxPanel,
} from '@/features/manage-attendance';
import { getSessionUser } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import { houseHome, resolveHouse } from '@/widgets/app-shell/model/territory';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceHomePage.module.css';

function justificationsBackPath(): string {
  const house = resolveHouse(getSessionUser()?.roles);
  if (house === 'student' || house === 'guardian') return houseHome(house);
  return staffPathForSession(ATTENDANCE_HOME_PATH);
}

export const AttendanceJustificationsPage = () => {
  const house = resolveHouse(getSessionUser()?.roles);
  const isOwnScope = house === 'student' || house === 'guardian';
  const backTo = justificationsBackPath();
  return (
    <section className={styles.page}>
      <PageHeader
        back={{
          label: isOwnScope ? 'Volver al inicio' : 'Volver a asistencias',
          to: backTo,
        }}
        breadcrumbs={[
          { label: isOwnScope ? 'Inicio' : 'Asistencias', to: backTo },
          { label: 'Justificaciones' },
        ]}
        icon={ClipboardList}
        subtitle={
          isOwnScope
            ? 'Consulta y envía justificaciones de tus ausencias.'
            : 'Bandeja de solicitudes y dictamen de ausencias (WF-39 / WF-40).'
        }
        title="Justificaciones"
      />
      <JustificationsInboxPanel />
    </section>
  );
};
