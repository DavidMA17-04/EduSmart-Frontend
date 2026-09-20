import { CalendarRange, ClipboardList, Plus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ATTENDANCE_EXCEPTIONS_PATH,
  ATTENDANCE_JUSTIFICATIONS_PATH,
  ATTENDANCE_NEW_PATH,
  canCreateAttendanceClass,
  canManageAttendanceExceptions,
} from '@/features/manage-attendance';
import { AttendanceHubPanel } from '@/widgets/attendance-hub-panel';
import { sessionHasPermission } from '@/shared/auth';
import { Button, PageHeader } from '@/shared/ui';
import styles from './AttendanceHomePage.module.css';

export const AttendanceHomePage = () => {
  const navigate = useNavigate();
  const canCreate = canCreateAttendanceClass(sessionHasPermission);
  const canManageExceptions =
    canManageAttendanceExceptions(sessionHasPermission);

  return (
    <section className={styles.page}>
      <PageHeader
        back={{ label: 'Volver al panel', to: '/admin' }}
        breadcrumbs={[{ label: 'Asistencias' }]}
        icon={UserCheck}
        primaryAction={
          <div className={styles.headerActions}>
            {canManageExceptions ? (
              <Button
                onClick={() => navigate(ATTENDANCE_EXCEPTIONS_PATH)}
                type="button"
                variant="secondary"
              >
                <CalendarRange aria-hidden="true" size={16} />
                Excepciones
              </Button>
            ) : null}
            <Button
              onClick={() => navigate(ATTENDANCE_JUSTIFICATIONS_PATH)}
              type="button"
              variant="secondary"
            >
              <ClipboardList aria-hidden="true" size={16} />
              Justificaciones
            </Button>
            {canCreate ? (
              <Button
                onClick={() => navigate(ATTENDANCE_NEW_PATH)}
                type="button"
              >
                <Plus aria-hidden="true" size={16} />
                Nueva clase
              </Button>
            ) : null}
          </div>
        }
        subtitle="Registra y gestiona la asistencia de tus clases."
        title="Asistencias"
      />
      <AttendanceHubPanel />
    </section>
  );
};
