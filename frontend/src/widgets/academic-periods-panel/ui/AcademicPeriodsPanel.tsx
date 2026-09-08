import { CalendarRange, Edit3, Lock, Play, Plus, RotateCcw } from 'lucide-react';
import type { AcademicPeriodStatus } from '@/entities/academic-period';
import { AcademicPeriodTableRow } from '@/entities/academic-period';
import { AcademicPeriodFormPanel } from '@/features/manage-academic-period';
import type { AcademicPeriodStatusFilter } from '@/features/manage-academic-period';
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTableShell,
  DataToolbar,
  EmptyState,
  ModalCrud,
  Pagination,
  RowActionButton,
  RowActions,
  Select,
  Table,
} from '@/shared/ui';
import { useAcademicPeriodsPanel, type AcademicPeriodTransitionAction } from '../model/useAcademicPeriodsPanel';
import styles from './AcademicPeriodsPanel.module.css';

const TRANSITION_COPY: Record<
  AcademicPeriodTransitionAction,
  {
    title: string;
    message: (name: string) => string;
    secondary: string;
    confirmLabel: string;
    tone: 'primary' | 'danger';
    icon: typeof Play;
  }
> = {
  activate: {
    title: 'Activar período académico',
    message: (name) => `¿Desea activar el período ${name}?`,
    secondary: 'El período pasará al estado Activo.',
    confirmLabel: 'Activar',
    tone: 'primary',
    icon: Play,
  },
  close: {
    title: 'Cerrar período académico',
    message: (name) => `¿Desea cerrar el período ${name}?`,
    secondary: 'Una vez cerrado, el período no podrá editarse mientras permanezca en este estado.',
    confirmLabel: 'Cerrar',
    tone: 'danger',
    icon: Lock,
  },
  reopen: {
    title: 'Reabrir período académico',
    message: (name) => `¿Desea reabrir el período ${name}?`,
    secondary: 'El período volverá al estado Planificado.',
    confirmLabel: 'Reabrir',
    tone: 'primary',
    icon: RotateCcw,
  },
};

export const AcademicPeriodsPanel = () => {
  const model = useAcademicPeriodsPanel();
  const dialogTitle = model.dialogMode === 'create' ? 'Nuevo período' : 'Editar período';
  const submitLabel = model.dialogMode === 'create' ? 'Guardar' : 'Guardar cambios';
  const formStatus = model.dialogMode === 'edit' ? model.selectedPeriod?.status : undefined;
  const pending = model.pendingTransition;
  const transitionCopy = pending ? TRANSITION_COPY[pending.action] : null;
  const hasFilters = Boolean(model.search.trim()) || model.status !== 'ALL';

  return (
    <section className={styles.layout}>
      <div className={styles.mainColumn}>
        <DataTableShell
          footer={
            model.totalPages > 1 ? (
              <Pagination
                currentPage={model.currentPage}
                onPageChange={model.setCurrentPage}
                totalPages={model.totalPages}
              />
            ) : null
          }
          toolbar={
            <DataToolbar
              filters={
                <Select
                  aria-label="Filtrar por estado"
                  onChange={(event) =>
                    model.setStatus(event.target.value as AcademicPeriodStatusFilter)
                  }
                  value={model.status}
                >
                  <option value="ALL">Estado: Todos</option>
                  <option value={'PLANNED' satisfies AcademicPeriodStatus}>Planificados</option>
                  <option value={'ACTIVE' satisfies AcademicPeriodStatus}>Activos</option>
                  <option value={'CLOSED' satisfies AcademicPeriodStatus}>Cerrados</option>
                </Select>
              }
              onSearchChange={model.setSearch}
              primaryAction={
                <Button onClick={model.openCreateDialog} type="button">
                  <Plus size={16} /> Nuevo período
                </Button>
              }
              search={model.search}
              searchPlaceholder="Buscar período…"
            />
          }
        >
          {model.error && <Alert>{model.error}</Alert>}
          {model.mutationError && <Alert>{model.mutationError}</Alert>}
          {model.isLoading ? (
            <p className={styles.muted}>Cargando períodos académicos…</p>
          ) : null}

          {!model.isLoading && model.periods.length === 0 ? (
            <EmptyState
              action={
                hasFilters
                  ? undefined
                  : { label: 'Nuevo período', onClick: model.openCreateDialog, icon: Plus }
              }
              description={
                hasFilters
                  ? 'No hay períodos que coincidan con la búsqueda o el filtro de estado.'
                  : 'Aún no hay períodos académicos registrados.'
              }
              icon={CalendarRange}
              title="Sin períodos académicos"
            />
          ) : null}

          {!model.isLoading && model.periods.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha de inicio</th>
                  <th>Fecha de finalización</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {model.periods.map((period) => (
                  <AcademicPeriodTableRow
                    actions={
                      <RowActions>
                        {period.status !== 'CLOSED' && (
                          <RowActionButton
                            aria-label={`Editar ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.openEditDialog(period.id)}
                            title="Editar"
                            tone="primary"
                          >
                            <Edit3 size={16} />
                          </RowActionButton>
                        )}
                        {period.status === 'PLANNED' && (
                          <RowActionButton
                            aria-label={`Activar ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.activatePeriod(period)}
                            title="Activar"
                          >
                            <Play size={16} />
                          </RowActionButton>
                        )}
                        {period.status === 'ACTIVE' && (
                          <RowActionButton
                            aria-label={`Cerrar ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.closePeriod(period)}
                            title="Cerrar"
                            tone="danger"
                          >
                            <Lock size={16} />
                          </RowActionButton>
                        )}
                        {period.status === 'CLOSED' && (
                          <RowActionButton
                            aria-label={`Reabrir ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.reopenPeriod(period)}
                            title="Reabrir"
                          >
                            <RotateCcw size={16} />
                          </RowActionButton>
                        )}
                      </RowActions>
                    }
                    isSelected={period.id === model.selectedPeriodId}
                    key={period.id}
                    onSelect={model.selectPeriod}
                    period={period}
                  />
                ))}
              </tbody>
            </Table>
          ) : null}
        </DataTableShell>
        <Alert>El estado de un período solo se modifica con las acciones Activar, Cerrar o Reabrir.</Alert>
      </div>

      <ModalCrud
        isOpen={model.dialogMode !== null}
        onClose={model.closeDialog}
        title={dialogTitle}
      >
        {model.formError && <Alert>{model.formError}</Alert>}
        {model.mutationError && <Alert>{model.mutationError}</Alert>}
        <AcademicPeriodFormPanel
          isReadOnly={model.isReadOnly}
          isSubmitting={model.isSubmitting}
          onCancel={model.closeDialog}
          onChange={model.periodForm.setField}
          onSubmit={model.periodForm.submit}
          status={formStatus}
          submitLabel={submitLabel}
          values={model.periodForm.values}
        />
      </ModalCrud>

      {transitionCopy && pending ? (
        <ConfirmDialog
          confirmLabel={transitionCopy.confirmLabel}
          icon={transitionCopy.icon}
          isOpen
          isSubmitting={model.isSubmitting}
          message={transitionCopy.message(pending.period.name)}
          onCancel={model.cancelPeriodTransition}
          onConfirm={() => void model.confirmPeriodTransition()}
          secondary={transitionCopy.secondary}
          title={transitionCopy.title}
          tone={transitionCopy.tone}
        />
      ) : null}
    </section>
  );
};
