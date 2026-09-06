import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Table } from '@/shared/ui';
import { GroupTableRow } from '@/entities/group';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import styles from './SectionDetailPanel.module.css';

interface SectionDetailPanelProps {
  model: SectionsGroupsPanelModel;
  onGoToTeachersTab: () => void;
}

export const SectionDetailPanel = ({ model, onGoToTeachersTab }: SectionDetailPanelProps) => {
  if (!model.selectedSection) {
    return (
      <div className={styles.placeholder}>
        Seleccione un nivel para ver sus secciones asociadas.
      </div>
    );
  }

  return (
    <div className={styles.detailPanel}>
      <section className={styles.groupsCard}>
        <div className={styles.groupsHeader}>
          <div>
            <h3>Secciones de {model.selectedSection.name}</h3>
            <p>Administre las secciones asociadas al nivel seleccionado.</p>
          </div>
          <Button
            onClick={() => model.createGroupMode(model.selectedSectionId ?? undefined)}
            type="button"
          >
            <Plus size={14} /> Agregar sección
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>Sección</th>
              <th>Especialidad</th>
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
                      onClick={() => model.openEditGroupDialog(group.id)}
                      size="icon"
                      type="button"
                      variant="secondary"
                    >
                      <Edit3 />
                    </Button>
                    <Button
                      aria-label={`Eliminar ${group.name}`}
                      onClick={() => void model.removeSelectedGroup(group)}
                      size="icon"
                      type="button"
                      variant="danger"
                    >
                      <Trash2 />
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
                <td className={styles.empty} colSpan={5}>
                  Este nivel no tiene secciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </section>

      <Alert>
        Los docentes guía se crean en la pestaña{' '}
        <button className={styles.alertLink} onClick={onGoToTeachersTab} type="button">
          Docentes guía
        </button>
        {' '}y se asignan al crear o editar una sección.
      </Alert>
    </div>
  );
};
