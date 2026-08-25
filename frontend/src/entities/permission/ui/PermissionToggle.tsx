import type { PermissionAction } from '../model/types';
import styles from './PermissionToggle.module.css';

interface PermissionToggleProps {
  action: PermissionAction;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const PermissionToggle = ({ action, checked, disabled = false, onCheckedChange }: PermissionToggleProps) => (
  <label aria-label={action} className={styles.switch}>
    <input
      checked={checked}
      disabled={disabled}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      type="checkbox"
    />
    <span aria-hidden="true" className={styles.slider} />
  </label>
);
