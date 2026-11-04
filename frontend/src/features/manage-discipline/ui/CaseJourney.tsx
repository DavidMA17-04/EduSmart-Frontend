import type { DisciplinaryCaseStatus, DisciplinaryTrack } from '../model/types';
import styles from './CaseJourney.module.css';

const DUE_STEPS: DisciplinaryCaseStatus[] = [
  'REPORTED',
  'INVESTIGATING',
  'COMMUNICATED',
  'PENDING_RESOLUTION',
  'RESOLVED',
  'IN_APPEAL',
  'FIRM',
];

const DIRECT_STEPS: DisciplinaryCaseStatus[] = ['NOTIFIED', 'IN_APPEAL', 'FIRM'];

const STEP_LABEL: Record<string, string> = {
  REPORTED: 'Reportada',
  INVESTIGATING: 'Investigación',
  COMMUNICATED: 'Comunicada',
  PENDING_RESOLUTION: 'Por resolver',
  RESOLVED: 'Resuelta',
  IN_APPEAL: 'En recurso',
  FIRM: 'Firme',
  NOTIFIED: 'Notificada',
};

const NOW: Record<string, { title: string; body: string }> = {
  REPORTED: {
    title: 'El hecho ya está registrado',
    body: 'Todavía no corre la investigación. El siguiente paso lo da el docente guía: iniciar la investigación abre 10 días hábiles.',
  },
  INVESTIGATING: {
    title: 'Se están reuniendo los hechos',
    body: 'El guía puede observar, pedir información y solicitar criterio de Orientación. El criterio no detiene el caso. Cuando los hechos basten, se comunica el cargo.',
  },
  COMMUNICATED: {
    title: 'El encargado ya puede defenderse',
    body: 'Tiene 3 días hábiles para presentar el descargo. Si no lo hace, el expediente pasa solo a pendiente de resolución.',
  },
  PENDING_RESOLUTION: {
    title: 'Le toca decidir al guía',
    body: 'Puede desestimar, modificar la gravedad o mantenerla. La fundamentación pide al menos 50 caracteres. El rebajo sigue siendo propuesto.',
  },
  RESOLVED: {
    title: 'La resolución ya se notificó',
    body: 'El encargado tiene 3 días hábiles para pedir revocatoria. Si no lo hace, el acto queda firme y el rebajo entra en la nota.',
  },
  IN_APPEAL: {
    title: 'Hay un recurso abierto',
    body: 'La revocatoria la resuelve quien dictó el acto. Si se rechaza y había apelación en subsidio, sube sola a Dirección. Dirección tiene 8 días hábiles.',
  },
  NOTIFIED: {
    title: 'La amonestación ya se comunicó',
    body: 'Es una falta leve o muy leve: no hay investigación. El encargado puede pedir revocatoria en 3 días hábiles. Si no lo hace, queda firme.',
  },
  FIRM: {
    title: 'El acto quedó firme',
    body: 'El rebajo ya se aplicó a la nota, una sola vez. Reabrir el expediente no lo descuenta de nuevo.',
  },
  DISMISSED: {
    title: 'El expediente se desestimó',
    body: 'No hay sanción y el rebajo no entra en la nota. Este estado no tiene salida.',
  },
  ANNULLED: {
    title: 'El expediente fue anulado',
    body: 'Quedó sin efecto. Si ya había rebajo firme, sale de la nota.',
  },
};

export function CaseJourney({
  status,
  track,
}: {
  status: DisciplinaryCaseStatus;
  track: DisciplinaryTrack;
}) {
  const ended = status === 'DISMISSED' || status === 'ANNULLED';
  const steps = track === 'DIRECT' ? DIRECT_STEPS : DUE_STEPS;
  const current = steps.indexOf(status);
  const now = NOW[status];

  return (
    <section className={styles.journey} aria-label="En qué va el expediente">
      {ended || current < 0 ? null : (
        <ol className={styles.steps}>
          {steps.map((step, index) => {
            const state = index < current ? 'done' : index === current ? 'current' : 'upcoming';
            return (
              <li className={styles[state]} key={step}>
                <span className={styles.marker} aria-hidden="true">
                  {index < current ? '✓' : index + 1}
                </span>
                <span>{STEP_LABEL[step]}</span>
              </li>
            );
          })}
        </ol>
      )}
      {now ? (
        <div className={styles.now}>
          <p className={styles.kicker}>{track === 'DIRECT' ? 'Amonestación directa' : 'Debido proceso'}</p>
          <h3>{now.title}</h3>
          <p>{now.body}</p>
        </div>
      ) : null}
    </section>
  );
}
