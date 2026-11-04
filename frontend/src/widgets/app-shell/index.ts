export { AdminShell } from './ui/AdminShell';
export { RoleShell } from './ui/RoleShell';
export { RoleGate, StaffOnly, useRoleAudience } from './ui/roleAudience';
export {
  adminNavigationItems,
  filterAdminNavigation,
  sessionRolesIncludeStudent,
  staffPathForSession,
  type AdminNavItem,
} from './model/adminNavigation';
export {
  coerceReturnPath,
  destinationForSession,
  houseHome,
  houseHomeOrLogin,
  resolveHouse,
  resolveTerritoryNavigation,
  settingsPath,
} from './model/territory';