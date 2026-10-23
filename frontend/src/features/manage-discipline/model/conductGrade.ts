import type { InfractionSeverity, InfractionSeverityRule } from './types';

export const CONDUCT_BASE_GRADE = 100;
/** Umbral por defecto de la alerta de nota baja; será configurable por el administrador. */
export const CONDUCT_ALERT_THRESHOLD = 80;

export type FirmCounts = Partial<Record<InfractionSeverity, number>>;

export function totalDeduction(
  counts: FirmCounts,
  rules: readonly InfractionSeverityRule[],
): number {
  return rules.reduce(
    (sum, rule) => sum + Math.max(0, Math.floor(counts[rule.severity] ?? 0)) * rule.deduction,
    0,
  );
}

export function computeConductGrade(
  counts: FirmCounts,
  rules: readonly InfractionSeverityRule[],
): number {
  return Math.max(0, CONDUCT_BASE_GRADE - totalDeduction(counts, rules));
}
