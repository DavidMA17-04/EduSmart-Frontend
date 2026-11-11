import type { CaseAction } from './caseActions';
import type { DisciplinaryCaseStatus, DisciplinaryTrack } from './types';

/** Pasos del Art. 150 alineados al expediente (vía debido proceso). */
export type ReacStep = 1 | 2 | 3 | 4 | 5 | 6;

export type CaseStageId =
  | 'report'
  | 'investigate'
  | 'communicate'
  | 'defense'
  | 'resolve'
  | 'notify'
  | 'appeal'
  | 'firm'
  | 'closed'
  | 'direct';

export type CaseStageView = {
  id: CaseStageId;
  /** Paso REAC activo (null en vía directa o cierre). */
  reacStep: ReacStep | null;
  railLabel: string;
  kicker: string;
  title: string;
  body: string;
  /** Acción dominante: un solo botón grande. */
  primaryAction: CaseAction | 'open_communicate' | null;
  primaryLabel: string;
  primaryHint: string;
  secondaryActions: CaseAction[];
  /** Mostrar el workspace de comunicación formal (paso 3). */
  openCommunicateByDefault: boolean;
};

const REAC_RAIL: Array<{ step: ReacStep; label: string }> = [
  { step: 1, label: 'Reporte' },
  { step: 2, label: 'Investigación' },
  { step: 3, label: 'Comunicación' },
  { step: 4, label: 'Descargo' },
  { step: 5, label: 'Resolución' },
  { step: 6, label: 'Notificación' },
];

export function reacRail(): ReadonlyArray<{ step: ReacStep; label: string }> {
  return REAC_RAIL;
}

/** Estado del riel: hecho / actual / próximo. */
export function railState(
  step: ReacStep,
  active: ReacStep | null,
): 'done' | 'current' | 'upcoming' {
  if (active == null) return 'upcoming';
  if (step < active) return 'done';
  if (step === active) return 'current';
  return 'upcoming';
}

export type StepPhase = 'past' | 'current' | 'future';

export function stepPhase(step: ReacStep, liveStep: ReacStep | null): StepPhase {
  if (liveStep == null) return 'future';
  if (step < liveStep) return 'past';
  if (step === liveStep) return 'current';
  return 'future';
}

export type StepGuide = {
  step: ReacStep;
  title: string;
  owner: string;
  timing: string;
  detail: string;
  /** Qué verá en pantalla cuando este paso esté activo. */
  screen: string;
  /** Por qué todavía no se puede actuar (futuro). */
  lockedHint: string;
};

const STEP_GUIDES: Record<ReacStep, Omit<StepGuide, 'step'>> = {
  1: {
    title: 'Reporte',
    owner: 'Docente que presencia la falta',
    timing: 'Hasta 5 días hábiles desde el hecho',
    detail: 'Se registra el estudiante, la falta y los hechos. El expediente queda reportado.',
    screen: 'Aquí verá el resumen del reporte y el botón para iniciar la investigación.',
    lockedHint: 'El reporte ya es el punto de partida; no hay nada que “hacer” aquí después.',
  },
  2: {
    title: 'Investigación',
    owner: 'Docente guía',
    timing: 'Hasta 10 días hábiles',
    detail: 'Se reúnen pruebas, observaciones y, si hace falta, criterio de Orientación.',
    screen: 'Podrá dejar observaciones, pedir información o criterio, y archivar si no hay mérito.',
    lockedHint: 'Primero debe abrirse la investigación (paso 2) desde el estado Reportada.',
  },
  3: {
    title: 'Comunicación formal',
    owner: 'Docente guía → encargado',
    timing: 'Documento escrito · abre 3 días hábiles de descargo',
    detail: 'Se notifica la falta, los hechos, la acción propuesta y los derechos (expediente y abogado).',
    screen: 'Verá el documento oficial prellenado, con vista previa, impresión y envío o entrega física.',
    lockedHint: 'Solo se puede comunicar el cargo cuando el expediente está en investigación.',
  },
  4: {
    title: 'Descargo',
    owner: 'Encargado / estudiante',
    timing: '3 días hábiles desde la comunicación',
    detail: 'El encargado presenta su defensa y pruebas. El guía puede registrar un descargo escrito que llegue al colegio.',
    screen: 'Verá el plazo, los descargos recibidos y el formulario para registrar uno escrito.',
    lockedHint: 'El descargo solo corre después de enviar la comunicación formal (paso 3).',
  },
  5: {
    title: 'Resolución',
    owner: 'Docente guía',
    timing: 'Hasta 5 días hábiles',
    detail: 'Se desestima, modifica o mantiene la acción correctiva, con fundamentación escrita.',
    screen: 'Verá un formulario para elegir el resultado y escribir la fundamentación (mín. 50 caracteres).',
    lockedHint: 'La resolución llega cuando termina el plazo de descargo o ya se presentó la defensa.',
  },
  6: {
    title: 'Notificación',
    owner: 'Docente guía → encargado',
    timing: 'Al resolver · luego 3 días hábiles de recurso',
    detail: 'Se notifica la resolución. El encargado puede pedir revocatoria; si no, el acto queda firme.',
    screen: 'Verá el estado de notificación y el plazo para recursos (revocatoria / apelación).',
    lockedHint: 'La notificación corresponde después de dictar la resolución (paso 5).',
  },
};

