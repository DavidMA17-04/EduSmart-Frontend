import type { AdministrativeUser } from '@/entities/user';

const STUDENT_ROLE = 'Estudiante';

export type EligibilityTone = 'apto' | 'no_apto' | 'pending';

export type EligibilityResult = {
  userId: number;
  tone: EligibilityTone;
  label: string;
  detail: string;
};

export function displayStudentName(user: AdministrativeUser): string {
  const parts = [
    user.name,
    user.first_lastname ?? user.lastName,
    user.second_lastname,
  ].filter((p) => Boolean(p && String(p).trim()));
  if (parts.length) return parts.join(' ');
  return user.email ?? `Usuario ${user.id}`;
}

export function matchesStudentSearch(
  user: AdministrativeUser,
  rawQuery: string,
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    user.name,
    user.firstName,
    user.lastName,
    user.first_lastname,
    user.second_lastname,
    user.email,
    user.nationalId,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function assessEnrollmentEligibility(
  user: AdministrativeUser,
  enrolledUserIds: Set<number>,
): EligibilityResult {
  if (user.status !== 'ACTIVE') {
    return {
      userId: user.id,
      tone: 'no_apto',
      label: 'No apto',
      detail: `Estado del usuario: ${user.status}. Debe estar ACTIVE.`,
    };
  }

  const hasStudentRole = user.roles.some(
    (r) => r.name === STUDENT_ROLE && r.status === 'ACTIVE',
  );
  if (!hasStudentRole) {
    return {
      userId: user.id,
      tone: 'no_apto',
      label: 'No apto',
      detail: 'El usuario no tiene el rol Estudiante activo.',
    };
  }

  if (enrolledUserIds.has(user.id)) {
    return {
      userId: user.id,
      tone: 'no_apto',
      label: 'No apto',
      detail: 'Ya está matriculado de forma activa en esta sección.',
    };
  }

  return {
    userId: user.id,
    tone: 'apto',
    label: 'Apto',
    detail: 'Listo para matricular en esta sección.',
  };
}

export function summarizeEligibility(results: EligibilityResult[]): {
  aptos: number;
  noAptos: number;
  total: number;
  percentAptos: number;
  allAptos: boolean;
} {
  const total = results.length;
  const aptos = results.filter((r) => r.tone === 'apto').length;
  const noAptos = total - aptos;
  const percentAptos = total === 0 ? 0 : Math.round((aptos / total) * 100);
  return {
    aptos,
    noAptos,
    total,
    percentAptos,
    allAptos: total > 0 && noAptos === 0,
  };
}
