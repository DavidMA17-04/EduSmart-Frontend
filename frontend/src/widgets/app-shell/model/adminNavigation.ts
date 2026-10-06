import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  ClipboardList,
  CalendarClock,
  CalendarRange,
  FileBarChart,
  GraduationCap,
  History,
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

export type AdminNavGroupId = 'users' | 'academic' | 'attendance';

export type AdminNavItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  permission?: string;
  /** Show if the session has ANY of these permissions. */
  anyOfPermissions?: readonly string[];
  /** Hide when the session also has this permission (e.g. Admin bypass vs Docente own). */
  hideWhenPermission?: string;
  /** Show only when the session has an Estudiante / STUDENT role. */
  requireStudentRole?: boolean;
  /** staff = administrador y docente. student = solo el alumno, sin vista de personal. */
  audience?: 'staff' | 'student' | 'all';
  /** Collapsible sidebar section. Shown as a group only when the lead and at least one child are visible. */
  group?: AdminNavGroupId;
  /** Main link of a group; children appear when it is expanded. */
  groupLead?: boolean;
};

export type AdminNavEntry =
  | { type: 'link'; item: AdminNavItem }
  | {
      type: 'group';
      id: AdminNavGroupId;
      lead: AdminNavItem;
      children: AdminNavItem[];
    };

function roleMatches(role: string, ...candidates: string[]): boolean {
  const value = String(role).trim();
  const lower = value.toLowerCase();
  return candidates.some((c) => c === value || c.toLowerCase() === lower);
}

/** Pantalla de inicio del alumno: horario propio, historial o canje. */
export function studentHomePath(
  hasPermission: (permission: string) => boolean,
): string {
  if (
    hasPermission('schedules.view_own') &&
    !hasPermission('schedules.view')
  ) {
    return '/admin/my-schedule';
  }
  if (
    hasPermission('attendance.view_own') ||
    hasPermission('attendance.view')
  ) {
    return '/admin/attendance/history';
  }
  return '/admin/attendance/redeem';
}

export type RoleAudience = 'admin' | 'teacher' | 'student';

