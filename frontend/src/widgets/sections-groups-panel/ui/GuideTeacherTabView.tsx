import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, RowActionButton, RowActions, Table } from '@/shared/ui';
import { formatStudentCount } from '@/entities/group';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import groupRowStyles from '@/entities/group/ui/GroupTableRow.module.css';
import styles from './SectionsGroupsPanel.module.css';

interface GuideTeacherTabViewProps {
  model: SectionsGroupsPanelModel;
}

export const GuideTeacherTabView = ({ model }: GuideTeacherTabViewProps) => {
  const selectedAssignments = model.selectedTeacher
    ? model.assignmentsByTeacherId.get(model.selectedTeacher.id) ?? []
    : [];

  return (
    <div className={styles.mainColumn}>
      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div>
            <h2>Docentes guía</h2>
            <p className={styles.muted}>Cree, edite o elimine docentes. Luego asígnelos a una sección.</p>
          </div>
          <Button onClick={model.createTeacherMode} type="button">
            <Plus size={16} /> Nuevo docente
          </Button>
        </div>

        {model.teacherMutationError && <Alert>{model.teacherMutationError}</Alert>}

        {model.isLoading ? (
          <p className={styles.muted}>Cargando docentes…</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Sección</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {model.guideTeachers.map((teacher) => {
                const assigned = model.assignmentsByTeacherId.get(teacher.id) ?? [];
                return (
                  <tr
                    className={`${groupRowStyles.row} ${teacher.id === model.selectedTeacherId ? groupRowStyles.selected : ''}`}
                    key={teacher.id}
                    onClick={() => model.selectTeacher(teacher.id)}
                  >
                    <td><strong>{teacher.name}</strong></td>
                    <td>{teacher.nationalId || '—'}</td>
                    <td>
                      {assigned.length
                        ? assigned.map((group) => group.name).join(', ')
                        : 'Sin asignar'}
                    </td>
                    <td>{teacher.email || '—'}</td>
                    <td>{teacher.phone || '—'}</td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <RowActions>
                        <RowActionButton
                          aria-label={`Editar ${teacher.name}`}
                          onClick={() => model.openEditTeacherDialog(teacher.id)}
                          title="Editar"
                          tone="primary"
                        >
                          <Edit3 size={16} />
                        </RowActionButton>
                        <RowActionButton
                          aria-label={`Eliminar ${teacher.name}`}
                          onClick={() => model.removeSelectedTeacher(teacher)}
                          title="Eliminar"
                          tone="danger"
                        >
                          <Trash2 size={16} />
                        </RowActionButton>
                      </RowActions>
                    </td>
                  </tr>
                );
              })}
              {model.guideTeachers.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={6}>
                    No hay docentes guía. Use «Nuevo docente» para crear el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {model.selectedTeacher && (
        <Card className={styles.tableCard}>
          <div>
            <h2>Secciones asignadas</h2>
            <p className={styles.muted}>
              Secciones donde {model.selectedTeacher.name} es docente guía.
            </p>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Sección</th>
                <th>Estudiantes</th>
              </tr>
            </thead>
            <tbody>
              {selectedAssignments.map((group) => (
                <tr key={group.id}>
                  <td>{model.getSectionName(group.sectionId)}</td>
                  <td><strong>{group.name}</strong></td>
                  <td>{formatStudentCount(group.studentCount)}</td>
                </tr>
              ))}
              {selectedAssignments.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={3}>
                    Este docente no tiene secciones asignadas.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};
