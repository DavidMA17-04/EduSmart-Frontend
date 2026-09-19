import {
  BookMarked,
  BookOpen,
  CalendarClock,
  CalendarRange,
  FileBarChart,
  GraduationCap,
  KeyRound,
  Layers,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { STUDENT_ROLE_NAME } from '@/entities/role';
import { getSessionUser } from '@/shared/auth';

export type AdminNavItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  permission?: string;
  /** Hide when the session also has this permission (e.g. Admin bypass vs Docente own). */
  hideWhenPermission?: string;
  /** Show only when the session has an Estudiante / STUDENT role. */
  requireStudentRole?: boolean;
};

function roleMatches(role: string, ...candidates: string[]): boolean {
  const value = String(role).trim();
  const lower = value.toLowerCase();
  return candidates.some((c) => c === value || c.toLowerCase() === lower);
}

export function sessionRolesIncludeStudent(
  roles: readonly string[] | undefined,
): boolean {
  if (!roles?.length) return false;
  return roles.some((role) =>
    roleMatches(role, STUDENT_ROLE_NAME, 'Estudiante', 'STUDENT'),
  );
}

/** Sidebar items for AdminShell — filtered by sessionHasPermission when permission is set. */
export const adminNavigationItems: AdminNavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Usuarios', icon: Users, to: '/admin/users', permission: 'administrator.view' },
  {
    label: 'Roles y permisos',
    icon: ShieldCheck,
    to: '/admin/roles-permissions',
    permission: 'roles_permissions.view',
  },
  {
    label: 'Estructura académica',
    icon: GraduationCap,
    to: '/admin/specialties',
    permission: 'specialties.view',
  },
  {
    label: 'Materias',
    icon: BookOpen,
    to: '/admin/subjects',
    permission: 'academic_structure.view',
  },
  {
    label: 'Períodos académicos',
    icon: CalendarRange,
    to: '/admin/academic-periods',
    permission: 'periods.view',
  },
  {
    label: 'Niveles y secciones',
    icon: Layers,
    to: '/admin/sections-groups',
    permission: 'sections.view',
  },
  {
    label: 'Asignaciones académicas',
    icon: BookMarked,
    to: '/admin/teaching-assignments',
    permission: 'academic_structure.view',
  },
  {
    label: 'Horario',
    icon: CalendarClock,
    to: '/admin/schedule',
    permission: 'schedules.view',
  },
  {
    label: 'Mi horario',
    icon: CalendarClock,
    to: '/admin/my-schedule',
    permission: 'schedules.view_own',
    hideWhenPermission: 'schedules.view',
  },
  {
    label: 'Ingresar código',
    icon: KeyRound,
    to: '/admin/attendance/redeem',
    requireStudentRole: true,
  },
  {
    label: 'Asistencias',
    icon: UserCheck,
    to: '/admin/attendance',
    permission: 'attendance.view',
  },
  {
    label: 'Reportes',
    icon: FileBarChart,
    to: '/admin/reports',
    permission: 'administrator.view',
  },
  { label: 'Configuración', icon: Settings, to: '/admin/settings' },
];

export function filterAdminNavigation(
  items: AdminNavItem[],
  hasPermission: (permission: string) => boolean,
  roles?: readonly string[],
): AdminNavItem[] {
  const effectiveRoles = roles ?? getSessionUser()?.roles ?? [];
  return items.filter((item) => {
    if (item.permission && !hasPermission(item.permission)) return false;
    if (item.hideWhenPermission && hasPermission(item.hideWhenPermission)) {
      return false;
    }
    if (item.requireStudentRole && !sessionRolesIncludeStudent(effectiveRoles)) {
      return false;
    }
    return true;
  });
}