export function stepGuide(step: ReacStep): StepGuide {
  return { step, ...STEP_GUIDES[step] };
}

function without(
  actions: CaseAction[],
  drop: CaseAction | CaseAction[],
): CaseAction[] {
  const banned = new Set(Array.isArray(drop) ? drop : [drop]);
  return actions.filter((item) => !banned.has(item) && item !== 'followUp');
}

/**
 * Traduce el estado del expediente a un “ahora toca” entendible,
 * alineado al flujo REAC y a las acciones que el rol sí puede hacer.
 */
export function resolveCaseStage(input: {
  status: DisciplinaryCaseStatus;
  track: DisciplinaryTrack;
  actions: CaseAction[];
}): CaseStageView {
  const { status, track, actions } = input;
  const can = (code: CaseAction) => actions.includes(code);

  if (status === 'DISMISSED' || status === 'ANNULLED') {
    return {
      id: 'closed',
      reacStep: null,
      railLabel: 'Cerrado',
      kicker: status === 'DISMISSED' ? 'Desestimado' : 'Anulado',
      title: 'Este expediente ya no sigue el trámite',
      body: 'Puede revisar los hechos y la cronología. No hay un siguiente paso operativo.',
      primaryAction: null,
      primaryLabel: '',
      primaryHint: '',
      secondaryActions: without(actions, []),
      openCommunicateByDefault: false,
    };
  }

  if (track === 'DIRECT') {
    return {
      id: 'direct',
      reacStep: null,
      railLabel: 'Amonestación directa',
      kicker: 'Vía directa',
      title:
        status === 'FIRM'
          ? 'La amonestación quedó firme'
          : status === 'IN_APPEAL'
            ? 'Hay un recurso sobre esta amonestación'
            : 'Amonestación ya comunicada',
      body:
        status === 'FIRM'
          ? 'El rebajo ya cuenta en la nota. Revise historial si necesita el detalle.'
          : 'En faltas leves o muy leves no hay investigación. El encargado puede recurrir en 3 días hábiles.',
      primaryAction: null,
      primaryLabel: '',
      primaryHint: '',
      secondaryActions: without(actions, []),
      openCommunicateByDefault: false,
    };
  }

  if (status === 'REPORTED') {
    return {
      id: 'report',
      reacStep: 1,
      railLabel: 'Paso 1 · Reporte',
      kicker: 'Debido proceso · ahora',
      title: 'Hay que abrir la investigación',
      body: 'El hecho ya está en el expediente. El docente guía inicia la investigación y con eso corren 10 días hábiles para reunir pruebas.',
      primaryAction: can('investigate') ? 'investigate' : null,
      primaryLabel: 'Iniciar investigación',
      primaryHint: 'Abre el paso 2 y el plazo de 10 días hábiles.',
      secondaryActions: without(actions, 'investigate'),
      openCommunicateByDefault: false,
    };
  }

  if (status === 'INVESTIGATING') {
    const ready = can('communicate');
    return {
      id: 'investigate',
      reacStep: ready ? 3 : 2,
      railLabel: ready ? 'Paso 3 · Comunicación' : 'Paso 2 · Investigación',
      kicker: 'Debido proceso · ahora',
      title: ready
        ? 'Cuando los hechos basten, comunique el cargo'
        : 'Reúna los hechos de la investigación',
      body: ready
        ? 'Esta es la comunicación formal al encargado (paso 3 del Art. 150). Complete la acción propuesta, revise el documento e imprímalo o envíelo. Sin este paso el proceso puede quedar nulo.'
        : 'Puede dejar observaciones, pedir datos a quien reportó o pedir criterio a Orientación. El criterio no detiene el caso.',
      primaryAction: ready ? 'open_communicate' : can('observe') ? 'observe' : null,
      primaryLabel: ready ? 'Comunicar el cargo al encargado' : 'Registrar observación',
      primaryHint: ready
        ? 'Documento oficial · cláusulas obligatorias · envío o entrega física'
        : 'Deja constancia sin cambiar el estado del expediente.',
      secondaryActions: without(actions, ready ? 'communicate' : 'observe'),
      openCommunicateByDefault: ready,
    };
  }

  if (status === 'COMMUNICATED') {
    return {
      id: 'defense',
      reacStep: 4,
      railLabel: 'Paso 4 · Descargo',
      kicker: 'Debido proceso · ahora',
      title: 'El encargado tiene la palabra',
      body: 'Corren 3 días hábiles para presentar el descargo. Si llega por escrito, regístrelo aquí. Si no llega, el expediente pasará solo a resolución.',
      primaryAction: null,
      primaryLabel: '',
      primaryHint: '',
      secondaryActions: without(actions, []),
      openCommunicateByDefault: false,
    };
  }

  if (status === 'PENDING_RESOLUTION') {
    return {
      id: 'resolve',
      reacStep: 5,
      railLabel: 'Paso 5 · Resolución',
      kicker: 'Debido proceso · ahora',
      title: 'Le toca decidir al guía',
      body: 'Desestime, modifique o mantenga la acción. La fundamentación pide al menos 50 caracteres. El rebajo sigue siendo propuesto hasta que quede firme.',
      primaryAction: can('resolve') ? 'resolve' : null,
      primaryLabel: 'Resolver el expediente',
      primaryHint: 'Desestima, modifica o mantiene · mínimo 50 caracteres.',
      secondaryActions: without(actions, 'resolve'),
      openCommunicateByDefault: false,
    };
  }

  if (status === 'RESOLVED') {
    return {
      id: 'notify',
      reacStep: 6,
      railLabel: 'Paso 6 · Notificación',
      kicker: 'Debido proceso · ahora',
      title: 'La resolución ya está notificada',
      body: 'El encargado tiene 3 días hábiles para pedir revocatoria. Si no lo hace, el acto queda firme y el rebajo entra en la nota.',
      primaryAction: null,
      primaryLabel: '',
      primaryHint: '',
      secondaryActions: without(actions, []),
      openCommunicateByDefault: false,
    };
  }

  if (status === 'IN_APPEAL') {
    return {
      id: 'appeal',
      reacStep: 6,
      railLabel: 'Recurso',
      kicker: 'Debido proceso · recurso',
      title: 'Hay un recurso abierto',
      body: 'La revocatoria la resuelve quien dictó el acto. Si se rechaza y había apelación en subsidio, sube sola a Dirección.',
      primaryAction: null,
      primaryLabel: '',
      primaryHint: '',
      secondaryActions: without(actions, []),
      openCommunicateByDefault: false,
    };
  }

  return {
    id: 'firm',
    reacStep: 6,
    railLabel: 'Firme',
    kicker: 'Cerrado con efecto',
    title: 'El acto quedó firme',
    body: 'El rebajo ya se aplicó a la nota, una sola vez. Puede consultar hechos e historial.',
    primaryAction: null,
    primaryLabel: '',
    primaryHint: '',
    secondaryActions: without(actions, []),
    openCommunicateByDefault: false,
  };
}

