import { BookOpen, Edit3, Plus, Trash2 } from 'lucide-react';
import { useSubjectsPanel } from '@/features/manage-subject';
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  DataTableShell,
  EmptyState,
  FormActions,
  Input,
  ModalCrud,
  Pagination,
  RowActionButton,
  RowActions,
  Select,
  Table,
} from '@/shared/ui';
import styles from './SubjectsPanel.module.css';

export const SubjectsPanel = () => {
  const model = useSubjectsPanel();
  const dialogTitle =
    model.dialogMode === 'create' ? 'Nueva materia' : 'Editar materia';
  const submitLabel =
    model.dialogMode === 'create' ? 'Crear materia' : 'Guardar cambios';
  const hasFilters =
    Boolean(model.search.trim()) || model.statusFilter !== 'ALL';

  return (
    <section className={styles.layout}>
      <DataTableShell
        footer={
          model.totalPages > 1 ? (
            <Pagination
              currentPage={model.page}
              onPageChange={model.setPage}
              totalPages={model.totalPages}
            />
          ) : null
        }
        toolbar={
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <Input
                aria-label="Buscar materia"
                onChange={(e) => model.setSearch(e.target.value)}
                placeholder="Buscar por nombre o código…"
                value={model.search}
              />
              <Select
                aria-label="Filtrar por estado"
                onChange={(e) =>
                  model.setStatusFilter(
                    e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE',
                  )
                }
                value={model.statusFilter}
              >
                <option value="ALL">Estado: Todos</option>
                <option value="ACTIVE">Activas</option>
                <option value="INACTIVE">Inactivas</option>
              </Select>
            </div>
            <Button onClick={model.openCreate} type="button">
              <Plus size={16} />
              Nueva materia
            </Button>
          </div>
        }
      >
        {model.error ? <Alert>{model.error}</Alert> : null}

        {model.isLoading ? (
          <p className={styles.muted}>Cargando materias…</p>
        ) : null}

        {!model.isLoading && model.rows.length === 0 ? (
          <EmptyState
            action={
              hasFilters
                ? undefined
                : {
                    label: 'Nueva materia',
                    onClick: model.openCreate,
                    icon: Plus,
                  }
            }
            description={
              hasFilters
                ? 'No hay resultados con esos filtros.'
                : 'Crea materias regulares (por ejemplo Matemática, Español) para poder asignarlas a docentes.'
            }
            icon={BookOpen}
            title="Sin materias"
          />
        ) : null}

        {!model.isLoading && model.rows.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Nombre de la materia</th>
                <th>Código</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.code ?? '—'}</td>
                  <td>
                    <Badge
                      tone={row.status === 'ACTIVE' ? 'success' : 'neutral'}
                    >
                      {row.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td>
                    <RowActions>
                      <RowActionButton
                        aria-label={`Editar ${row.name}`}
                        onClick={() => model.openEdit(row)}
                        title="Editar"
                        tone="primary"
                      >
                        <Edit3 size={16} />
                      </RowActionButton>
                      <RowActionButton
                        aria-label={`Inactivar ${row.name}`}
                        onClick={() => model.requestDeactivate(row)}
                        title="Inactivar"
                        tone="danger"
                      >
                        <Trash2 size={16} />
                      </RowActionButton>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
      </DataTableShell>

      <ModalCrud
        isOpen={model.dialogMode !== null}
        onClose={model.closeDialog}
        title={dialogTitle}
      >
        <div className={styles.modalBody}>
          {model.mutationError ? <Alert>{model.mutationError}</Alert> : null}
          <form className={styles.form} onSubmit={(e) => void model.submit(e)}>
            <label>
              Nombre de la materia
              <Input
                maxLength={150}
                onChange={(e) => model.setField('name', e.target.value)}
                placeholder="Ej. Matemática"
                ref={model.nameInputRef}
                required
                value={model.form.name}
              />
            </label>
            <label>
              Código (opcional)
              <Input
                maxLength={30}
                onChange={(e) => model.setField('code', e.target.value)}
                placeholder="Ej. MAT-01"
                value={model.form.code}
              />
            </label>
            <label>
              Estado
              <Select
                onChange={(e) =>
                  model.setField(
                    'status',
                    e.target.value as 'ACTIVE' | 'INACTIVE',
                  )
                }
                value={model.form.status}
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </Select>
            </label>
            <FormActions
              isSubmitting={model.isSubmitting}
              onCancel={model.closeDialog}
              submitLabel={submitLabel}
            />
          </form>
        </div>
      </ModalCrud>

      <ConfirmDialog
        confirmLabel="Inactivar"
        icon={Trash2}
        isOpen={model.pendingDeactivate !== null}
        isSubmitting={model.isSubmitting}
        message={`¿Inactivar la materia ${model.pendingDeactivate?.name ?? ''}?`}
        onCancel={model.cancelDeactivate}
        onConfirm={() => void model.confirmDeactivate()}
        secondary="Dejará de estar disponible para nuevas asignaciones académicas."
        title="Inactivar materia"
        tone="danger"
      />
    </section>
  );
};
