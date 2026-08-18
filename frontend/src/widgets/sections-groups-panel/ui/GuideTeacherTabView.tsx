import { Alert, Button, Card, Select, Table } from '@/shared/ui';
import { formatStudentCount } from '@/entities/group';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import styles from './SectionsGroupsPanel.module.css';

interface GuideTeacherTabViewProps {
  model: SectionsGroupsPanelModel;
}

export const GuideTeacherTabView = ({ model }: GuideTeacherTabViewProps) => (
  <Card className={styles.tableCard}>
    <div className={styles.toolbar}>
      <label>
        Filtrar
        <Select
          onChange={(event) => model.setTeacherFilter(event.target.value)}
          value={model.teacherFilter}
        >
          <option value="all">Todos los grupos</option>
          <option value="unassigned">Sin docente asignado</option>
          {model.sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.code} - {section.name}
            </option>
          ))}
        </Select>
      </label>
    </div>

    {model.groupMutationError && <Alert>{model.groupMutationError}</Alert>}

    {model.isLoading ? (
      <p className={styles.muted}>Cargando grupos…</p>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>Nivel</th>
            <th>Grupo</th>
            <th>Estudiantes</th>
            <th>Docente guía</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {model.assignmentGroups.map((group) => {
            const currentTeacherId = group.guideTeacherId ?? '';
            const pendingValue = model.pendingTeachers[group.id] ?? currentTeacherId;
            const hasChange = pendingValue !== currentTeacherId;
            const isUnassigned = !group.guideTeacherId;
            const isSaving = model.savingGroupId === group.id;

            return (
              <tr className={isUnassigned ? styles.unassigned : undefined} key={group.id}>
                <td>{model.getSectionLabel(group.sectionId)}</td>
                <td><strong>{group.name}</strong></td>
                <td>{formatStudentCount(group.studentCount)}</td>
                <td>
                  <Select
                    key={`${group.id}-${currentTeacherId || 'none'}`}
                    className={styles.teacherSelect}
                    disabled={isSaving}
                    onChange={(event) => model.setPendingTeacher(group.id, event.target.value)}
                    value={pendingValue}
                  >
                    <option value="">Sin asignar</option>
                    {model.guideTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </Select>
                </td>
                <td>
                  <Button
                    disabled={!hasChange || isSaving}
                    onClick={() => void model.submitGuideTeacher(group.id)}
                    type="button"
                  >
                    {isSaving ? 'Guardando…' : hasChange ? 'Guardar' : 'Asignado'}
                  </Button>
                </td>
              </tr>
            );
          })}
          {model.assignmentGroups.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={5}>
                No hay grupos que coincidan con el filtro seleccionado.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    )}
  </Card>
);
