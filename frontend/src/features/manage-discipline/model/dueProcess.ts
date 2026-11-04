/** Guía institucional de Debido Proceso CTP Hojancha 2026 (REAC 2026, Art. 150 y ss.). */

export type DayKind = 'hábiles' | 'naturales';

export type DueProcessStep = {
  order: number;
  title: string;
  owner: string;
  days: number;
  dayKind: DayKind;
  detail: string;
};

export type ProcessRemedy = {
  title: string;
  filedWith: string;
  fileDays: number;
  resolveDays: number | null;
  dayKind: DayKind;
  detail: string;
};

export const DUE_PROCESS_STEPS: readonly DueProcessStep[] = [
  {
    order: 1,
    title: 'Reporte',
    owner: 'Docente que presencia la falta',
    days: 5,
    dayKind: 'hábiles',
    detail: 'Informa por escrito al docente guía desde que ocurre el hecho.',
  },
  {
    order: 2,
    title: 'Investigación',
    owner: 'Docente guía',
    days: 10,
    dayKind: 'hábiles',
    detail: 'Recaba pruebas y testimonios; puede pedir el criterio de apoyo de Orientación.',
  },
  {
    order: 3,
    title: 'Comunicación formal',
    owner: 'Docente guía → encargado',
    days: 3,
    dayKind: 'hábiles',
    detail:
      'Por escrito: faltas, circunstancias, acción propuesta, derecho al expediente y a abogado.',
  },
  {
    order: 4,
    title: 'Descargo',
    owner: 'Encargado / estudiante',
    days: 3,
    dayKind: 'hábiles',
    detail: 'Presenta su defensa y pruebas por escrito.',
  },
  {
    order: 5,
    title: 'Resolución',
    owner: 'Docente guía',
    days: 5,
    dayKind: 'hábiles',
    detail: 'Fundamentada: desestima, modifica o mantiene la acción correctiva.',
  },
  {
    order: 6,
    title: 'Notificación',
    owner: 'Docente guía → encargado',
    days: 0,
    dayKind: 'hábiles',
    detail: 'Por cuaderno de comunicaciones, con copia al Comité de Evaluación y al expediente.',
  },
];

export const PROCESS_REMEDIES: readonly ProcessRemedy[] = [
  {
    title: 'Revocatoria',
    filedWith: 'Ante quien dictó el acto',
    fileDays: 3,
    resolveDays: 3,
    dayKind: 'hábiles',
    detail: 'Puede interponerse junto con la apelación en subsidio.',
  },
  {
    title: 'Apelación',
    filedWith: 'Ante la Dirección',
    fileDays: 3,
    resolveDays: 8,
    dayKind: 'hábiles',
    detail: 'Si se presentó en subsidio, se eleva sola cuando se rechaza la revocatoria.',
  },
  {
    title: 'Retiro precautorio',
    filedWith: 'Ordenado por la Dirección',
    fileDays: 10,
    resolveDays: null,
    dayKind: 'naturales',
    detail: 'Máximo 10 días naturales, por escrito; no es sanción. Coordinar con PANI si aplica.',
  },
];

export const DUE_PROCESS_GUARANTEES: readonly string[] = [
  'Presunción de inocencia: el rebajo solo se aplica cuando el acto queda firme.',
  'Derecho a conocer y acceder al expediente.',
  'Derecho a hacerse acompañar por un abogado.',
  'Derecho a presentar descargo y pruebas.',
  'Derecho a recurrir: revocatoria y apelación.',
];

export function totalDueProcessBusinessDays(): number {
  return DUE_PROCESS_STEPS.reduce((sum, step) => sum + step.days, 0);
}
