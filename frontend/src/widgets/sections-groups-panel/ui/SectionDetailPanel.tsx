import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Table } from '@/shared/ui';
import { GroupTableRow } from '@/entities/group';
import { GroupForm } from '@/features/manage-group';
import { SectionForm } from '@/features/manage-section';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import styles from './SectionDetailPanel.module.css';

interface SectionDetailPanelProps {
  model: SectionsGroupsPanelModel;
  onGoToTeachersTab: () => void;
}

export const SectionDetailPanel = ({ model, onGoToTeachersTab }: SectionDetailPanelProps) => {
  const sectionTitle = model.sectionFormMode === 'create' ? 'Nuevo nivel' : 'Información del nivel';
  const groupTitle = model.groupFormMode === 'create' ? 'Nueva sección' : 'Editar sección';
  const showSectionForm = model.sectionFormMode === 'create' || Boolean(model.selectedSection);

  if (!showSectionForm) {
    return <div className={styles.placeholder}>Seleccione un nivel para ver su información y secciones.</div>;
  }

  return (
    <div className={styles.detailPanel}>
      <SectionForm
        isSubmitting={model.isSectionSubmitting}
        onCancel={model.cancelSectionForm}
        onChange={model.sectionForm.setField}
        onSubmit={model.sectionForm.submit}
        title={sectionTitle}
        values={model.sectionForm.values}
      />

      {model.selectedSection && (
        <section className={styles.groupsCard}>
          <div className={styles.groupsHeader}>
            <div>
              <h3>Secciones del nivel</h3>
              <p>Administre las secciones asociadas al nivel seleccionado.</p>
            </div>
            <Button
              onClick={() => model.createGroupMode(model.selectedSectionId ?? undefined)}
              type="button"
            >
              <Plus size={14} /> Agregar sección
            </Button>
          </div>

          {model.groupFormMode && (
            <div className={styles.embeddedForm}>
              <GroupForm
                guideTeachers={model.guideTeachers}
                isSubmitting={model.isGroupSubmitting}
                onCancel={model.cancelGroupForm}
                onChange={model.groupForm.setField}
                onSubmit={model.groupForm.submit}
                sections={model.sections}
                title={groupTitle}
                values={model.groupForm.values}
              />
            </div>
          )}

          <Table>
            <thead>
              <tr>
                <th>Sección</th>
                <th>Cantidad de estudiantes</th>
                <th>Docente guía</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {model.groupsForSelectedSection.map((group) => (
                <GroupTableRow
                  actions={
                    <span className={styles.rowActions}>
                      <Button
                        aria-label={`Editar ${group.name}`}
                        onClick={() => model.selectGroup(group.id)}
                        type="button"
                        variant="secondary"
                      >
                        <Edit3 size={14} />
                      </Button>
                      <Button
                        aria-label={`Eliminar ${group.name}`}
                        onClick={() => void model.removeSelectedGroup(group)}
                        type="button"
                        variant="danger"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </span>
                  }
                  group={group}
                  isSelected={group.id === model.selectedGroupId}
                  key={group.id}
                  onSelect={model.selectGroup}
                />
              ))}
              {model.groupsForSelectedSection.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={4}>
                    Este nivel no tiene secciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </section>
      )}

      <Alert>
        Los docentes guía se asignan desde la pestaña{' '}
        <button className={styles.alertLink} onClick={onGoToTeachersTab} type="button">
          Asignación de docentes guía
        </button>
        .
      </Alert>
    </div>
  );
};
