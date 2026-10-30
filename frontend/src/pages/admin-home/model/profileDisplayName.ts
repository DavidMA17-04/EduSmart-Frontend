export function profileDisplayName(
  user:
    | {
        name?: string | null;
        first_lastname?: string | null;
        email?: string | null;
        roles?: readonly string[] | null;
      }
    | null
    | undefined,
  fallback = 'Administrador',
): string {
  const composed = [user?.name?.trim(), user?.first_lastname?.trim()].filter(Boolean).join(' ');
  if (composed) return composed;
  if (user?.email?.trim()) return user.email.trim();
  return fallback;
}
