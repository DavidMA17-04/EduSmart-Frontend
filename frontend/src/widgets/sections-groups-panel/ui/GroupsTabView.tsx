import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Select, Table } from '@/shared/ui';
import { formatStudentCount } from '@/entities/group';
import { GroupForm } from '@/features/manage-group';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import groupRowStyles from '@/entities/group/ui/GroupTableRow.module.css';
import styles from './SectionsGroupsPanel.module.css';

interface GroupsTabViewProps {
  model: SectionsGroupsPanelModel;
}

export const GroupsTabView = ({ model }: GroupsTabViewProps) => {
  const groupTitle = model.groupFormMode === 'create' ? 'Nuevo grupo' : 'Editar grupo';

  return (
    <div className={styles.groupsLayout}>
      <div className={styles.mainColumn}>
        <Card className={styles.tableCard}>
          <div className={styles.toolbar}>
            <label>
              Filtrar por nivel
              <Select
                onChange={(event) => model.setGroupSectionFilter(event.target.value)}
                value={model.groupSectionFilter}
              >
                <option value="">Todos los niveles</option>
                {model.sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.code} - {section.name}
                  </option>
                ))}
              </Select>
            </label>
            <Button onClick={() => model.createGroupMode(model.groupSectionFilter || undefined)} type="button">
              <Plus size={15} /> Nuevo grupo
            </Button>
          </div>

          {model.loadError && <Alert>{model.loadError}</Alert>}
          {model.groupMutationError && <Alert>{model.groupMutationError}</Alert>}

          {model.isLoading ? (
            <p className={styles.muted}>Cargando grupos…</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Nivel</th>
                  <th>Cantidad de estudiantes</th>
                  <th>Docente guía</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {model.filteredGroups.map((group) => (
                  <tr
                    className={`${groupRowStyles.row} ${group.id === model.selectedGroupId ? groupRowStyles.selected : ''}`}
                    key={group.id}
                    onClick={() => model.selectGroup(group.id)}
                  >
                    <td><strong>{group.name}</strong></td>
                    <td>{model.getSectionLabel(group.sectionId)}</td>
                    <td>{formatStudentCount(group.studentCount)}</td>
                    <td>{group.guideTeacher?.name || 'Sin asignar'}</td>
                    <td onClick={(event) => event.stopPropagation()}>
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
                    </td>
                  </tr>
                ))}
                {model.filteredGroups.length === 0 && (
                  <tr>
                    <td className={styles.empty} colSpan={5}>
                      No se encontraron grupos.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {model.groupFormMode ? (
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
      ) : (
        <Card>
          <Alert>Seleccione un grupo de la tabla o cree uno nuevo para editarlo.</Alert>
        </Card>
      )}
    </div>
  );
};
