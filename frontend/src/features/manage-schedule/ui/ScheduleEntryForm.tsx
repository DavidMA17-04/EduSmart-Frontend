import { Link } from 'react-router-dom';
import type { TeachingAssignment } from '@/entities/teaching-assignment';
import { Alert, Button, Select } from '@/shared/ui';
import type { ScheduleDialogMode, ScheduleEntryFormValues } from '../model/useSchedulePanel';
import styles from './ScheduleEntryForm.module.css';

type ScheduleEntryFormProps = {
  dialogMode: ScheduleDialogMode;
  form: ScheduleEntryFormValues;
  contextDayLabel: string;
  contextSlotLabel: string;
  teachingAssignments: TeachingAssignment[];
  optionLabel: (ta: TeachingAssignment) => string;
  isSaving: boolean;
  mutationError: string | null;
  tasLoading: boolean;
  tasError: string | null;
  canLinkTeachingAssignments: boolean;
  onChange: (patch: Partial<ScheduleEntryFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ScheduleEntryForm({
  dialogMode,
  form,
  contextDayLabel,
  contextSlotLabel,
  teachingAssignments,
  optionLabel,
  isSaving,
  mutationError,
  tasLoading,
  tasError,
  canLinkTeachingAssignments,
  onChange,
  onSubmit,
  onCancel,
}: ScheduleEntryFormProps) {
  const showEmptyTas =
    !tasLoading && !tasError && teachingAssignments.length === 0;

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {(contextDayLabel || contextSlotLabel) && (
        <p className={styles.context}>
          {contextDayLabel}
          {contextDayLabel && contextSlotLabel ? ' · ' : ''}
          {contextSlotLabel}
        </p>
      )}

      {mutationError ? <Alert>{mutationError}</Alert> : null}
      {tasError ? <Alert>{tasError}</Alert> : null}

      <label className={styles.field}>
        <span>Asignación académica</span>
        <Select
          aria-label="Asignación académica"
          disabled={isSaving || tasLoading}
          onChange={(e) => onChange({ teachingAssignmentId: e.target.value })}
          required
          value={form.teachingAssignmentId}
        >
          <option value="">
            {tasLoading ? 'Cargando…' : 'Seleccione una asignación…'}
          </option>
          {teachingAssignments.map((ta) => (
            <option key={ta.id} value={ta.id}>
              {optionLabel(ta)}
            </option>
          ))}
        </Select>
      </label>

      {showEmptyTas ? (
        <p className={styles.hint}>
          No hay asignaciones académicas disponibles.
          {canLinkTeachingAssignments ? (
            <>
              {' '}
              Cree una en{' '}
              <Link to="/admin/teaching-assignments">
                Asignaciones académicas
              </Link>
              .
            </>
          ) : null}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button disabled={isSaving} type="submit" variant="primary">
          {isSaving
            ? 'Guardando…'
            : dialogMode === 'create'
              ? 'Asignar'
              : 'Guardar'}
        </Button>
        <Button
          disabled={isSaving}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
