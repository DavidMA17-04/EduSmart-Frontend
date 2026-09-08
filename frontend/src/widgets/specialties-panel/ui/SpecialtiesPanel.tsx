import { Edit3, Layers, Plus, Trash2, Wrench } from 'lucide-react';
import type { SpecialtyKind } from '@/entities/specialty';
import { SpecialtyTableRow } from '@/entities/specialty';
import { SpecialtyFilters, SpecialtyFormPanel } from '@/features/manage-specialty';
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTableShell,
  EmptyState,
  ModalCrud,
  Pagination,
  RowActionButton,
  RowActions,
  Table,
} from '@/shared/ui';
import { useSpecialtiesPanel } from '../model/useSpecialtiesPanel';
import styles from './SpecialtiesPanel.module.css';

interface SpecialtiesPanelProps {
  kind: SpecialtyKind;
}

export const SpecialtiesPanel = ({ kind }: SpecialtiesPanelProps) => {
  const model = useSpecialtiesPanel(kind);
  const nameColumn = kind === 'EXPLORATORY_WORKSHOP' ? 'Taller' : 'Especialidad';
  const EmptyIcon = kind === 'EXPLORATORY_WORKSHOP' ? Layers : Wrench;
  const dialogTitle =
    model.dialogMode === 'create' ? model.copy.createTitle : model.copy.editTitle;
  const submitLabel = model.dialogMode === 'create' ? model.copy.createCta : 'Guardar cambios';
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
            <div className={styles.toolbar}>
              <div className={styles.filtersWrap}>
                <SpecialtyFilters
                  onSearchChange={model.setSearch}
                  onStatusChange={model.setStatus}
                  search={model.search}
                  searchPlaceholder={model.copy.searchPlaceholder}
                  status={model.status}
                />
              </div>
              <div className={styles.toolbarActions}>
                <Button onClick={model.openCreateModal} type="button">
                  <Plus size={16} />
                  {model.copy.createCta}
                </Button>
              </div>
            </div>
          }
        >
          {model.error ? <Alert>{model.error}</Alert> : null}

          {model.isLoading ? <p className={styles.muted}>{model.copy.loading}</p> : null}

          {!model.isLoading && model.specialties.length === 0 ? (
            <EmptyState
              action={
                hasFilters
                  ? undefined
                  : { label: model.copy.createCta, onClick: model.openCreateModal, icon: Plus }
              }
              description={
                hasFilters
                  ? 'No hay resultados que coincidan con la búsqueda o el filtro de estado.'
                  : model.copy.empty
              }
              icon={EmptyIcon}
              title="Sin resultados"
            />
          ) : null}

          {!model.isLoading && model.specialties.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>{nameColumn}</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {model.specialties.map((specialty) => (
                  <SpecialtyTableRow
                    actions={
                      <RowActions>
                        <RowActionButton
                          aria-label={`Editar ${specialty.name}`}
                          onClick={() => model.openEditDialog(specialty.id)}
                          title="Editar"
                          tone="primary"
                        >
                          <Edit3 size={16} />
                        </RowActionButton>
                        <RowActionButton
                          aria-label={`Inactivar ${specialty.name}`}
                          onClick={() => model.requestDeactivate(specialty)}
                          title="Inactivar"
                          tone="danger"
                        >
                          <Trash2 size={16} />
                        </RowActionButton>
                      </RowActions>
                    }
                    isSelected={specialty.id === model.selectedSpecialtyId}
                    key={specialty.id}
                    onSelect={model.selectSpecialty}
                    specialty={specialty}
                  />
                ))}
              </tbody>
            </Table>
          ) : null}
        </DataTableShell>
        <Alert>{model.copy.alert}</Alert>
      </div>

      <ModalCrud
        isOpen={model.dialogMode !== null}
        onClose={model.closeDialog}
        title={dialogTitle}
      >
        <div className={styles.modalBody}>
          {model.mutationError ? <Alert>{model.mutationError}</Alert> : null}
          <SpecialtyFormPanel
            embedded
            isSubmitting={model.isSubmitting}
            nameFieldLabel={`Nombre del ${model.copy.noun}`}
            nameInputRef={model.specialtyForm.nameInputRef}
            onCancel={model.closeDialog}
            onChange={model.specialtyForm.setField}
            onSubmit={model.specialtyForm.submit}
            submitLabel={submitLabel}
            values={model.specialtyForm.values}
          />
        </div>
      </ModalCrud>

      <ConfirmDialog
        confirmLabel="Inactivar"
        icon={Trash2}
        isOpen={model.pendingDeactivate !== null}
        isSubmitting={model.isSubmitting}
        message={`¿Inactivar ${model.copy.noun} ${model.pendingDeactivate?.name ?? ''}?`}
        onCancel={model.cancelDeactivate}
        onConfirm={() => void model.confirmDeactivate()}
        secondary="Dejará de estar disponible para asignación en períodos académicos."
        title={`Inactivar ${model.copy.noun}`}
        tone="danger"
      />
    </section>
  );
};
