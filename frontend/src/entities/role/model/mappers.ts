import type { Role } from './types';

export function normalizeRole(role: Role): Role {
  return {
    ...role,
    description: role.description ?? null,
    permissions: role.permissions ?? [],
  };
}