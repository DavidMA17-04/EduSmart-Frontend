import {
  BookMarked,
  CalendarClock,
  CalendarRange,
  FileBarChart,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AdminNavItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  permission?: string;
  /** Hide when the session also has this permission (e.g. Admin bypass vs Docente own). */
  hideWhenPermission?: string;
};

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
): AdminNavItem[] {
  return items.filter((item) => {
    if (item.permission && !hasPermission(item.permission)) return false;
    if (item.hideWhenPermission && hasPermission(item.hideWhenPermission)) {
      return false;
    }
    return true;
  });
}
