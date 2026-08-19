import { Checkbox } from '@/shared/ui';
import type { PermissionAction } from '../model/types';

interface PermissionCheckboxProps {
  action: PermissionAction;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const PermissionCheckbox = ({ action, checked, disabled = false, onCheckedChange }: PermissionCheckboxProps) => (
  <label aria-label={action}>
    <Checkbox checked={checked} disabled={disabled} onChange={(event) => onCheckedChange?.(event.target.checked)} />
  </label>
);