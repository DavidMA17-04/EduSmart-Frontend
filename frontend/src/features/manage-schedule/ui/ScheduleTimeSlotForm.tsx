import { Alert, Button, Checkbox, Input, Select } from '@/shared/ui';
import type { TimeSlotDialogMode } from '../model/useScheduleTimeSlotsPanel';
import type { TimeSlotFormValues } from '../model/timeSlotFormUtils';
import styles from './ScheduleTimeSlotForm.module.css';

type ScheduleTimeSlotFormProps = {
  dialogMode: TimeSlotDialogMode;
  form: TimeSlotFormValues;
  isSaving: boolean;
  mutationError: string | null;
  onChange: (patch: Partial<TimeSlotFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ScheduleTimeSlotForm({
  dialogMode,
  form,
  isSaving,
  mutationError,
  onChange,
  onSubmit,
  onCancel,
}: ScheduleTimeSlotFormProps) {
  const isClass = form.slotType === 'CLASS';

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {mutationError ? <Alert>{mutationError}</Alert> : null}

      <label className={styles.field}>
        <span>Nombre</span>
        <Input
          aria-label="Nombre del bloque"
          disabled={isSaving}
          onChange={(e) => onChange({ name: e.target.value })}
          required
          value={form.name}
        />
      </label>

      <label className={styles.field}>
        <span>Tipo</span>
        <Select
          aria-label="Tipo de bloque"
          disabled={isSaving}
          onChange={(e) =>
            onChange({
              slotType: e.target.value as TimeSlotFormValues['slotType'],
            })
          }
          required
          value={form.slotType}
        >
          <option value="CLASS">Clase</option>
          <option value="BREAK">Receso</option>
          <option value="LUNCH">Almuerzo</option>
        </Select>
      </label>

      {isClass ? (
        <label className={styles.field}>
          <span>N.º de lección (opcional)</span>
          <Input
            aria-label="Número de lección"
            disabled={isSaving}
            inputMode="numeric"
            min={1}
            onChange={(e) => onChange({ lessonNumber: e.target.value })}
            placeholder="Vacío = sin número"
            type="number"
            value={form.lessonNumber}
          />
        </label>
      ) : (
        <p className={styles.hint}>
          Los bloques de receso y almuerzo no usan número de lección.
        </p>
      )}

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Hora inicio</span>
          <Input
            aria-label="Hora de inicio"
            disabled={isSaving}
            onChange={(e) => onChange({ startTime: e.target.value })}
            required
            type="time"
            value={form.startTime}
          />
        </label>
        <label className={styles.field}>
          <span>Hora fin</span>
          <Input
            aria-label="Hora de fin"
            disabled={isSaving}
            onChange={(e) => onChange({ endTime: e.target.value })}
            required
            type="time"
            value={form.endTime}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>Orden</span>
        <Input
          aria-label="Orden de visualización"
          disabled={isSaving}
          inputMode="numeric"
          min={1}
          onChange={(e) => onChange({ displayOrder: e.target.value })}
          required
          type="number"
          value={form.displayOrder}
        />
      </label>

      <label className={styles.check}>
        <Checkbox
          checked={form.isActive}
          disabled={isSaving}
          onChange={(e) => onChange({ isActive: e.target.checked })}
        />
        <span>Activo</span>
      </label>

      <div className={styles.actions}>
        <Button disabled={isSaving} type="submit" variant="primary">
          {isSaving
            ? 'Guardando…'
            : dialogMode === 'create'
              ? 'Crear bloque'
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
