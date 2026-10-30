import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, RowActionButton, RowActions, Select, Table } from '@/shared/ui';
import { formatStudentCount } from '@/entities/group';
import {
  GroupEnrollmentPanel,
  useGroupEnrollmentPanel,
} from '@/features/manage-group-enrollment';
import {
  GroupSchedulePreview,
  useGroupSchedulePreview,
} from '@/features/manage-schedule';
import { sessionHasPermission } from '@/shared/auth';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import groupRowStyles from '@/entities/group/ui/GroupTableRow.module.css';
import styles from './SectionsGroupsPanel.module.css';

interface GroupsTabViewProps {
  model: SectionsGroupsPanelModel;
}

export const GroupsTabView = ({ model }: GroupsTabViewProps) => {
  const canCreate = sessionHasPermission('sections.create');
  const canEdit = sessionHasPermission('sections.edit');
  const selected = model.selectedGroup;
  const enrollment = useGroupEnrollmentPanel({
    groupId: selected?.id ?? null,
    groupLabel: selected?.name,
    onEnrolled: async () => {
      await model.refreshGroups();
    },
  });
  const schedulePreview = useGroupSchedulePreview({
    groupId: selected?.id ?? null,
  });

  return (
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
                  {section.gradeLevel} - {section.name}
                </option>
              ))}
            </Select>
          </label>
          {canCreate ? (
            <Button
              onClick={() => model.createGroupMode(model.groupSectionFilter || undefined)}
              type="button"
            >
              <Plus size={16} /> Nueva sección
            </Button>
          ) : null}
        </div>

        {model.loadError && <Alert>{model.loadError}</Alert>}
        {model.groupMutationError && <Alert>{model.groupMutationError}</Alert>}

        {model.isLoading ? (
          <p className={styles.muted}>Cargando secciones…</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Sección</th>
                <th>Nivel</th>
                <th>Especialidad</th>
                <th>Inscritos / cupo</th>
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
                  <td>
                    <strong>{model.getSectionCode(group.sectionId)}</strong>
                  </td>
                  <td>
                    <strong>{group.name}</strong>
                  </td>
                  <td>{model.getSectionName(group.sectionId)}</td>
                  <td>{group.specialty?.name ?? 'Sin especialidad'}</td>
                  <td>{formatStudentCount(group.studentCount)}</td>
                  <td>{group.guideTeacher?.name || 'Sin asignar'}</td>
                  <td onClick={(event) => event.stopPropagation()}>
                    {canEdit ? (
                    <RowActions>
                      <RowActionButton
                        aria-label={`Editar ${group.name}`}
                        onClick={() => model.openEditGroupDialog(group.id)}
                        title="Editar"
                        tone="primary"
                      >
                        <Edit3 size={16} />
                      </RowActionButton>
                      <RowActionButton
                        aria-label={`Eliminar ${group.name}`}
                        onClick={() => model.removeSelectedGroup(group)}
                        title="Eliminar"
                        tone="danger"
                      >
                        <Trash2 size={16} />
                      </RowActionButton>
                    </RowActions>
                    ) : null}
                  </td>
                </tr>
              ))}
              {model.filteredGroups.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={7}>
                    No se encontraron secciones.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <GroupEnrollmentPanel model={enrollment} />
      <GroupSchedulePreview
        groupLabel={selected?.name}
        model={schedulePreview}
      />
    </div>
  );
};
