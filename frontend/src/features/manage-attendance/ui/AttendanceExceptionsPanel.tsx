import { CalendarRange, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  EmptyState,
  Input,
  ModalCrud,
  Select,
  useToast,
} from '@/shared/ui';
import { useAttendanceCalendarExceptions } from '../model/useAttendanceCalendarExceptions';
import styles from './AttendanceExceptionsPanel.module.css';

const TYPE_LABELS = {
  SUSPENDED: 'Clases suspendidas',
  AUTO_JUSTIFIED: 'Justificación automática',
} as const;

export const AttendanceExceptionsPanel = () => {
  const toast = useToast();
  const model = useAttendanceCalendarExceptions();

  const onSubmit = async () => {
    const result = await model.submit();
    toast.push(result.message, result.ok ? 'success' : 'error');
  };

  const onDelete = async (id: number, title: string) => {
    const row = model.rows.find((r) => r.id === id);
    if (!row) return;
    if (
      !window.confirm(
        `¿Eliminar la excepción «${title}»? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    const result = await model.remove(row);
    toast.push(result.message, result.ok ? 'success' : 'error');
  };

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <label className={styles.field} htmlFor="exception-period">
          <span className={styles.fieldLabel}>Curso lectivo</span>
          <Select
            id="exception-period"
            onChange={(event) => {
              const value = event.target.value;
              model.setPeriodId(value ? Number(value) : null);
            }}
            value={model.periodId ?? ''}
          >
            <option value="">Seleccionar período</option>
            {model.periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name} ({period.status})
              </option>
            ))}
          </Select>
        </label>
        <Button
          disabled={model.periodId == null || model.saving}
          onClick={model.openCreate}
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
          Nueva excepción
        </Button>
      </div>

      {model.error ? <Alert>{model.error}</Alert> : null}

      {model.loading ? (
        <div aria-busy="true" className={styles.loadingRow}>
          <Loader2 aria-hidden="true" className={styles.spinner} size={18} />
          <span>Cargando excepciones…</span>
        </div>
      ) : model.rows.length === 0 ? (
        <EmptyState
          description="Define semanas de exámenes o jornadas institucionales para suspender o justificar la asistencia de forma automática."
          icon={CalendarRange}
          title="Sin excepciones de calendario"
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Alcance</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className={styles.titleCell}>
                      <strong>{row.title}</strong>
                      {row.description ? (
                        <span className={styles.muted}>{row.description}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>{TYPE_LABELS[row.exceptionType]}</td>
                  <td>{row.startDate}</td>
                  <td>{row.endDate}</td>
                  <td>
                    {row.sectionId == null
                      ? 'Todo el período'
                      : `Sección #${row.sectionId}`}
                  </td>
                  <td className={styles.actions}>
                    <Button
                      aria-label={`Editar ${row.title}`}
                      onClick={() => model.openEdit(row)}
                      type="button"
                      variant="secondary"
                    >
                      <Pencil aria-hidden="true" size={14} />
                    </Button>
                    <Button
                      aria-label={`Eliminar ${row.title}`}
                      disabled={model.saving}
                      onClick={() => void onDelete(row.id, row.title)}
                      type="button"
                      variant="secondary"
                    >
                      <Trash2 aria-hidden="true" size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalCrud
        isOpen={model.modalOpen}
        onClose={model.closeModal}
        title={
          model.editing
            ? 'Editar excepción de calendario'
            : 'Nueva excepción de calendario'
        }
      >
        <div className={styles.form}>
          <label className={styles.field} htmlFor="exc-title">
            <span className={styles.fieldLabel}>Título</span>
            <Input
              id="exc-title"
              onChange={(event) =>
                model.setForm({ ...model.form, title: event.target.value })
              }
              value={model.form.title}
            />
          </label>
          <label className={styles.field} htmlFor="exc-type">
            <span className={styles.fieldLabel}>Tipo</span>
            <Select
              id="exc-type"
              onChange={(event) =>
                model.setForm({
                  ...model.form,
                  exceptionType: event.target
                    .value as typeof model.form.exceptionType,
                })
              }
              value={model.form.exceptionType}
            >
              <option value="SUSPENDED">Clases suspendidas</option>
              <option value="AUTO_JUSTIFIED">Justificación automática</option>
            </Select>
          </label>
          <div className={styles.dateRow}>
            <label className={styles.field} htmlFor="exc-start">
              <span className={styles.fieldLabel}>Inicio</span>
              <Input
                id="exc-start"
                onChange={(event) =>
                  model.setForm({
                    ...model.form,
                    startDate: event.target.value,
                  })
                }
                type="date"
                value={model.form.startDate}
              />
            </label>
            <label className={styles.field} htmlFor="exc-end">
              <span className={styles.fieldLabel}>Fin</span>
              <Input
                id="exc-end"
                onChange={(event) =>
                  model.setForm({
                    ...model.form,
                    endDate: event.target.value,
                  })
                }
                type="date"
                value={model.form.endDate}
              />
            </label>
          </div>
          <label className={styles.field} htmlFor="exc-desc">
            <span className={styles.fieldLabel}>Descripción (opcional)</span>
            <Input
              id="exc-desc"
              onChange={(event) =>
                model.setForm({
                  ...model.form,
                  description: event.target.value,
                })
              }
              value={model.form.description}
            />
          </label>
          <div className={styles.formActions}>
            <Button
              disabled={model.saving}
              onClick={model.closeModal}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              disabled={model.saving}
              onClick={() => void onSubmit()}
              type="button"
            >
              {model.saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </ModalCrud>
    </div>
  );
};
