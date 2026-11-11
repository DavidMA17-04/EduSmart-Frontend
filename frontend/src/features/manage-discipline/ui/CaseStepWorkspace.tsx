import { FormEvent, useState, type ReactNode } from 'react';
import { FileText, Scale, Shield, Megaphone, Search, Gavel } from 'lucide-react';
import { Badge, Button, Input, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import type { CaseAction } from '../model/caseActions';
import { canOfferWrittenDefense, validateLength } from '../model/caseStaffActions';
import { stepGuide, type ReacStep, type StepPhase } from '../model/caseStage';
import type { DisciplinaryCaseDetail } from '../model/types';
import { FormalCommunicationPreview } from './FormalCommunicationPreview';
import { fieldsFromCaseDetail, MANDATORY_CLAUSES } from '../model/formalCommunication';
import styles from './CaseDetailPanel.module.css';

type Props = {
  step: ReacStep;
  phase: StepPhase;
  detail: DisciplinaryCaseDetail;
  isConductor: boolean;
  /** Acciones vivas del paso actual (solo si phase === current). */
  liveActions?: {
    canCommunicate: boolean;
    showCommunicate: boolean;
    onSelectAction: (action: CaseAction) => void;
    onChanged: () => void;
    onError: (message: string | null) => void;
    composer?: ReactNode;
  };
};

const STEP_ICON = {
  1: Megaphone,
  2: Search,
  3: FileText,
  4: Shield,
  5: Gavel,
  6: Scale,
} as const;

export function CaseStepWorkspace({ step, phase, detail, isConductor, liveActions }: Props) {
  const guide = stepGuide(step);
  const Icon = STEP_ICON[step];
  const interactive = phase === 'current';
  /** Pasos 4–6 ya traen hero propio; el encabezado genérico solo añade ruido. */
  const showGenericHeader = step <= 3;

  return (
    <div className={styles.stepWorkspace}>
      {phase !== 'current' ? (
        <div
          className={`${styles.previewBanner} ${phase === 'past' ? styles.previewPast : styles.previewFuture}`}
          role="status"
        >
          {phase === 'future' ? (
            <>
              <strong>Vista previa · este paso aún no se puede realizar</strong>
              <p>
                El expediente está en otro momento del trámite. {guide.lockedHint} Puede mirar cómo se
                verá la pantalla; los botones de acción permanecen bloqueados.
              </p>
            </>
          ) : (
            <>
              <strong>Paso ya recorrido</strong>
              <p>Esto ya ocurrió en el expediente. La vista es de consulta; no vuelve a ejecutarse desde aquí.</p>
            </>
          )}
        </div>
      ) : null}

      {showGenericHeader ? (
        <header className={styles.stepHeader}>
          <span aria-hidden="true" className={styles.stepIcon}>
            <Icon size={22} />
          </span>
          <div>
            <p className={styles.nowKicker}>
              Paso {step} · {guide.title}
            </p>
            <h3>{guide.title}</h3>
            <p className={styles.nowBody}>{guide.detail}</p>
            <p className={styles.stepMeta}>
              <span>{guide.owner}</span>
              <span>{guide.timing}</span>
            </p>
          </div>
        </header>
      ) : null}

      {step === 1 ? <ReportStep detail={detail} /> : null}
      {step === 2 ? (
        <InvestigateStep interactive={interactive} liveActions={liveActions} />
      ) : null}
      {step === 3 ? (
        <CommunicateStep
          detail={detail}
          interactive={interactive}
          canCommunicate={Boolean(liveActions?.canCommunicate)}
          showCommunicate={Boolean(liveActions?.showCommunicate)}
          onChanged={liveActions?.onChanged ?? (() => undefined)}
          onError={liveActions?.onError ?? (() => undefined)}
        />
      ) : null}
      {step === 4 ? (
        <DefenseStep
          detail={detail}
          isConductor={isConductor}
          interactive={interactive}
          onChanged={liveActions?.onChanged ?? (() => undefined)}
          onError={liveActions?.onError ?? (() => undefined)}
        />
      ) : null}
      {step === 5 ? (
        <ResolveStep
          interactive={interactive}
          composer={liveActions?.composer}
          onSelectResolve={
            interactive && liveActions
              ? () => liveActions.onSelectAction('resolve')
              : undefined
          }
        />
      ) : null}
      {step === 6 ? <NotifyStep detail={detail} phase={phase} /> : null}
    </div>
  );
}

function ReportStep({ detail }: { detail: DisciplinaryCaseDetail }) {
  return (
    <section className={styles.card}>
      <h3>Datos del reporte</h3>
      <dl className={styles.facts}>
        <div>
          <dt>Estudiante</dt>
          <dd>{detail.student.fullName}</dd>
        </div>
        <div>
          <dt>Falta</dt>
          <dd>{detail.infractionName || '—'}</dd>
        </div>
        <div>
          <dt>Lugar</dt>
          <dd>{detail.place || '—'}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{detail.occurredAt ? formatShortDate(detail.occurredAt.slice(0, 10)) : '—'}</dd>
        </div>
      </dl>
      <p className={styles.chronoNote}>{detail.description}</p>
    </section>
  );
}

function InvestigateStep({
  interactive,
  liveActions,
}: {
  interactive: boolean;
  liveActions?: Props['liveActions'];
}) {
  return (
    <section className={styles.card}>
      <h3>Qué se hace en la investigación</h3>
      <ul className={styles.stepChecklist}>
        <li>Registrar observaciones sin cambiar el estado</li>
        <li>Pedir información a quien reportó la falta</li>
        <li>Solicitar criterio a Orientación (no detiene el caso)</li>
        <li>Cuando basten los hechos, pasar al paso 3 (comunicación)</li>
      </ul>
      {interactive && liveActions?.composer ? liveActions.composer : null}
      {!interactive ? (
        <p className={styles.muted}>
          En el paso actual del expediente podrá usar “Otras acciones de este paso” para observar o
          pedir criterio.
        </p>
      ) : null}
    </section>
  );
}

function CommunicateStep({
  detail,
  interactive,
}: {
  detail: DisciplinaryCaseDetail;
  interactive: boolean;
  canCommunicate: boolean;
  showCommunicate: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  if (interactive) {
    return (
      <p className={styles.muted}>
        El documento oficial para enviar o imprimir aparece justo debajo cuando pulsa “Comunicar el
        cargo al encargado”.
      </p>
    );
  }

  return (
    <section className={styles.card}>
      <h3>Documento de este paso</h3>
      <p className={styles.muted}>
        Comunicación formal al encargado con los datos del expediente, la acción propuesta y las
        tres cláusulas obligatorias. Sin este paso el debido proceso puede quedar nulo.
      </p>
      <ol className={styles.clauses}>
        {MANDATORY_CLAUSES.map((clause) => (
          <li key={clause}>{clause}</li>
        ))}
      </ol>
      <FormalCommunicationPreview
        mode="case"
        caseNumber={detail.caseNumber}
        initialFields={fieldsFromCaseDetail(detail)}
        intro={<p className={styles.note}>Vista previa del documento (sin envío).</p>}
      />
    </section>
  );
}

function DefenseStep({
  detail,
  isConductor,
  interactive,
  onChanged,
  onError,
}: {
  detail: DisciplinaryCaseDetail;
  isConductor: boolean;
  interactive: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const defenses = detail.defenses ?? [];
  const canWrite = canOfferWrittenDefense({
    isConductor,
    track: detail.track,
    status: detail.status,
    defenseCount: defenses.length,
  });
  const offerForm = interactive && canWrite;

  return (
    <section className={styles.defensePanel}>
      <div className={styles.defenseHero}>
        <p className={styles.nowKicker}>Derecho de defensa · Art. 150</p>
        <h3>El encargado responde</h3>
        <p>
          Tiene <strong>3 días hábiles</strong> desde la comunicación formal para presentar descargo
          y pruebas. Puede hacerlo por el portal o por escrito en el colegio.
        </p>
      </div>

      <div className={styles.defenseGrid}>
        <article className={styles.defenseCard}>
          <h4>Qué puede incluir el descargo</h4>
          <ul className={styles.stepChecklist}>
            <li>Versión de los hechos del estudiante o encargado</li>
            <li>Pruebas o testigos que quieran aportar</li>
            <li>Argumentos para desestimar o atenuar la falta</li>
          </ul>
        </article>
        <article className={styles.defenseCard}>
          <h4>Si no llega descargo</h4>
          <p className={styles.muted}>
            Al vencer el plazo el expediente pasa solo a pendiente de resolución. El guía decide con
            lo que haya en el expediente.
          </p>
        </article>
      </div>

      <div className={styles.card}>
        <h3>Descargos en este expediente</h3>
        {defenses.length === 0 ? (
          <div className={styles.emptyPanel}>
            <p className={styles.emptyState}>Todavía no hay descargo registrado.</p>
            <p className={styles.muted}>
              {interactive
                ? 'Si el encargado trae un escrito al colegio, regístrelo abajo.'
                : 'Cuando el paso esté activo, aquí aparecerán los descargos recibidos.'}
            </p>
          </div>
        ) : (
          <ul className={styles.followList}>
            {defenses.map((item) => (
              <li className={styles.followCard} key={item.id}>
                <div className={styles.followCardHead}>
                  <strong>{item.channel === 'WRITTEN' ? 'Descargo escrito' : 'Descargo por portal'}</strong>
                  <Badge tone="neutral">
                    {item.presentedAt ? formatShortDate(item.presentedAt.slice(0, 10)) : 'Sin fecha'}
                  </Badge>
                </div>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        )}

        {offerForm ? (
          <WrittenDefenseBlock caseId={detail.id} onChanged={onChanged} onError={onError} />
        ) : null}

        {!interactive ? (
          <div className={styles.previewForm}>
            <p className={styles.composerTitle}>Registrar descargo escrito (vista previa)</p>
            <p className={styles.muted}>Así se verá el formulario cuando el paso 4 esté activo.</p>
            <label>
              Texto del descargo
              <Textarea rows={3} disabled placeholder="Versión de los hechos y argumentos…" value="" onChange={() => undefined} />
            </label>
            <label>
              Documento (PDF o imagen)
              <Input type="file" disabled />
            </label>
            <Button type="button" disabled>
              Registrar descargo escrito
            </Button>
          </div>
        ) : null}

        {interactive && !canWrite && defenses.length === 0 ? (
          <p className={styles.muted}>
            {detail.status === 'COMMUNICATED'
              ? 'Espere el descargo del encargado o el vencimiento del plazo.'
              : 'En este estado no se registra un nuevo descargo.'}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function WrittenDefenseBlock({
  caseId,
  onChanged,
  onError,
}: {
  caseId: number;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validateLength(body, 10, 4000, 'El descargo');
    if (problem || !file) {
      onError(problem ?? 'Adjunte el documento del descargo.');
      return;
    }
    setPending(true);
    onError(null);
    try {
      await disciplineApi.fileWrittenDefense(caseId, body.trim(), file);
      onChanged();
    } catch (reason) {
      onError(reason instanceof DisciplineApiError ? reason.message : 'No se pudo registrar el descargo.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <p className={styles.composerTitle}>Registrar descargo escrito</p>
      <p className={styles.muted}>Use esto cuando el escrito llega al colegio y no por el portal.</p>
      <label>
        Texto del descargo
        <Textarea
          rows={4}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Transcriba o resuma el escrito del encargado…"
        />
      </label>
      <label>
        Documento
        <Input
          type="file"
          required
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <Button type="submit" disabled={pending}>
        Guardar descargo escrito
      </Button>
    </form>
  );
}

function ResolveStep({
  interactive,
  composer,
  onSelectResolve,
}: {
  interactive: boolean;
  composer?: ReactNode;
  onSelectResolve?: () => void;
}) {
  return (
    <section className={styles.defensePanel}>
      <div className={styles.defenseHero}>
        <p className={styles.nowKicker}>Decisión del guía · Art. 150</p>
        <h3>El guía decide con fundamento</h3>
        <p>
          Elija un resultado y explíquelo por escrito (mín. 50 caracteres). Esa decisión abre el
          plazo de recurso del encargado.
        </p>
      </div>

      <div className={styles.outcomeGrid}>
        <article className={styles.outcomeCard}>
          <span className={styles.outcomeTag}>Desestima</span>
          <p>No hay sanción; el rebajo no entra en la nota.</p>
        </article>
        <article className={styles.outcomeCard}>
          <span className={styles.outcomeTag}>Modifica</span>
          <p>Ajusta la gravedad o la acción propuesta.</p>
        </article>
        <article className={styles.outcomeCard}>
          <span className={styles.outcomeTag}>Mantiene</span>
          <p>Confirma la acción correctiva comunicada.</p>
        </article>
      </div>

      {interactive && composer ? composer : null}
      {interactive && !composer && onSelectResolve ? (
        <Button type="button" onClick={onSelectResolve}>
          Abrir formulario de resolución
        </Button>
      ) : null}
      {!interactive ? (
        <div className={styles.previewForm}>
          <p className={styles.composerTitle}>Resolver el expediente (vista previa)</p>
          <p className={styles.muted}>Así se verá el formulario cuando el paso 5 esté activo.</p>
          <label>
            Resultado
            <select disabled defaultValue="UPHOLD">
              <option value="DISMISS">Desestima</option>
              <option value="MODIFY">Modifica</option>
              <option value="UPHOLD">Mantiene</option>
            </select>
          </label>
          <label>
            Fundamentación
            <Textarea rows={3} disabled placeholder="Explique la decisión…" value="" onChange={() => undefined} />
          </label>
          <Button type="button" disabled>
            Confirmar resolución
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function notifyStatusLabel(status: DisciplinaryCaseDetail['status']): string {
  if (status === 'FIRM') return 'Acto firme';
  if (status === 'IN_APPEAL') return 'En recurso';
  if (status === 'RESOLVED') return 'Resuelta · plazo de recurso';
  return 'Aún no notificada';
}

function NotifyStep({ detail, phase }: { detail: DisciplinaryCaseDetail; phase: StepPhase }) {
  const arrived =
    phase === 'past' ||
    phase === 'current' ||
    detail.status === 'RESOLVED' ||
    detail.status === 'FIRM' ||
    detail.status === 'IN_APPEAL';
  const appeals = detail.appeals ?? [];

  return (
    <section className={styles.defensePanel}>
      <div className={styles.defenseHero}>
        <p className={styles.nowKicker}>Cierre del debido proceso · Art. 150</p>
        <h3>La resolución llega al encargado</h3>
        <p>
          Tras notificar, corren <strong>3 días hábiles</strong> para pedir revocatoria. Si no hay
          recurso, el acto queda firme y el rebajo entra en la nota.
        </p>
        <ol className={styles.flowList} aria-label="Secuencia tras la resolución">
          <li>
            <strong>Avisar</strong>
            <span>al encargado por cuaderno de comunicaciones o portal.</span>
          </li>
          <li>
            <strong>Esperar 3 días hábiles</strong>
            <span>de plazo para pedir revocatoria.</span>
          </li>
          <li>
            <strong>Firmeza</strong>
            <span>si no hay recurso: el acto queda firme y el rebajo entra en la nota.</span>
          </li>
        </ol>
      </div>

      <div className={styles.card}>
        <div className={styles.notifyStatusHead}>
          <h3>Estado en este expediente</h3>
          {arrived ? <Badge tone={detail.status === 'FIRM' ? 'success' : 'neutral'}>{notifyStatusLabel(detail.status)}</Badge> : null}
        </div>

        {!arrived ? (
          <div className={styles.emptyPanel}>
            <p className={styles.emptyState}>Todavía no hay resolución que notificar.</p>
            <p className={styles.muted}>
              Cuando el guía resuelva (paso 5), aquí verá el plazo de recurso y si el encargado ya
              leyó el aviso.
            </p>
          </div>
        ) : appeals.length > 0 ? (
          <ul className={styles.followList}>
            {appeals.map((item) => (
              <li className={styles.followCard} key={item.id}>
                <div className={styles.followCardHead}>
                  <strong>{item.kind === 'APPEAL' ? 'Apelación' : 'Revocatoria'}</strong>
                  <Badge tone={item.outcome ? 'success' : 'warning'}>
                    {item.outcome
                      ? item.outcome === 'UPHOLD'
                        ? 'Confirmada'
                        : item.outcome === 'REVOKE'
                          ? 'Revocada'
                          : 'Modificada'
                      : 'Pendiente'}
                  </Badge>
                </div>
                {item.filedAt ? (
                  <p className={styles.muted}>Presentada el {formatShortDate(item.filedAt.slice(0, 10))}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyPanel}>
            <p className={styles.emptyState}>{notifyStatusLabel(detail.status)}</p>
            <p className={styles.muted}>
              {detail.status === 'FIRM'
                ? 'No hubo recurso a tiempo; el acto está firme.'
                : 'Sin recurso registrado todavía. El plazo sigue corriendo hasta que venza o se interponga.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
