import { Edit3, Lock, Play, Plus, RotateCcw } from 'lucide-react';
import { Alert, Button, Card, Pagination, Table } from '@/shared/ui';
import { AcademicPeriodTableRow } from '@/entities/academic-period';
import { AcademicPeriodFilters, AcademicPeriodFormPanel } from '@/features/manage-academic-period';
import { useAcademicPeriodsPanel } from '../model/useAcademicPeriodsPanel';
import { AcademicPeriodConfirmDialog } from './AcademicPeriodConfirmDialog';
import styles from './AcademicPeriodsPanel.module.css';

export const AcademicPeriodsPanel = () => {
  const model = useAcademicPeriodsPanel();
  const formTitle = model.formMode === 'create' ? 'Nuevo período' : 'Detalle del período';
  const formStatus = model.formMode === 'edit' ? model.selectedPeriod?.status : undefined;

  return (
    <section className={styles.layout}>
      <div className={styles.mainColumn}>
        <Card className={styles.tableCard}>
          <div className={styles.toolbar}>
            <AcademicPeriodFilters
              onSearchChange={model.setSearch}
              onStatusChange={model.setStatus}
              search={model.search}
              status={model.status}
            />
            <div className={styles.toolbarActions}>
              <Button onClick={model.createPeriod} type="button">
                <Plus size={16} /> Nuevo período
              </Button>
            </div>
          </div>
          {model.error && <Alert>{model.error}</Alert>}
          {model.mutationError && <Alert>{model.mutationError}</Alert>}
          {model.formError && <Alert>{model.formError}</Alert>}
          {model.isLoading ? (
            <p className={styles.muted}>Cargando períodos académicos…</p>
          ) : (
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
                      <span className={styles.rowActions}>
                        {period.status !== 'CLOSED' && (
                          <Button
                            aria-label={`Editar ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.selectPeriod(period.id)}
                            size="icon"
                            title="Editar"
                            type="button"
                            variant="secondary"
                          >
                            <Edit3 />
                          </Button>
                        )}
                        {period.status === 'PLANNED' && (
                          <Button
                            aria-label={`Activar ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.activatePeriod(period)}
                            size="icon"
                            title="Activar"
                            type="button"
                            variant="secondary"
                          >
                            <Play />
                          </Button>
                        )}
                        {period.status === 'ACTIVE' && (
                          <Button
                            aria-label={`Cerrar ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.closePeriod(period)}
                            size="icon"
                            title="Cerrar"
                            type="button"
                            variant="danger"
                          >
                            <Lock />
                          </Button>
                        )}
                        {period.status === 'CLOSED' && (
                          <Button
                            aria-label={`Reabrir ${period.name}`}
                            disabled={model.isSubmitting}
                            onClick={() => model.reopenPeriod(period)}
                            size="icon"
                            title="Reabrir"
                            type="button"
                            variant="secondary"
                          >
                            <RotateCcw />
                          </Button>
                        )}
                      </span>
                    }
                    isSelected={period.id === model.selectedPeriodId}
                    key={period.id}
                    onSelect={model.selectPeriod}
                    period={period}
                  />
                ))}
                {model.periods.length === 0 && (
                  <tr>
                    <td className={styles.empty} colSpan={5}>
                      No se encontraron períodos académicos.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          <Pagination
            currentPage={model.currentPage}
            onPageChange={model.setCurrentPage}
            totalPages={model.totalPages}
          />
        </Card>
        <Alert>El estado de un período solo se modifica con las acciones Activar, Cerrar o Reabrir.</Alert>
      </div>
      <div className={styles.sidePanel}>
        <AcademicPeriodFormPanel
          isReadOnly={model.isReadOnly}
          isSubmitting={model.isSubmitting}
          onCancel={model.createPeriod}
          onChange={model.periodForm.setField}
          onSubmit={model.periodForm.submit}
          status={formStatus}
          title={formTitle}
          values={model.periodForm.values}
        />
      </div>
      <AcademicPeriodConfirmDialog
        action={model.pendingTransition?.action ?? null}
        isSubmitting={model.isSubmitting}
        onCancel={model.cancelPeriodTransition}
        onConfirm={() => void model.confirmPeriodTransition()}
        periodName={model.pendingTransition?.period.name ?? ''}
      />
    </section>
  );
};