export function resolveRoleAudience(
  roles?: readonly string[],
): RoleAudience {
  const effective = roles ?? getSessionUser()?.roles ?? [];
  if (effective.some((role) => roleMatches(role, 'Administrador', 'ADMIN'))) {
    return 'admin';
  }
  if (effective.some((role) => roleMatches(role, 'Docente', 'TEACHER'))) {
    return 'teacher';
  }
  if (sessionRolesIncludeStudent(effective)) return 'student';
  return 'admin';
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
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', audience: 'staff' },
  {
    label: 'Usuarios',
    icon: Users,
    to: '/admin/users',
    permission: 'administrator.view',
    group: 'users',
    groupLead: true,
    audience: 'staff',
  },
  {
    label: 'Roles y permisos',
    icon: ShieldCheck,
    to: '/admin/roles-permissions',
    permission: 'roles_permissions.view',
    group: 'users',
    audience: 'staff',
  },
  {
    label: 'Estructura académica',
    icon: GraduationCap,
    to: '/admin/specialties',
    permission: 'specialties.view',
    group: 'academic',
    groupLead: true,
    audience: 'staff',
  },
  {
    label: 'Materias',
    icon: BookOpen,
    to: '/admin/subjects',
    permission: 'academic_structure.view',
    group: 'academic',
    audience: 'staff',
  },
  {
    label: 'Cursos lectivos',
    icon: CalendarRange,
    to: '/admin/academic-periods',
    permission: 'periods.view',
    group: 'academic',
    audience: 'staff',
  },
  {
    label: 'Configurar ciclo',
    icon: CalendarClock,
    to: '/admin/academic-structure-wizard',
    permission: 'periods.view',
    group: 'academic',
    audience: 'staff',
  },
  {
    label: 'Niveles y secciones',
    icon: Layers,
    to: '/admin/sections-groups',
    permission: 'sections.view',
    group: 'academic',
    audience: 'staff',
  },
  {
    label: 'Asignaciones académicas',
    icon: BookMarked,
    to: '/admin/teaching-assignments',
    permission: 'academic_structure.view',
    group: 'academic',
    audience: 'staff',
  },
  {
    label: 'Horario',
    icon: CalendarClock,
    to: '/admin/schedule',
    permission: 'schedules.view',
    group: 'academic',
    audience: 'staff',
  },
  {
    label: 'Mi horario',
    icon: CalendarClock,
    to: '/admin/my-schedule',
    permission: 'schedules.view_own',
    hideWhenPermission: 'schedules.view',
    group: 'academic',
  },
  {
    label: 'Asistencias',
    icon: UserCheck,
    to: '/admin/attendance',
    permission: 'attendance.view',
    group: 'attendance',
    groupLead: true,
    audience: 'staff',
  },
  {
    label: 'Historial de asistencia',
    icon: History,
    to: '/admin/attendance/history',
    anyOfPermissions: ['attendance.view_own', 'attendance.view'],
    group: 'attendance',
  },
  {
    label: 'Alertas de ausentismo',
    icon: AlertTriangle,
    to: '/admin/attendance/alerts',
    permission: 'attendance.view',
    group: 'attendance',
    audience: 'staff',
  },
  {
    label: 'Indicadores',
    icon: FileBarChart,
    to: '/admin/attendance/reports',
    permission: 'attendance.view',
    group: 'attendance',
    audience: 'staff',
  },
  {
    label: 'Justificaciones',
    icon: ClipboardList,
    to: '/admin/attendance/justifications',
    anyOfPermissions: ['attendance.justify', 'attendance.review', 'attendance.view'],
    group: 'attendance',
  },
  {
    label: 'Ingresar código',
    icon: KeyRound,
    to: '/admin/attendance/redeem',
    requireStudentRole: true,
    audience: 'student',
    group: 'attendance',
  },
  {
    label: 'Reportes',
    icon: FileBarChart,
    to: '/admin/reports',
    permission: 'administrator.view',
    audience: 'staff',
  },
  { label: 'Configuración', icon: Settings, to: '/admin/settings' },
];

export function filterAdminNavigation(
  items: AdminNavItem[],
  hasPermission: (permission: string) => boolean,
  roles?: readonly string[],
  audience?: RoleAudience,
): AdminNavItem[] {
  const effectiveRoles = roles ?? getSessionUser()?.roles ?? [];
  const resolvedAudience = audience ?? resolveRoleAudience(effectiveRoles);
  const studentOnly = resolvedAudience === 'student';
  return items.filter((item) => {
    if (item.anyOfPermissions?.length) {
      if (!item.anyOfPermissions.some((code) => hasPermission(code))) {
        return false;
      }
    } else if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.hideWhenPermission && hasPermission(item.hideWhenPermission)) {
      return false;
    }
    if (item.requireStudentRole && !sessionRolesIncludeStudent(effectiveRoles)) {
      return false;
    }
    if (item.audience === 'staff' && studentOnly) return false;
    if (item.audience === 'student' && !studentOnly) return false;
    return true;
  });
}

/** Fold related items under their lead. A group without a visible lead stays as plain links. */
export function groupAdminNavigation(items: AdminNavItem[]): AdminNavEntry[] {
  const byGroup = new Map<AdminNavGroupId, AdminNavItem[]>();
  for (const item of items) {
    if (!item.group) continue;
    const members = byGroup.get(item.group) ?? [];
    members.push(item);
    byGroup.set(item.group, members);
  }

  const emitted = new Set<AdminNavGroupId>();
  const entries: AdminNavEntry[] = [];

  for (const item of items) {
    if (!item.group) {
      entries.push({ type: 'link', item });
      continue;
    }
    if (emitted.has(item.group)) continue;
    emitted.add(item.group);

    const members = byGroup.get(item.group) ?? [];
    const lead = members.find((member) => member.groupLead);
    const children = members.filter((member) => member !== lead);
    if (lead && children.length > 0) {
      entries.push({ type: 'group', id: item.group, lead, children });
    } else {
      for (const member of members) {
        entries.push({ type: 'link', item: member });
      }
    }
  }

  return entries;
}
