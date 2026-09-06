import { useEffect, useState } from 'react';
import { Edit3, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, ModalCrud, useToast } from '@/shared/ui';
import { RoleListItem, RoleStatusBadge } from '@/entities/role';
import { DuplicateRoleAction, RoleForm } from '@/features/manage-role';
import { PermissionMatrix } from '@/features/manage-role-permissions';
import { useRolesPermissionsPanel } from '../model/useRolesPermissionsPanel';
import styles from './RolesPermissionsPanel.module.css';

export const RolesPermissionsPanel = () => {
  const model = useRolesPermissionsPanel();
  const toast = useToast();
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const dialogTitle = model.dialogMode === 'create' ? 'Nuevo rol' : model.dialogMode === 'duplicate' ? 'Duplicar rol' : 'Editar rol';

  useEffect(() => {
    if (model.saveMessage) {
      toast.push(model.saveMessage, 'success');
    }
  }, [model.saveMessage, toast]);

  const handleConfirmDeactivate = async () => {
    await model.deactivateSelectedRole();
    setConfirmDeactivateOpen(false);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.sidebarColumn}>
        <Card className={styles.rolesColumn} padded={false}>
          <div className={styles.rolesHeader}>
            <div>
              <h2>Roles del sistema</h2>
              <p>Administre los roles disponibles en la plataforma.</p>
            </div>
            <Button onClick={() => model.openDialog('create')} type="button">
              <Plus size={15} /> Nuevo rol
            </Button>
          </div>
          <label className={styles.search}>
            <Search size={15} />
            <Input
              aria-label="Buscar rol"
              onChange={(event) => model.setSearch(event.target.value)}
              placeholder="Buscar rol…"
              value={model.search}
            />
          </label>
          <div className={styles.roleList}>
            {model.isLoadingRoles && <p className={styles.muted}>Cargando roles…</p>}
            {model.rolesError && <Alert>{model.rolesError}</Alert>}
            {!model.isLoadingRoles && !model.rolesError && model.roles.map((role) => (
              <RoleListItem
                isSelected={role.id === model.selectedRoleId}
                key={role.id}
                onSelect={model.selectRole}
                role={role}
              />
            ))}
            {!model.isLoadingRoles && !model.rolesError && model.roles.length === 0 && (
              <EmptyState
                action={
                  model.search.trim()
                    ? { label: 'Limpiar búsqueda', onClick: () => model.setSearch('') }
                    : { label: 'Nuevo rol', onClick: () => model.openDialog('create'), icon: Plus }
                }
                description={
                  model.search.trim()
                    ? 'No hay roles que coincidan con la búsqueda.'
                    : 'Aún no hay roles activos en la plataforma.'
                }
                icon={ShieldCheck}
                title="Sin roles"
              />
            )}
          </div>
        </Card>

        <Card className={styles.infoCard}>
          <h2>Información</h2>
          <p>Los permisos determinan qué acciones puede realizar este rol en cada módulo.</p>
          <ul>
            <li>El permiso activo está otorgado.</li>
            <li>Los cambios se aplican a usuarios con este rol.</li>
          </ul>
        </Card>
      </div>

      <div className={styles.detailColumn}>
        {!model.selectedRole && !model.isLoadingRoles && (
          <Card className={styles.emptyDetail}><Alert>Seleccione un rol para administrar sus permisos.</Alert></Card>
        )}
        {model.selectedRole && (
          <>
            <Card className={styles.detailHeader}>
              <div className={styles.detailTop}>
                <div className={styles.detailIdentity}>
                  <p className={styles.eyebrow}>Detalle del rol</p>
                  <h1>{model.selectedRole.name}</h1>
                  <p className={styles.description}>
                    {model.selectedRole.description || 'Sin descripción registrada.'}
                  </p>
                </div>
                <div className={styles.actions}>
                  <Button onClick={() => model.openDialog('edit')} type="button" variant="secondary">
                    <Edit3 size={14} /> Editar
                  </Button>
                  <DuplicateRoleAction onDuplicate={() => model.openDialog('duplicate')} />
                  <Button onClick={() => setConfirmDeactivateOpen(true)} type="button" variant="danger">
                    <Trash2 size={14} /> Eliminar
                  </Button>
                </div>
              </div>
              <dl className={styles.detailMeta}>
                <div>
                  <dt>Estado</dt>
                  <dd><RoleStatusBadge status={model.selectedRole.status} /></dd>
                </div>
                <div>
                  <dt>Fecha de creación</dt>
                  <dd>
                    {new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(new Date(model.selectedRole.createdAt))}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className={styles.permissionsCard}>
              <div className={styles.permissionsTitle}>
                <h2>Permisos por módulo</h2>
              </div>
              <div className={styles.permissionsContent}>
                {model.permissionsError && <Alert>{model.permissionsError}</Alert>}
                {model.error && <Alert>{model.error}</Alert>}
                <div className={styles.matrixHeader}>
                  <p className={styles.matrixIntro}>
                    {model.isEditing
                      ? 'Active o desactive las acciones permitidas y guarde los cambios.'
                      : `${model.grantedCount} permiso${model.grantedCount === 1 ? '' : 's'} otorgado${model.grantedCount === 1 ? '' : 's'} para este rol.`}
                  </p>
                  {!model.isEditing && !model.isLoadingPermissions && (
                    <Button onClick={model.startEditing} type="button" variant="secondary">
                      <Edit3 size={14} /> Editar permisos
                    </Button>
                  )}
                </div>
                {model.isLoadingPermissions ? (
                  <p className={styles.muted}>Cargando catálogo de permisos…</p>
                ) : (
                  <PermissionMatrix
                    disabled={model.isSaving}
                    onToggle={model.togglePermission}
                    permissions={model.permissions}
                    readOnly={!model.isEditing}
                    selectedPermissionIds={model.selectedPermissionIds}
                  />
                )}
                {model.isEditing && (
                  <div className={styles.savePermissions}>
                    <Button disabled={model.isSaving || model.isLoadingPermissions || !model.hasChanges} onClick={() => void model.save()} type="button">
                      {model.isSaving ? 'Guardando…' : 'Guardar permisos'}
                    </Button>
                    <Button disabled={model.isSaving || model.isLoadingPermissions} onClick={model.cancelEditing} type="button" variant="secondary">
                      Cancelar
                    </Button>
                    <Button disabled={model.isSaving || model.isLoadingPermissions} onClick={model.clearAll} type="button" variant="secondary">
                      Quitar todos
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      <ModalCrud isOpen={model.dialogMode !== null} onClose={model.closeDialog} title={dialogTitle}>
        {model.mutationError && <Alert>{model.mutationError}</Alert>}
        <RoleForm
          isSubmitting={model.isSubmitting}
          onCancel={model.closeDialog}
          onChange={model.roleForm.setField}
          onSubmit={model.roleForm.submit}
          submitLabel={model.dialogMode === 'create' ? 'Crear rol' : model.dialogMode === 'duplicate' ? 'Duplicar rol' : 'Guardar cambios'}
          values={model.roleForm.values}
        />
      </ModalCrud>

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Inactivar"
        icon={Trash2}
        isOpen={confirmDeactivateOpen}
        isSubmitting={model.isSubmitting}
        message={
          model.selectedRole
            ? `¿Inactivar el rol ${model.selectedRole.name}?`
            : '¿Inactivar este rol?'
        }
        onCancel={() => setConfirmDeactivateOpen(false)}
        onConfirm={() => void handleConfirmDeactivate()}
        secondary="El rol dejará de estar disponible para asignaciones."
        title="Inactivar rol"
        tone="danger"
      />
    </section>
  );
};
