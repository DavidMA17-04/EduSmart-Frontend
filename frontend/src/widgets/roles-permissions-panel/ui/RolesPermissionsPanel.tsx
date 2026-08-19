import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Input, Modal, Tabs } from '@/shared/ui';
import { RoleListItem, RoleStatusBadge } from '@/entities/role';
import { DuplicateRoleAction, RoleForm } from '@/features/manage-role';
import { PermissionMatrix } from '@/features/manage-role-permissions';
import { useRolesPermissionsPanel } from '../model/useRolesPermissionsPanel';
import styles from './RolesPermissionsPanel.module.css';

export const RolesPermissionsPanel = () => {
  const model = useRolesPermissionsPanel();
  const dialogTitle = model.dialogMode === 'create' ? 'Nuevo rol' : model.dialogMode === 'duplicate' ? 'Duplicar rol' : 'Editar rol';

  return <section className={styles.panel}>
    <Card className={styles.rolesColumn} padded={false}>
      <div className={styles.rolesHeader}><div><h2>Roles del sistema</h2><p>Administre los roles disponibles en la plataforma.</p></div><Button onClick={() => model.openDialog('create')} type="button"><Plus size={15} /> Nuevo rol</Button></div>
      <label className={styles.search}><Search size={15} /><Input aria-label="Buscar rol" onChange={(event) => model.setSearch(event.target.value)} placeholder="Buscar rol…" value={model.search} /></label>
      <div className={styles.roleList}>
        {model.isLoadingRoles && <p className={styles.muted}>Cargando roles…</p>}
        {model.rolesError && <Alert>{model.rolesError}</Alert>}
        {!model.isLoadingRoles && !model.rolesError && model.roles.map((role) => <RoleListItem isSelected={role.id === model.selectedRoleId} key={role.id} onSelect={model.selectRole} role={role} />)}
        {!model.isLoadingRoles && !model.rolesError && model.roles.length === 0 && <p className={styles.muted}>No hay roles que coincidan.</p>}
      </div>
    </Card>

    <div className={styles.detailColumn}>
      {!model.selectedRole && !model.isLoadingRoles && <Card><Alert>Seleccione un rol para administrar sus permisos.</Alert></Card>}
      {model.selectedRole && <>
        <Card className={styles.detailHeader}>
          <div><p className={styles.eyebrow}>Detalle del rol</p><h1>{model.selectedRole.name}</h1><p className={styles.description}>{model.selectedRole.description || 'Sin descripción registrada.'}</p><dl><div><dt>Estado</dt><dd><RoleStatusBadge status={model.selectedRole.status} /></dd></div><div><dt>Fecha de creación</dt><dd>{new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(new Date(model.selectedRole.createdAt))}</dd></div></dl></div>
          <div className={styles.actions}><Button onClick={() => model.openDialog('edit')} type="button" variant="secondary"><Edit3 size={14} /> Editar</Button><DuplicateRoleAction onDuplicate={() => model.openDialog('duplicate')} /><Button onClick={() => void model.deactivateSelectedRole()} type="button" variant="danger"><Trash2 size={14} /> Eliminar</Button></div>
        </Card>
        <Card className={styles.permissionsCard}>
          <Tabs items={[{ id: 'module', label: 'Permisos por módulo' }, { id: 'general', label: 'Permisos generales' }]} onChange={model.setActiveTab} value={model.activeTab} />
          <div className={styles.permissionsContent}>
            {model.permissionsError && <Alert>{model.permissionsError}</Alert>}
            {model.permissionMutationError && <Alert>{model.permissionMutationError}</Alert>}
            {model.activeTab === 'general' ? <Alert>Los permisos generales se administran mediante la misma matriz de módulos.</Alert> : <>
              <p className={styles.matrixIntro}>Configure las acciones permitidas para el rol seleccionado.</p>
              {model.isLoadingPermissions ? <p className={styles.muted}>Cargando catálogo de permisos…</p> : <PermissionMatrix disabled={model.isSavingPermissions} onToggle={model.togglePermission} permissions={model.permissions} selectedPermissionIds={model.selectedPermissionIds} />}
              <div className={styles.savePermissions}><Button disabled={model.isSavingPermissions || model.isLoadingPermissions} onClick={() => void model.savePermissions()} type="button">{model.isSavingPermissions ? 'Guardando…' : 'Guardar permisos'}</Button></div>
            </>}
          </div>
        </Card>
      </>}
    </div>

    <aside className={styles.infoColumn}><Card><h2>Información</h2><p>Los permisos determinan qué acciones puede realizar este rol en cada módulo.</p><ul><li>El permiso marcado está otorgado.</li><li>Los cambios se aplican a usuarios con este rol.</li></ul></Card></aside>

    <Modal isOpen={model.dialogMode !== null} onClose={model.closeDialog} title={dialogTitle}>
      {model.mutationError && <Alert>{model.mutationError}</Alert>}
      <RoleForm isSubmitting={model.isSubmitting} onCancel={model.closeDialog} onChange={model.roleForm.setField} onSubmit={model.roleForm.submit} submitLabel={model.dialogMode === 'create' ? 'Crear rol' : model.dialogMode === 'duplicate' ? 'Duplicar rol' : 'Guardar cambios'} values={model.roleForm.values} />
    </Modal>
  </section>;
};
