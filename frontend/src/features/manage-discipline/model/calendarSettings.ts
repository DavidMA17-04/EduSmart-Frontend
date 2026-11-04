export interface DisciplinarySettingsInput {
  recidivismThreshold: number;
  conductAlertThreshold: number;
}

export function validateNonWorkingDay(day: string, reason: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return 'Indique la fecha del día no hábil.';
  if (reason.trim().length < 2) return 'Indique el motivo.';
  if (reason.trim().length > 200) return 'El motivo admite como máximo 200 caracteres.';
  return null;
}

export function validateDisciplinarySettings(input: DisciplinarySettingsInput): string | null {
  if (!Number.isInteger(input.recidivismThreshold) || input.recidivismThreshold < 1 || input.recidivismThreshold > 50) {
    return 'La reincidencia debe ser un entero entre 1 y 50.';
  }
  if (
    !Number.isInteger(input.conductAlertThreshold) ||
    input.conductAlertThreshold < 0 ||
    input.conductAlertThreshold > 100
  ) {
    return 'La nota de alerta debe ser un entero entre 0 y 100.';
  }
  return null;
}
