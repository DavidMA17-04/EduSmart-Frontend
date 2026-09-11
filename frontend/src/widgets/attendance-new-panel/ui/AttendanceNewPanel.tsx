import { BookOpen, ClipboardPlus, Layers, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatAttendanceGroupOptionLabel } from '@/features/manage-attendance/model/createAttendanceSessionFlow';
import { useCreateAttendanceSessionFlow } from '@/features/manage-attendance/model/useCreateAttendanceSessionFlow';
import { OfferingCard } from '@/features/manage-attendance/ui/OfferingCard';
import { Alert, Button, EmptyState, Select, useToast } from '@/shared/ui';
import styles from './AttendanceNewPanel.module.css';

export const AttendanceNewPanel = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const flow = useCreateAttendanceSessionFlow();

  const onStart = async () => {
    const result = await flow.startClass();
    if (!result) return;
    if (result.ok) {
      toast.push('Clase iniciada.', 'success');
      navigate(result.path);
      return;
    }
    toast.push(result.error, 'error');
  };

  if (flow.groupsLoading) {
    return (
      <div aria-busy="true" className={styles.panel}>
        <div className={styles.loadingRow}>
          <Loader2 aria-hidden="true" className={styles.spinner} size={20} />
          <span>Cargando grupos…</span>
        </div>
      </div>
    );
  }

  if (flow.groupsError) {
    return (
      <div className={styles.panel}>
        <Alert>{flow.groupsError}</Alert>
        <div className={styles.actions}>
          <Button
            onClick={() => void flow.reloadGroups()}
            type="button"
            variant="secondary"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (flow.groups.length === 0) {
    return (
      <div className={styles.panel}>
        <EmptyState
          description="No encontramos grupos con asignaciones disponibles para registrar asistencia."
          icon={Layers}
          title="No tienes grupos disponibles"
        />
      </div>
    );
  }

  const selectorsDisabled = flow.creating;

  return (
    <div className={styles.panel}>
      <section aria-labelledby="attendance-step-group" className={styles.step}>
        <header className={styles.stepHeader}>
          <span aria-hidden="true" className={styles.stepIndex}>
            1
          </span>
          <div>
            <h2 id="attendance-step-group">Grupo</h2>
            <p>Selecciona el grupo con el que vas a trabajar.</p>
          </div>
        </header>
        <label className={styles.field} htmlFor="attendance-group-select">
          <span className={styles.fieldLabel}>Seleccionar grupo</span>
          <Select
            disabled={selectorsDisabled}
            id="attendance-group-select"
            onChange={(event) => {
              const value = event.target.value;
              flow.selectGroup(value ? Number(value) : null);
            }}
            value={flow.selectedGroupId ?? ''}
          >
            <option value="">Seleccionar grupo</option>
            {flow.groups.map((group) => (
              <option key={group.groupId} value={group.groupId}>
                {formatAttendanceGroupOptionLabel(group)}
              </option>
            ))}
          </Select>
        </label>
      </section>

      <section
        aria-labelledby="attendance-step-offering"
        className={styles.step}
      >
        <header className={styles.stepHeader}>
          <span aria-hidden="true" className={styles.stepIndex}>
            2
          </span>
          <div>
            <h2 id="attendance-step-offering">¿Qué vas a impartir?</h2>
            <p>Elige la materia, taller o especialidad de esta clase.</p>
          </div>
        </header>

        {flow.selectedGroupId == null ? (
          <p className={styles.hint}>Primero selecciona un grupo.</p>
        ) : flow.offeringsLoading ? (
          <div aria-busy="true" className={styles.loadingRow}>
            <Loader2 aria-hidden="true" className={styles.spinner} size={18} />
            <span>Cargando asignaciones…</span>
          </div>
        ) : flow.offeringsError ? (
          <div className={styles.errorBlock}>
            <Alert>{flow.offeringsError}</Alert>
            <Button
              disabled={selectorsDisabled}
              onClick={() => flow.retryOfferings()}
              type="button"
              variant="secondary"
            >
              Reintentar
            </Button>
          </div>
        ) : flow.offerings.length === 0 ? (
          <EmptyState
            description="Actualmente no tienes materias, talleres o especialidades habilitadas para iniciar una clase en este grupo."
            icon={BookOpen}
            title="No hay asignaciones disponibles para este grupo."
          />
        ) : (
          <div
            aria-label="Asignaciones disponibles"
            className={styles.offeringsGrid}
            role="group"
          >
            {flow.offerings.map((offering) => (
              <OfferingCard
                disabled={selectorsDisabled}
                key={offering.teachingAssignmentId}
                offering={offering}
                onSelect={flow.selectOffering}
                selected={
                  flow.selectedTeachingAssignmentId ===
                  offering.teachingAssignmentId
                }
              />
            ))}
          </div>
        )}
      </section>

      {flow.createError ? <Alert>{flow.createError}</Alert> : null}

      <div className={styles.footer}>
        <Button
          disabled={!flow.canStart}
          onClick={() => void onStart()}
          type="button"
        >
          {flow.creating ? (
            <>
              <Loader2 aria-hidden="true" className={styles.spinner} size={16} />
              Iniciando clase…
            </>
          ) : (
            <>
              <ClipboardPlus aria-hidden="true" size={16} />
              Iniciar clase
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
