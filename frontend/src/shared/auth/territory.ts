/** Canonical role → house (prefix + home). Fase 2 splits staff prefixes. */

export type TerritoryHouse =
  | 'admin'
  | 'teacher'
  | 'counselor'
  | 'director'
  | 'student'
  | 'guardian';

export type TerritoryTree =
  | '/admin'
  | '/teacher'
  | '/counselor'
  | '/director'
  | '/student'
  | '/guardian';

export type SessionLike = {
  roles?: readonly string[] | null;
  mustChangePassword?: boolean;
} | null | undefined;

type HouseSlot = {
  prefix: TerritoryTree;
  home: string;
};

const HOUSE_TABLE: Record<TerritoryHouse, HouseSlot> = {
  admin: { prefix: '/admin', home: '/admin' },
  teacher: { prefix: '/teacher', home: '/teacher' },
  counselor: { prefix: '/counselor', home: '/counselor' },
  director: { prefix: '/director', home: '/director' },
  student: { prefix: '/student', home: '/student' },
  guardian: { prefix: '/guardian', home: '/guardian' },
};

/** Admin > Director > Orientador > Docente > Encargado > Estudiante */
const HOUSE_PRIORITY: { house: TerritoryHouse; aliases: string[] }[] = [
  { house: 'admin', aliases: ['Administrador', 'ADMIN'] },
  { house: 'director', aliases: ['Director'] },
  { house: 'counselor', aliases: ['Orientador', 'COUNSELOR'] },
  { house: 'teacher', aliases: ['Docente', 'TEACHER'] },
  { house: 'guardian', aliases: ['Encargado', 'Padre de familia', 'GUARDIAN'] },
  { house: 'student', aliases: ['Estudiante', 'STUDENT'] },
];

export const STAFF_HOUSES: readonly TerritoryHouse[] = [
  'admin',
  'teacher',
  'counselor',
  'director',
];

export const TREE_ALLOWLIST: Record<TerritoryTree, readonly TerritoryHouse[]> = {
  '/admin': ['admin'],
  '/teacher': ['teacher'],
  '/counselor': ['counselor'],
  '/director': ['director'],
  '/student': ['student'],
  '/guardian': ['guardian'],
};

const STUDENT_LEGACY: { from: string; to: string }[] = [
  { from: '/admin/attendance/redeem', to: '/student/attendance/redeem' },
  { from: '/admin/attendance/history', to: '/student/attendance' },
  { from: '/admin/attendance/justifications', to: '/student/attendance/justifications' },
  { from: '/admin/my-schedule', to: '/student/schedule' },
  { from: '/admin/discipline/history', to: '/student/discipline' },
  { from: '/admin/settings', to: '/student/settings' },
  { from: '/admin/profile', to: '/student/profile' },
];

const GUARDIAN_LEGACY: { from: string; to: string }[] = [
  { from: '/admin/discipline/notifications', to: '/guardian/discipline/notifications' },
  { from: '/admin/discipline/history', to: '/guardian/discipline' },
  { from: '/admin/attendance/history', to: '/guardian/attendance' },
  { from: '/admin/attendance/justifications', to: '/guardian/attendance' },
  { from: '/admin/settings', to: '/guardian/settings' },
  { from: '/admin/profile', to: '/guardian/profile' },
];

function roleMatches(role: string, ...candidates: string[]): boolean {
  const value = String(role).trim();
  const lower = value.toLowerCase();
  return candidates.some((candidate) => candidate === value || candidate.toLowerCase() === lower);
}

export function resolveHouse(
  roles?: readonly string[] | null,
): TerritoryHouse | null {
  if (!roles?.length) return null;
  for (const entry of HOUSE_PRIORITY) {
    if (roles.some((role) => roleMatches(role, ...entry.aliases))) {
      return entry.house;
    }
  }
  return null;
}

export function housePrefix(house: TerritoryHouse): TerritoryTree {
  return HOUSE_TABLE[house].prefix;
}

export function houseHome(house: TerritoryHouse): string {
  return HOUSE_TABLE[house].home;
}

export function settingsPath(house: TerritoryHouse): string {
  return `${housePrefix(house)}/settings`;
}

export function profilePath(house: TerritoryHouse): string {
  return `${housePrefix(house)}/profile`;
}

