import { digitsOnly, isValidNationalId } from '@/features/manage-user/model/userFormRules';

/** Destino del foco inicial en el formulario de credenciales (solo al entrar al paso). */
export function loginInitialFocusTarget(identifier: string): 'identifier' | 'password' {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return 'identifier';
  }
  if (!isValidNationalId(digitsOnly(trimmed))) {
    return 'identifier';
  }
  return 'password';
}
