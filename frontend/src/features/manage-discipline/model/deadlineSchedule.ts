import { addBusinessDays } from './businessDays';
import { DUE_PROCESS_STEPS, PROCESS_REMEDIES } from './dueProcess';

export type ScheduledStep = {
  order: number;
  title: string;
  startsOn: string;
  dueOn: string;
  days: number;
};

export type DeadlineSchedule = {
  steps: ScheduledStep[];
  /** Firmeza si nadie interpone revocatoria dentro de su plazo. */
  firmBy: string;
};

/** Peor caso: cada paso agota su plazo antes de iniciar el siguiente. */
export function buildDeadlineSchedule(
  incidentDate: string,
  nonWorkingDays: ReadonlySet<string> = new Set(),
): DeadlineSchedule {
  const steps: ScheduledStep[] = [];
  let cursor = incidentDate;
  for (const step of DUE_PROCESS_STEPS) {
    if (step.days <= 0) continue;
    const dueOn = addBusinessDays(cursor, step.days, nonWorkingDays);
    steps.push({ order: step.order, title: step.title, startsOn: cursor, dueOn, days: step.days });
    cursor = dueOn;
  }
  const revocationDays = PROCESS_REMEDIES[0].fileDays;
  return { steps, firmBy: addBusinessDays(cursor, revocationDays, nonWorkingDays) };
}
