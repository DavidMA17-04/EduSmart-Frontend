import {
  AlertTriangle,
  FileBarChart,
  History,
  ListOrdered,
  Plus,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ATTENDANCE_ALERTS_PATH,
  ATTENDANCE_HISTORY_PATH,
  ATTENDANCE_NEW_PATH,
  ATTENDANCE_REPORTS_PATH,
  canCreateAttendanceClass,
  canViewAttendanceHistory,
} from '@/features/manage-attendance';
import { sessionHasPermission } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import { Button } from '@/shared/ui';
import styles from './AttendanceHubPanel.module.css';

const FLOW_STEPS = [
  'Selecciona un grupo',
  'Elige qué vas a impartir',
  'Registra la asistencia',
] as const;

export const AttendanceHubPanel = () => {
  const navigate = useNavigate();
  const canCreate = canCreateAttendanceClass(sessionHasPermission);
  const canHistory = canViewAttendanceHistory(sessionHasPermission);
  const canAlerts = sessionHasPermission('attendance.view');
  const canReports = sessionHasPermission('attendance.view');

  return (
    <div className={styles.layout}>
      <article className={styles.intro}>
        <div className={styles.introIcon} aria-hidden="true">
          <UserCheck size={28} />
        </div>
        <div className={styles.introBody}>
          <h2 className={styles.introTitle}>Toma de asistencia por clase</h2>
          <p className={styles.introText}>
            Abre una sesión, genera el código para que los estudiantes se
            registren, o marca presente/ausente/tardía/justificada de forma
            manual en la lista.
          </p>
          <div className={styles.introActions}>
            {canCreate ? (
              <Button
                onClick={() => navigate(staffPathForSession(ATTENDANCE_NEW_PATH))}
                type="button"
              >
                <Plus aria-hidden="true" size={16} />
                Nueva clase
              </Button>
            ) : (
              <p className={styles.viewOnlyHint}>
                Puedes consultar las sesiones de asistencia a las que tengas
                acceso.
              </p>
            )}
            {canHistory ? (
              <Button
                onClick={() => navigate(staffPathForSession(ATTENDANCE_HISTORY_PATH))}
                type="button"
                variant="secondary"
              >
                <History aria-hidden="true" size={16} />
                Ver historial
              </Button>
            ) : null}
            {canAlerts ? (
              <Button
                onClick={() => navigate(staffPathForSession(ATTENDANCE_ALERTS_PATH))}
                type="button"
                variant="secondary"
              >
                <AlertTriangle aria-hidden="true" size={16} />
                Alertas de ausentismo
              </Button>
            ) : null}
            {canReports ? (
              <Button
                onClick={() => navigate(staffPathForSession(ATTENDANCE_REPORTS_PATH))}
                type="button"
                variant="secondary"
              >
                <FileBarChart aria-hidden="true" size={16} />
                Reportes
              </Button>
            ) : null}
          </div>
        </div>
      </article>

      <aside className={styles.flow} aria-labelledby="attendance-flow-title">
        <div className={styles.flowHeader}>
          <ListOrdered aria-hidden="true" size={18} />
          <h3 id="attendance-flow-title">Cómo funciona</h3>
        </div>
        <ol className={styles.steps}>
          {FLOW_STEPS.map((label, index) => (
            <li className={styles.step} key={label}>
              <span aria-hidden="true" className={styles.stepIndex}>
                {index + 1}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
};
