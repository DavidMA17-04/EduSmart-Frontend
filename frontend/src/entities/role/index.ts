export type { CreateRolePayload, Role, RoleStatus, UpdateRolePayload } from './model/types';
export { normalizeRole } from './model/mappers';
export {
  ADMIN_ROLE_NAME,
  STUDENT_ROLE_NAME,
  TEACHER_ROLE_NAME,
} from './model/systemRoles';
export { RoleListItem } from './ui/RoleListItem';
export { RoleStatusBadge } from './ui/RoleStatusBadge';