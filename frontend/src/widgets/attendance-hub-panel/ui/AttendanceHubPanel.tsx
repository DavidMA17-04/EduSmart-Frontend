import { ListOrdered, Plus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ATTENDANCE_NEW_PATH,
  canCreateAttendanceClass,
} from '@/features/manage-attendance';
import { sessionHasPermission } from '@/shared/auth';
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

  return (
    <div className={styles.layout}>
      <article className={styles.intro}>
        <div className={styles.introIcon} aria-hidden="true">
          <UserCheck size={28} />
        </div>
        <div className={styles.introBody}>
          <h2 className={styles.introTitle}>Toma de asistencia por clase</h2>
          <p className={styles.introText}>
            Abre una sesión para un grupo y la materia, taller o especialidad que
            impartes. Marca presente, ausente o tardía y cierra la sesión cuando
            termines.
          </p>
          {canCreate ? (
            <Button
              onClick={() => navigate(ATTENDANCE_NEW_PATH)}
              type="button"
            >
              <Plus aria-hidden="true" size={16} />
              Nueva clase
            </Button>
          ) : (
            <p className={styles.viewOnlyHint}>
              Puedes consultar las sesiones de asistencia a las que tengas acceso.
            </p>
          )}
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
