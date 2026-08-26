import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_LABELS,
  PERMISSION_MODULES,
  PermissionToggle,
  buildPermissionMatrix,
  type Permission,
} from '@/entities/permission';
import styles from './PermissionMatrix.module.css';

interface PermissionMatrixProps {
  permissions: Permission[];
  selectedPermissionIds: number[];
  readOnly?: boolean;
  disabled?: boolean;
  onToggle: (permissionId: number, checked: boolean) => void;
}

export const PermissionMatrix = ({
  permissions,
  selectedPermissionIds,
  readOnly = false,
  disabled = false,
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

            const checked = selectedPermissionIds.includes(permission.id);
            return (
              <td key={action} className={styles.cell}>
                <PermissionToggle
                  action={action}
                  checked={checked}
                  disabled={!isInteractive}
                  onCheckedChange={(nextChecked) => onToggle(permission.id, nextChecked)}
                />
              </td>
            );
          })}
        </tr>)}</tbody>
      </table>
    </div>
  );
};
