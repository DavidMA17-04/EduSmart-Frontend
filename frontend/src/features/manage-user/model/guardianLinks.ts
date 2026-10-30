import { HttpError } from '@/shared/api';
import type { GuardianStudentLink } from '../api/guardianLinkApi';

const GUARDIAN_ALIASES = ['encargado', 'padre de familia', 'guardian'];
const STUDENT_ALIASES = ['estudiante', 'student'];

export function isGuardianRoleName(name: string | null | undefined): boolean {
  return GUARDIAN_ALIASES.includes(String(name ?? '').trim().toLowerCase());
}

export function isStudentRoleName(name: string | null | undefined): boolean {
  return STUDENT_ALIASES.includes(String(name ?? '').trim().toLowerCase());
}

export function counterpartOfLink(link: GuardianStudentLink, userId: number) {
  return link.guardianUserId === userId ? link.student : link.guardian;
}

export function representedStudentsOf(
  links: readonly GuardianStudentLink[],
  guardianUserId: number,
) {
  return links
    .filter((row) => row.guardianUserId === guardianUserId)
    .map((row) => ({
      linkId: row.id,
      relationship: row.relationship,
      ...row.student,
    }));
}

export function applyCreatedLink(
  links: readonly GuardianStudentLink[],
  created: GuardianStudentLink,
): GuardianStudentLink[] {
  if (links.some((row) => row.id === created.id)) return [...links];
  return [...links, created];
}

export function applyRemovedLink(
  links: readonly GuardianStudentLink[],
  linkId: number,
): GuardianStudentLink[] {
  return links.filter((row) => row.id !== linkId);
}

export function guardianLinkErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 409) {
      return error.message || 'Este encargado ya está vinculado con este estudiante.';
    }
    return error.message;
  }
  return 'No se pudo completar la operación del vínculo.';
}

export function canMutateGuardianLinks(hasAdministratorEdit: boolean): boolean {
  return hasAdministratorEdit;
}
