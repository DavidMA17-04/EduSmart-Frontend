export const NOTIFICATION_KIND_LABELS: Record<string, string> = {
  DIRECT_REPRIMAND: 'Amonestación directa',
  FORMAL_CHARGE: 'Comunicación formal',
  RESOLUTION: 'Resolución',
  APPEAL_RESOLUTION: 'Resolución de recurso',
  PRECAUTIONARY: 'Retiro precautorio',
};

export const GUARDIAN_TEXT_MIN = 10;
export const GUARDIAN_TEXT_MAX = 4000;
export const DEFENSE_FILE_LIMIT = 3;

export function notificationKindLabel(kind: string): string {
  return NOTIFICATION_KIND_LABELS[kind] ?? kind;
}

export function validateGuardianText(value: string): string | null {
  const text = value.trim();
  if (text.length < GUARDIAN_TEXT_MIN) return `Escriba al menos ${GUARDIAN_TEXT_MIN} caracteres.`;
  if (text.length > GUARDIAN_TEXT_MAX) return `El texto no puede superar ${GUARDIAN_TEXT_MAX} caracteres.`;
  return null;
}

export function limitDefenseFiles(files: File[]): File[] {
  return files.slice(0, DEFENSE_FILE_LIMIT);
}

export const DISCIPLINE_NOTIFICATIONS_CHANGED = 'edusmart:discipline-notifications';

export function notifyDisciplineInboxChanged(): void {
  window.dispatchEvent(new Event(DISCIPLINE_NOTIFICATIONS_CHANGED));
}