/** Texto corto para la bandeja: qué le toca al expediente, sin depender del rol. */
export function inboxNextStep(input: {
  status: DisciplinaryCaseStatus;
  track: DisciplinaryTrack;
}): { label: string; detail: string } {
  if (input.track === 'DIRECT') {
    if (input.status === 'FIRM') return { label: 'Firme', detail: 'Amonestación cerrada' };
    if (input.status === 'IN_APPEAL') return { label: 'En recurso', detail: 'Resolver revocatoria o apelación' };
    return { label: 'Notificada', detail: 'Esperar plazo de recurso' };
  }
  switch (input.status) {
    case 'REPORTED':
      return { label: 'Iniciar investigación', detail: 'Paso 2 · docente guía' };
    case 'INVESTIGATING':
      return { label: 'Comunicar el cargo', detail: 'Paso 3 · cuando basten los hechos' };
    case 'COMMUNICATED':
      return { label: 'Esperar descargo', detail: 'Paso 4 · 3 días hábiles' };
    case 'PENDING_RESOLUTION':
      return { label: 'Resolver', detail: 'Paso 5 · docente guía' };
    case 'RESOLVED':
      return { label: 'Plazo de recurso', detail: 'Paso 6 · 3 días hábiles' };
    case 'IN_APPEAL':
      return { label: 'Resolver recurso', detail: 'Revocatoria o apelación' };
    case 'FIRM':
      return { label: 'Firme', detail: 'Rebajo aplicado' };
    case 'DISMISSED':
      return { label: 'Desestimado', detail: 'Sin sanción' };
    case 'ANNULLED':
      return { label: 'Anulado', detail: 'Sin efecto' };
    default:
      return { label: STATUS_FALLBACK, detail: '' };
  }
}

const STATUS_FALLBACK = 'Ver expediente';
