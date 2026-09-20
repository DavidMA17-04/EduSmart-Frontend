import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_LABELS,
  PERMISSION_MODULES,
  PermissionToggle,
  PROTECTED_ADMIN_PERMISSION_TOOLTIP,
  buildPermissionMatrix,
  isProtectedAdminPermission,
  type Permission,
} from '@/entities/permission';
import styles from './PermissionMatrix.module.css';

interface PermissionMatrixProps {
  permissions: Permission[];
  selectedPermissionIds: number[];
  readOnly?: boolean;
  disabled?: boolean;
  /** Cuando true, los permisos críticos del Admin quedan marcados y no editables. */
  lockProtectedAdminPermissions?: boolean;
  onToggle: (permissionId: number, checked: boolean) => void;
}

export const PermissionMatrix = ({
  permissions,
  selectedPermissionIds,
  readOnly = false,
  disabled = false,
  lockProtectedAdminPermissions = false,
  onToggle,
}: PermissionMatrixProps) => {
  const matrix = buildPermissionMatrix(permissions);
  const isInteractive = !readOnly && !disabled;

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead><tr><th>Módulo</th>{PERMISSION_ACTIONS.map((action) => <th key={action}>{PERMISSION_ACTION_LABELS[action]}</th>)}</tr></thead>
        <tbody>{PERMISSION_MODULES.map((module) => <tr key={module}>
          <th scope="row"><strong>{PERMISSION_MODULE_LABELS[module]}</strong></th>
          {PERMISSION_ACTIONS.map((action) => {
            const permission = matrix[module][action];
            if (!permission) return <td key={action}><span className={styles.unavailable}>—</span></td>;

            const isProtected =
              lockProtectedAdminPermissions && isProtectedAdminPermission(permission.code);
            const checked = isProtected || selectedPermissionIds.includes(permission.id);
            const locked = isProtected;
            const toggleDisabled = !isInteractive || locked;

            return (
              <td key={action} className={styles.cell}>
                <PermissionToggle
                  action={action}
                  checked={checked}
                  disabled={toggleDisabled}
                  title={locked ? PROTECTED_ADMIN_PERMISSION_TOOLTIP : undefined}
                  onCheckedChange={(nextChecked) => {
                    if (locked) return;
                    onToggle(permission.id, nextChecked);
                  }}
                />
              </td>
            );
          })}
        </tr>)}</tbody>
      </table>
    </div>
  );
};
