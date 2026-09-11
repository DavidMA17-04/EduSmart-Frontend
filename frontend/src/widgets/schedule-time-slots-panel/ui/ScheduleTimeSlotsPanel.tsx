import { CalendarClock } from 'lucide-react';
import type { ScheduleTimeSlot } from '@/entities/schedule';
import {
  formatScheduleTime,
  formatSlotRange,
  ScheduleTimeSlotForm,
  slotTypeLabel,
  useScheduleTimeSlotsPanel,
} from '@/features/manage-schedule';
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ModalCrud,
} from '@/shared/ui';
import styles from './ScheduleTimeSlotsPanel.module.css';

type ScheduleTimeSlotsPanelProps = {
  onSlotsChanged?: () => void | Promise<void>;
  onClose?: () => void;
};

function SlotTypeBadge({ slot }: { slot: ScheduleTimeSlot }) {
  const tone =
    slot.slotType === 'CLASS'
      ? 'success'
      : slot.slotType === 'BREAK'
        ? 'neutral'
        : 'warning';
  return <Badge tone={tone}>{slotTypeLabel(slot.slotType)}</Badge>;
}

export const ScheduleTimeSlotsPanel = ({
  onSlotsChanged,
  onClose,
}: ScheduleTimeSlotsPanelProps) => {
  const model = useScheduleTimeSlotsPanel({ onSlotsChanged });

  return (
    <section className={styles.layout}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Bloques horarios</h2>
          <p className={styles.subtitle}>
            Define la jornada institucional (clases, recreos y almuerzo).
          </p>
        </div>
        <div className={styles.headerActions}>
          {model.canEdit ? (
            <Button onClick={model.openCreate} type="button" variant="primary">
              Nuevo bloque
            </Button>
          ) : null}
          {onClose ? (
            <Button onClick={onClose} type="button" variant="secondary">
              Cerrar
            </Button>
          ) : null}
        </div>
      </header>

      {model.error ? (
        <Alert>
          No se pudo cargar la configuración de bloques horarios.
          {model.error ? ` ${model.error}` : ''}
        </Alert>
      ) : null}

      {model.isLoading ? (
        <p className={styles.status}>Cargando bloques…</p>
      ) : null}

      {!model.isLoading && !model.error && model.rows.length === 0 ? (
        <EmptyState
          description="Cree el primer bloque para armar la jornada."
          icon={CalendarClock}
          title="Aún no hay bloques horarios configurados."
        />
      ) : null}

      {!model.isLoading && model.rows.length > 0 ? (
        <>
          <div className={styles.desktopTableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Lección</th>
                  <th>Nombre</th>
                  <th>Horario</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  {model.canEdit ? <th>Acciones</th> : null}
                </tr>
              </thead>
              <tbody>
                {model.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.displayOrder}</td>
                    <td>
                      {row.lessonNumber != null ? row.lessonNumber : '—'}
                    </td>
                    <td>{row.name}</td>
                    <td>
                      {formatScheduleTime(row.startTime)}–
                      {formatScheduleTime(row.endTime)}
                    </td>
                    <td>
                      <SlotTypeBadge slot={row} />
                    </td>
                    <td>
                      <Badge tone={row.isActive ? 'success' : 'neutral'}>
                        {row.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    {model.canEdit ? (
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.linkBtn}
                            onClick={() => model.openEdit(row)}
                            type="button"
                          >
                            Editar
                          </button>
                          {row.isActive ? (
                            <button
                              className={styles.linkBtn}
                              onClick={() => model.requestDeactivate(row.id)}
                              type="button"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              className={styles.linkBtn}
                              onClick={() => model.requestActivate(row.id)}
                              type="button"
                            >
                              Activar
                            </button>
                          )}
                          <button
                            className={styles.linkBtnDanger}
                            onClick={() => model.requestDelete(row.id)}
                            type="button"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className={styles.mobileList}>
            {model.rows.map((row) => (
              <li className={styles.card} key={row.id}>
                <div className={styles.cardTop}>
                  <strong>{row.name}</strong>
                  <SlotTypeBadge slot={row} />
                </div>
                <p className={styles.meta}>
                  Orden {row.displayOrder}
                  {' · '}
                  Lección{' '}
                  {row.lessonNumber != null ? row.lessonNumber : '—'}
                  {' · '}
                  {formatSlotRange(row.startTime, row.endTime)}
                </p>
                <Badge tone={row.isActive ? 'success' : 'neutral'}>
                  {row.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
                {model.canEdit ? (
                  <div className={styles.actions}>
                    <button
                      className={styles.linkBtn}
                      onClick={() => model.openEdit(row)}
                      type="button"
                    >
                      Editar
                    </button>
                    {row.isActive ? (
                      <button
                        className={styles.linkBtn}
                        onClick={() => model.requestDeactivate(row.id)}
                        type="button"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className={styles.linkBtn}
                        onClick={() => model.requestActivate(row.id)}
                        type="button"
                      >
                        Activar
                      </button>
                    )}
                    <button
                      className={styles.linkBtnDanger}
                      onClick={() => model.requestDelete(row.id)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <ModalCrud
        isOpen={model.dialogOpen}
        onClose={model.closeDialog}
        title={
          model.dialogMode === 'create' ? 'Nuevo bloque' : 'Editar bloque'
        }
      >
        <ScheduleTimeSlotForm
          dialogMode={model.dialogMode}
          form={model.form}
          isSaving={model.isSaving}
          mutationError={model.mutationError}
          onCancel={model.closeDialog}
          onChange={model.patchForm}
          onSubmit={model.submit}
        />
      </ModalCrud>

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Desactivar"
        isOpen={model.deactivateOpen}
        isSubmitting={model.isMutatingStatus}
        message="¿Desactivar este bloque?"
        onCancel={model.cancelDeactivate}
        onConfirm={model.confirmDeactivate}
        secondary="Las clases existentes se conservarán, pero no podrán crearse nuevas asignaciones en este bloque."
        title="Desactivar bloque"
        tone="warning"
      />

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Activar"
        isOpen={model.activateOpen}
        isSubmitting={model.isMutatingStatus}
        message="¿Activar este bloque?"
        onCancel={model.cancelActivate}
        onConfirm={model.confirmActivate}
        secondary="El backend validará solapes, orden y número de lección."
        title="Activar bloque"
        tone="primary"
      />

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        isOpen={model.deleteOpen}
        isSubmitting={model.isMutatingStatus}
        message="¿Eliminar este bloque horario?"
        onCancel={model.cancelDelete}
        onConfirm={model.confirmDelete}
        secondary="Solo puede eliminarse si no está siendo utilizado por ninguna clase."
        title="Eliminar bloque"
        tone="danger"
      />
    </section>
  );
};
