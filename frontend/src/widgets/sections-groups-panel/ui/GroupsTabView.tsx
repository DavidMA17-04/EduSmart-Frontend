import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, RowActionButton, RowActions, Select, Table } from '@/shared/ui';
import { formatStudentCount } from '@/entities/group';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import groupRowStyles from '@/entities/group/ui/GroupTableRow.module.css';
import styles from './SectionsGroupsPanel.module.css';

interface GroupsTabViewProps {
  model: SectionsGroupsPanelModel;
}

export const GroupsTabView = ({ model }: GroupsTabViewProps) => (
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
        <Button onClick={() => model.createGroupMode(model.groupSectionFilter || undefined)} type="button">
          <Plus size={16} /> Nueva sección
        </Button>
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
              >
                <td><strong>{model.getSectionCode(group.sectionId)}</strong></td>
                <td><strong>{group.name}</strong></td>
                <td>{model.getSectionName(group.sectionId)}</td>
                <td>{group.specialty?.name ?? 'Sin especialidad'}</td>
                <td>{formatStudentCount(group.studentCount)}</td>
                <td>{group.guideTeacher?.name || 'Sin asignar'}</td>
                <td>
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
  </div>
);