export function houseHomeOrLogin(roles?: readonly string[] | null): string {
  const house = resolveHouse(roles);
  return house ? houseHome(house) : '/login';
}

export function isStaffHouse(house: TerritoryHouse | null): boolean {
  return house !== null && STAFF_HOUSES.includes(house);
}

/** Rewrite a canonical `/admin/...` path into another staff house prefix. */
export function relocateAdminPath(pathname: string, prefix: string): string {
  if (prefix === '/admin') return pathname;
  if (pathname === '/admin') return prefix;
  if (pathname.startsWith('/admin/')) {
    return `${prefix}${pathname.slice('/admin'.length)}`;
  }
  return pathname;
}

export function isAllowedInHouse(house: TerritoryHouse, path: string): boolean {
  const prefix = housePrefix(house);
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isForcedPasswordPathAllowed(
  pathname: string,
  house: TerritoryHouse,
): boolean {
  return pathname === settingsPath(house) || pathname === profilePath(house);
}

export function destinationForSession(user: SessionLike): string {
  if (!user) return '/login';
  const house = resolveHouse(user.roles);
  if (!house) return '/login';
  if (user.mustChangePassword) return settingsPath(house);
  return houseHome(house);
}

/** Honor `state.from` / `?from=` only when it stays in the session house. */
export function coerceReturnPath(user: SessionLike, from?: string | null): string {
  const dest = destinationForSession(user);
  if (!from || !from.startsWith('/')) return dest;
  const house = user ? resolveHouse(user.roles) : null;
  if (!house) return '/login';
  if (!isAllowedInHouse(house, from)) return dest;
  return from;
}

const TREE_PREFIXES: readonly TerritoryTree[] = [
  '/admin',
  '/teacher',
  '/counselor',
  '/director',
  '/student',
  '/guardian',
];

export function treeFromPath(pathname: string): TerritoryTree | null {
  for (const prefix of TREE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return prefix;
  }
  return null;
}

function rewriteLegacy(
  pathname: string,
  rules: { from: string; to: string }[],
): string | null {
  const normalized = pathname.replace(/\/+$/, '') || pathname;
  for (const rule of rules) {
    if (normalized === rule.from) return rule.to;
    if (normalized.startsWith(`${rule.from}/`)) return rule.to;
  }
  return null;
}

function isAdminRedeemPath(pathname: string): boolean {
  return (
    pathname === '/admin/attendance/redeem' ||
    pathname.startsWith('/admin/attendance/redeem/')
  );
}

export function mapLegacyPath(pathname: string, house: TerritoryHouse): string {
  if (house === 'student' || house === 'guardian') {
    const module = /^\/admin\/(communications|discipline\/appeals|discipline\/cases)(.*)$/.exec(pathname);
    if (module) {
      const [, family, suffix] = module;
      const allowed = family === 'communications'
        ? suffix === '' || suffix === '/'
        : family === 'discipline/cases'
          ? /^\/\d+\/?$/.test(suffix)
          : suffix === '' || suffix === '/' || suffix === '/new' || /^\/\d+\/?$/.test(suffix);
      return allowed ? housePrefix(house) + '/' + family + suffix : houseHome(house);
    }
  }
  if (house === 'student') {
    return rewriteLegacy(pathname, STUDENT_LEGACY) ?? houseHome(house);
  }
  if (house === 'guardian') {
    return rewriteLegacy(pathname, GUARDIAN_LEGACY) ?? houseHome(house);
  }
  if (isAdminRedeemPath(pathname)) {
    return houseHome(house);
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (house === 'admin') return pathname;
    const relocated = relocateAdminPath(pathname, housePrefix(house));
    if (relocated === housePrefix(house)) {
      return houseHome(house);
    }
    return relocated;
  }
  return houseHome(house);
}

/**
 * TerritoryGuard bounce. `null` = stay (session may render the route).
 * Never logs out; unknown house → `/login`.
 */
export function resolveTerritoryNavigation(
  pathname: string,
  roles?: readonly string[] | null,
): string | null {
  const house = resolveHouse(roles);
  if (!house) return '/login';

  const tree = treeFromPath(pathname);
  if (!tree) return null;

  if (!TREE_ALLOWLIST[tree].includes(house)) {
    return mapLegacyPath(pathname, house);
  }

  if (tree === '/admin' && isAdminRedeemPath(pathname)) {
    return houseHome(house);
  }

  return null;
}
