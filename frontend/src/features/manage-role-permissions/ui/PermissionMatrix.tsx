import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_LABELS,
  PERMISSION_MODULES,
  PermissionCheckbox,
  buildPermissionMatrix,
  type Permission,
} from '@/entities/permission';
import styles from './PermissionMatrix.module.css';

interface PermissionMatrixProps {
  permissions: Permission[];
  selectedPermissionIds: string[];
  disabled?: boolean;
  onToggle: (permissionId: string, checked: boolean) => void;
}

export const PermissionMatrix = ({ permissions, selectedPermissionIds, disabled = false, onToggle }: PermissionMatrixProps) => {
  const matrix = buildPermissionMatrix(permissions);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead><tr><th>Módulo</th>{PERMISSION_ACTIONS.map((action) => <th key={action}>{PERMISSION_ACTION_LABELS[action]}</th>)}</tr></thead>
        <tbody>{PERMISSION_MODULES.map((module) => <tr key={module}>
          <th scope="row"><strong>{PERMISSION_MODULE_LABELS[module]}</strong></th>
          {PERMISSION_ACTIONS.map((action) => {
            const permission = matrix[module][action];
            return <td key={action}>{permission ? <PermissionCheckbox action={action} checked={selectedPermissionIds.includes(permission.id)} disabled={disabled} onCheckedChange={(checked) => onToggle(permission.id, checked)} /> : <span className={styles.unavailable}>—</span>}</td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
  );
};
