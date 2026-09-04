import { Edit3, Plus, Trash2, X } from 'lucide-react';
import type { SpecialtyKind } from '@/entities/specialty';
import { SpecialtyTableRow } from '@/entities/specialty';
import { SpecialtyFilters, SpecialtyFormPanel } from '@/features/manage-specialty';
import { Alert, Button, Card, Modal, Pagination, Table } from '@/shared/ui';
import { useSpecialtiesPanel } from '../model/useSpecialtiesPanel';
import styles from './SpecialtiesPanel.module.css';

interface SpecialtiesPanelProps {
  kind: SpecialtyKind;
}

export const SpecialtiesPanel = ({ kind }: SpecialtiesPanelProps) => {
  const model = useSpecialtiesPanel(kind);
  const nameColumn = kind === 'EXPLORATORY_WORKSHOP' ? 'Taller' : 'Especialidad';
  const editing = model.formMode === 'edit' && model.selectedSpecialty != null;

  return (
    <section className={`${styles.layout} ${editing ? styles.withSide : ''}`}>
      {model.toast ? (
        <div
          className={`${styles.toast} ${model.toast.tone === 'success' ? styles.toastSuccess : styles.toastError}`}
          role="status"
        >
          <span>{model.toast.message}</span>
          <button
            aria-label="Cerrar notificación"
            className={styles.toastClose}
            onClick={model.dismissToast}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <div className={styles.mainColumn}>
        <Card className={styles.tableCard}>
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

          {model.error ? <Alert>{model.error}</Alert> : null}

          {model.isLoading ? (
            <p className={styles.muted}>{model.copy.loading}</p>
          ) : (
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
                      <span className={styles.rowActions}>
                        <Button
                          aria-label={`Editar ${specialty.name}`}
                          onClick={() => model.selectSpecialty(specialty.id)}
                          size="icon"
                          type="button"
                          variant="secondary"
                        >
                          <Edit3 />
                        </Button>
                        <Button
                          aria-label={`Inactivar ${specialty.name}`}
                          onClick={() => void model.deactivateSpecialty(specialty)}
                          size="icon"
                          type="button"
                          variant="danger"
                        >
                          <Trash2 />
                        </Button>
                      </span>
                    }
                    isSelected={specialty.id === model.selectedSpecialtyId}
                    key={specialty.id}
                    onSelect={model.selectSpecialty}
                    specialty={specialty}
                  />
                ))}
                {model.specialties.length === 0 ? (
                  <tr>
                    <td className={styles.empty} colSpan={4}>
                      {model.copy.empty}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          )}
          <Pagination
            currentPage={model.currentPage}
            onPageChange={model.setCurrentPage}
            totalPages={model.totalPages}
          />
        </Card>
        <Alert>{model.copy.alert}</Alert>
      </div>

      {editing ? (
        <div className={styles.sidePanel}>
          <SpecialtyFormPanel
            isSubmitting={model.isSubmitting}
            nameFieldLabel={`Nombre del ${model.copy.noun}`}
            nameInputRef={model.specialtyForm.nameInputRef}
            onCancel={model.closeEditPanel}
            onChange={model.specialtyForm.setField}
            onSubmit={model.specialtyForm.submit}
            submitLabel="Guardar cambios"
            title={model.copy.editTitle}
            values={model.specialtyForm.values}
          />
        </div>
      ) : null}

      <Modal
        isOpen={model.createOpen}
        onClose={model.closeCreateModal}
        title={model.copy.createTitle}
      >
        <div className={styles.modalBody}>
          {model.createNotice ? (
            <div
              className={`${styles.inlineNotice} ${
                model.createNotice.tone === 'success' ? styles.toastSuccess : styles.toastError
              }`}
              role="status"
            >
              {model.createNotice.message}
            </div>
          ) : null}
          {model.mutationError && !model.createNotice ? <Alert>{model.mutationError}</Alert> : null}
          <SpecialtyFormPanel
            embedded
            isSubmitting={model.isSubmitting || model.createLocked}
            nameFieldLabel={`Nombre del ${model.copy.noun}`}
            nameInputRef={model.specialtyForm.nameInputRef}
            onCancel={model.closeCreateModal}
            onChange={model.specialtyForm.setField}
            onSubmit={model.specialtyForm.submit}
            submitLabel={model.createLocked ? 'Listo' : model.copy.createCta}
            values={model.specialtyForm.values}
          />
        </div>
      </Modal>
    </section>
  );
};
