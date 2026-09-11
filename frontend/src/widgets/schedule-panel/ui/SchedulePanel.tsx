import { useCallback, useState } from 'react';
import { CalendarClock, Link2, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import {
  formatSlotRange,
  nonClassSlotLabel,
  SCHEDULE_WEEKDAYS,
  ScheduleEntryForm,
  useSchedulePanel,
} from '@/features/manage-schedule';
import { ScheduleTimeSlotsPanel } from '@/widgets/schedule-time-slots-panel';
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ModalCrud,
  SegmentedTabs,
  Select,
} from '@/shared/ui';
import styles from './SchedulePanel.module.css';

function EntryCard({
  entry,
  canEdit,
  showTeacher,
  showGroup,
  onEdit,
  onRemove,
}: {
  entry: ScheduleEntry;
  canEdit: boolean;
  showTeacher: boolean;
  showGroup: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const ta = entry.teachingAssignment;
  return (
    <article className={styles.entryCard}>
      <div className={styles.entryMain}>
        <strong className={styles.offeringName}>{ta.offering.name}</strong>
        <Badge tone="neutral">{ta.offering.labelKind}</Badge>
        {showGroup ? (
          <span className={styles.meta}>{ta.group.name}</span>
        ) : null}
        {showTeacher ? (
          <span className={styles.meta}>{ta.teacher.name}</span>
        ) : null}
      </div>
      {canEdit ? (
        <div className={styles.entryActions}>
          <button className={styles.linkBtn} onClick={onEdit} type="button">
            Editar
          </button>
          <button
            className={styles.linkBtnDanger}
            onClick={onRemove}
            type="button"
          >
            Quitar
          </button>
        </div>
      ) : null}
    </article>
  );
}

function ClassCellBody({
  entries,
  canEdit,
  canAssign,
  filterTeacherId,
  filterGroupId,
  onAssign,
  onEdit,
  onRemove,
}: {
  entries: ScheduleEntry[];
  canEdit: boolean;
  canAssign: boolean;
  filterTeacherId: string;
  filterGroupId: string;
  onAssign: () => void;
  onEdit: (entry: ScheduleEntry) => void;
  onRemove: (entryId: number) => void;
}) {
  const showTeacher = !filterTeacherId;
  const showGroup = !filterGroupId;

  if (entries.length === 0) {
    if (!canAssign) return <span className={styles.emptyCell}>—</span>;
    return (
      <button className={styles.assignBtn} onClick={onAssign} type="button">
        + Asignar
      </button>
    );
  }

  return (
    <div className={styles.entryStack}>
      {entries.map((entry) => (
        <EntryCard
          key={entry.entryId}
          canEdit={canEdit}
          entry={entry}
          onEdit={() => onEdit(entry)}
          onRemove={() => onRemove(entry.entryId)}
          showGroup={showGroup}
          showTeacher={showTeacher}
        />
      ))}
      {canAssign ? (
        <button className={styles.assignBtn} onClick={onAssign} type="button">
          + Asignar
        </button>
      ) : null}
    </div>
  );
}

function slotHeaderLabel(slot: ScheduleTimeSlot): string {
  if (slot.slotType === 'BREAK' || slot.slotType === 'LUNCH') {
    return nonClassSlotLabel(slot.slotType, slot.name);
  }
  return formatSlotRange(slot.startTime, slot.endTime);
}

export const SchedulePanel = () => {
  const model = useSchedulePanel();
  const navigate = useNavigate();
  const [configOpen, setConfigOpen] = useState(false);
  const dayTabs = SCHEDULE_WEEKDAYS.map((d) => ({
    id: String(d.dayOfWeek),
    label: d.label,
  }));

  const blockingError = model.catalogError || model.slotsError || null;
  const matrixSlots = model.matrixSlots;

  const handleSlotsChanged = useCallback(async () => {
    await model.reloadSlots();
  }, [model.reloadSlots]);

  return (
    <section className={styles.layout}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Select
            aria-label="Período académico"
            onChange={(e) => model.setFilterPeriodId(e.target.value)}
            value={model.filterPeriodId}
          >
            <option value="">Período: seleccionar…</option>
            {model.periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.status === 'ACTIVE' ? ' (activo)' : ''}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filtrar por docente"
            onChange={(e) => model.setFilterTeacherId(e.target.value)}
            value={model.filterTeacherId}
          >
            <option value="">Vista: General / Docente: Todos</option>
            {model.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                Docente: {model.teacherDisplayName(t)}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filtrar por grupo"
            onChange={(e) => model.setFilterGroupId(e.target.value)}
            value={model.filterGroupId}
          >
            <option value="">Grupo: Todos</option>
            {model.groups.map((g) => (
              <option key={g.id} value={g.id}>
                Grupo: {g.name}
              </option>
            ))}
          </Select>
        </div>
        {model.canEdit ? (
          <Button
            onClick={() => setConfigOpen((open) => !open)}
            type="button"
            variant="secondary"
          >
            <Settings2 aria-hidden size={16} />
            {configOpen ? 'Ocultar bloques' : 'Configurar bloques'}
          </Button>
        ) : null}
      </div>

      {configOpen && model.canEdit ? (
        <ScheduleTimeSlotsPanel
          onClose={() => setConfigOpen(false)}
          onSlotsChanged={handleSlotsChanged}
        />
      ) : null}

      {blockingError ? <Alert>{blockingError}</Alert> : null}
      {model.entriesError ? <Alert>{model.entriesError}</Alert> : null}

      {model.slotsLoading || model.catalogLoading ? (
        <p className={styles.status}>Cargando bloques horarios…</p>
      ) : null}

      {!model.slotsLoading &&
      !model.slotsError &&
      matrixSlots.length === 0 ? (
        <EmptyState
          description={
            model.canEdit
              ? 'Use “Configurar bloques” para definir la jornada.'
              : 'Aún no hay bloques horarios activos para mostrar.'
          }
          icon={CalendarClock}
          title="No hay bloques horarios"
        />
      ) : null}

      {!model.slotsLoading && matrixSlots.length > 0 ? (
        <>
          <div className={styles.mobileDayBar}>
            <SegmentedTabs
              aria-label="Día de la semana"
              items={dayTabs}
              onChange={(id) => model.setMobileDay(Number(id))}
              value={String(model.mobileDay)}
            />
          </div>

          <div className={styles.desktopMatrixWrap}>
            <table className={styles.matrix}>
              <thead>
                <tr>
                  <th className={styles.dayCol}>Día</th>
                  {matrixSlots.map((slot) => (
                    <th
                      className={
                        slot.slotType === 'CLASS'
                          ? styles.slotHead
                          : styles.slotHeadNeutral
                      }
                      key={slot.id}
                    >
                      <span className={styles.slotHeadPrimary}>
                        {slotHeaderLabel(slot)}
                      </span>
                      {slot.slotType === 'CLASS' && slot.name ? (
                        <span className={styles.slotHeadSecondary}>
                          {slot.name}
                          {!slot.isActive ? ' (inactivo)' : ''}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCHEDULE_WEEKDAYS.map((day) => (
                  <tr key={day.dayOfWeek}>
                    <th className={styles.dayCol} scope="row">
                      {day.label}
                    </th>
                    {matrixSlots.map((slot) => {
                      if (slot.slotType !== 'CLASS') {
                        return (
                          <td className={styles.neutralCell} key={slot.id}>
                            {nonClassSlotLabel(slot.slotType, slot.name)}
                          </td>
                        );
                      }
                      const cellEntries =
                        model.entriesByCell.get(
                          `${day.dayOfWeek}:${slot.id}`,
                        ) ?? [];
                      const canAssign = model.canEdit && slot.isActive;
                      return (
                        <td className={styles.classCell} key={slot.id}>
                          <ClassCellBody
                            canAssign={canAssign}
                            canEdit={model.canEdit}
                            entries={cellEntries}
                            filterGroupId={model.filterGroupId}
                            filterTeacherId={model.filterTeacherId}
                            onAssign={() =>
                              model.openAssign(day.dayOfWeek, slot.id)
                            }
                            onEdit={model.openEdit}
                            onRemove={model.requestDelete}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileDayList}>
            {model.entriesLoading ? (
              <p className={styles.status}>Cargando clases…</p>
            ) : null}
            <ul className={styles.slotList}>
              {matrixSlots.map((slot) => {
                if (slot.slotType !== 'CLASS') {
                  return (
                    <li className={styles.slotListNeutral} key={slot.id}>
                      <span className={styles.slotListTime}>
                        {nonClassSlotLabel(slot.slotType, slot.name)}
                      </span>
                      <span className={styles.meta}>
                        {formatSlotRange(slot.startTime, slot.endTime)}
                      </span>
                    </li>
                  );
                }
                const cellEntries =
                  model.entriesByCell.get(
                    `${model.mobileDay}:${slot.id}`,
                  ) ?? [];
                const canAssign = model.canEdit && slot.isActive;
                return (
                  <li className={styles.slotListItem} key={slot.id}>
                    <div className={styles.slotListTime}>
                      {formatSlotRange(slot.startTime, slot.endTime)}
                      {slot.name ? (
                        <span className={styles.meta}> · {slot.name}</span>
                      ) : null}
                      {!slot.isActive ? (
                        <span className={styles.meta}> · inactivo</span>
                      ) : null}
                    </div>
                    <ClassCellBody
                      canAssign={canAssign}
                      canEdit={model.canEdit}
                      entries={cellEntries}
                      filterGroupId={model.filterGroupId}
                      filterTeacherId={model.filterTeacherId}
                      onAssign={() =>
                        model.openAssign(model.mobileDay, slot.id)
                      }
                      onEdit={model.openEdit}
                      onRemove={model.requestDelete}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {!model.entriesLoading &&
          !model.entriesError &&
          model.entries.length === 0 ? (
            <p className={styles.emptyHint}>
              No hay clases asignadas para estos filtros.
            </p>
          ) : null}

          {!model.tasLoading &&
          !model.tasError &&
          model.filterPeriodId &&
          model.taOptions.length === 0 &&
          model.entries.length === 0 ? (
            <EmptyState
              action={
                model.canViewTeachingAssignments
                  ? {
                      label: 'Ir a asignaciones académicas',
                      onClick: () =>
                        navigate('/admin/teaching-assignments'),
                    }
                  : undefined
              }
              description="Cree asignaciones impartibles (materia / taller / especialidad) para poder colocarlas en el horario."
              icon={Link2}
              title="No hay asignaciones académicas disponibles."
            />
          ) : null}
        </>
      ) : null}

      <ModalCrud
        isOpen={model.dialogOpen}
        onClose={model.closeDialog}
        title={
          model.dialogMode === 'create' ? 'Asignar clase' : 'Editar clase'
        }
      >
        <ScheduleEntryForm
          assignableSlots={model.assignableSlots}
          canLinkTeachingAssignments={model.canViewTeachingAssignments}
          contextDayLabel={model.contextDayLabel}
          contextSlotLabel={model.contextSlotLabel}
          dayOptions={SCHEDULE_WEEKDAYS}
          dialogMode={model.dialogMode}
          form={model.form}
          formatSlotRange={formatSlotRange}
          isSaving={model.isSaving}
          mutationError={model.mutationError}
          onCancel={model.closeDialog}
          onChange={model.patchForm}
          onSubmit={model.submit}
          optionLabel={model.teachingAssignmentOptionLabel}
          tasError={model.tasError}
          tasLoading={model.tasLoading}
          teachingAssignments={model.taOptions}
        />
      </ModalCrud>

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Quitar"
        isOpen={model.confirmOpen}
        isSubmitting={model.isDeleting}
        message="¿Quitar esta clase del horario?"
        onCancel={model.cancelDelete}
        onConfirm={model.confirmDelete}
        secondary="No se eliminará la asignación académica del docente."
        title="Quitar del horario"
        tone="danger"
      />
    </section>
  );
};
