import { BookOpen, Edit3, Plus } from 'lucide-react';
import {
  offeringKindLabel,
  type AcademicOfferingKind,
} from '@/entities/teaching-assignment';
import {
  Alert,
  Badge,
  Button,
  DataTableShell,
  DataToolbar,
  EmptyState,
  ModalCrud,
  RowActionButton,
  RowActions,
  Select,
  Table,
} from '@/shared/ui';
import {
  useTeachingAssignmentsPanel,
  type OfferingKindFilter,
} from '@/features/manage-teaching-assignment/model/useTeachingAssignmentsPanel';
import { TeachingAssignmentForm } from '@/features/manage-teaching-assignment/ui/TeachingAssignmentForm';
import styles from './TeachingAssignmentsPanel.module.css';

function offeringDisplayName(row: {
  offeringKind: AcademicOfferingKind;
  subject?: { name: string } | null;
  specialty?: { name: string } | null;
}): string {
  if (row.offeringKind === 'SUBJECT') return row.subject?.name ?? '—';
  return row.specialty?.name ?? '—';
}

export const TeachingAssignmentsPanel = () => {
  const model = useTeachingAssignmentsPanel();
  const dialogTitle =
    model.dialogMode === 'create'
      ? 'Nueva asignación académica'
      : 'Editar asignación académica';

  return (
    <section className={styles.layout}>
      <div className={styles.notice}>
        <p>
          <strong>Asignaciones académicas (qué imparte)</strong> definen las
          materias, talleres o especialidades que un docente puede impartir en un
          grupo y período. Alimentan Asistencias.
        </p>
        <p className={styles.muted}>
          El flujo de <strong>Docente guía</strong> (relación guía → grupo) se
          gestiona en Niveles y secciones y es independiente. Ser guía no concede
          por sí solo materias ni asistencia del grupo.
        </p>
      </div>

      <div className={styles.mainColumn}>
        <DataTableShell
          toolbar={
            <DataToolbar
              filters={
                <div className={styles.filters}>
                  <Select
                    aria-label="Filtrar por docente"
                    onChange={(e) => model.setFilterTeacherId(e.target.value)}
                    value={model.filterTeacherId}
                  >
                    <option value="">Docente: Todos</option>
                    {model.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {model.teacherDisplayName(t)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    aria-label="Filtrar por grupo"
                    onChange={(e) => model.setFilterGroupId(e.target.value)}
                    value={model.filterGroupId}
                  >
                    <option value="">Grupo: Todos</option>
                    {model.groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    aria-label="Filtrar por período"
                    onChange={(e) => model.setFilterPeriodId(e.target.value)}
                    value={model.filterPeriodId}
                  >
                    <option value="">Período: Todos</option>
                    {model.periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    aria-label="Filtrar por tipo"
                    onChange={(e) =>
                      model.setFilterKind(e.target.value as OfferingKindFilter)
                    }
                    value={model.filterKind}
                  >
                    <option value="ALL">Tipo: Todos</option>
                    <option value="SUBJECT">Materia</option>
                    <option value="EXPLORATORY_WORKSHOP">Taller exploratorio</option>
                    <option value="TECHNICAL_SPECIALTY">Especialidad técnica</option>
                  </Select>
                </div>
              }
              primaryAction={
                <Button onClick={model.openCreate} type="button">
                  <Plus size={16} /> Nueva asignación
                </Button>
              }
            />
          }
        >
          {model.error ? <Alert>{model.error}</Alert> : null}

          {model.isLoading ? (
            <p className={styles.muted}>Cargando asignaciones académicas…</p>
          ) : null}

          {!model.isLoading && model.rows.length === 0 ? (
            <EmptyState
              action={{
                label: 'Nueva asignación',
                onClick: model.openCreate,
                icon: Plus,
              }}
              description="Configure qué imparte cada docente en un grupo y período. No incluye asignaciones de solo docente guía."
              icon={BookOpen}
              title="Sin asignaciones académicas"
            />
          ) : null}

          {!model.isLoading && model.rows.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Grupo</th>
                  <th>Grado</th>
                  <th>Tipo</th>
                  <th>Materia / Taller / Especialidad</th>
                  <th>Período</th>
                  <th>Profesor guía</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {model.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{model.assignmentTeacherName(row)}</strong>
                    </td>
                    <td>{row.group?.name ?? `Grupo #${row.groupId}`}</td>
                    <td>{row.group?.section?.gradeLevel ?? '—'}</td>
                    <td>
                      <Badge tone="neutral">
                        {offeringKindLabel(row.offeringKind)}
                      </Badge>
                    </td>
                    <td>{offeringDisplayName(row)}</td>
                    <td>
                      {row.academicPeriod?.name ??
                        (row.academicPeriodId != null
                          ? `Período #${row.academicPeriodId}`
                          : '—')}
                    </td>
                    <td>{row.isGuideTeacher ? 'Sí' : 'No'}</td>
                    <td>
                      <RowActions>
                        <RowActionButton
                          aria-label="Editar asignación"
                          onClick={() => model.openEdit(row)}
                          title="Editar"
                          tone="primary"
                        >
                          <Edit3 size={16} />
                        </RowActionButton>
                      </RowActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : null}
        </DataTableShell>
      </div>

      <ModalCrud
        isOpen={model.dialogOpen}
        onClose={model.closeDialog}
        title={dialogTitle}
      >
        <div className={styles.modalBody}>
          {model.mutationError ? <Alert>{model.mutationError}</Alert> : null}
          <TeachingAssignmentForm
            allowedKinds={model.allowedKinds}
            dialogMode={model.dialogMode}
            form={model.form}
            gradeLevel={model.gradeLevel}
            groups={model.groups}
            isSaving={model.isSaving}
            offeringOptions={model.offeringOptions}
            onCancel={model.closeDialog}
            onChange={model.patchForm}
            onSubmit={() => void model.submit()}
            periods={model.periods}
            teachers={model.teachers}
            teacherDisplayName={model.teacherDisplayName}
          />
        </div>
      </ModalCrud>
    </section>
  );
};
