import { portalPathForSession } from '@/shared/auth/portalPaths';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, FileText, History, NotebookPen } from 'lucide-react';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { Alert, Badge, Button, Input, Select, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import {
  availableCaseActions,
  CASE_ACTION_LABELS,
  EVENT_LABELS,
  eventTone,
  FOLLOW_UP_KIND_LABELS,
  type CaseAction,
} from '../model/caseActions';
import { DEADLINE_LABELS, DEADLINE_TONES, STATUS_LABELS, STATUS_TONES } from '../model/caseInbox';
import {
  railState,
  reacRail,
  resolveCaseStage,
  stepPhase,
  type ReacStep,
} from '../model/caseStage';
import { DISCIPLINE_CASES_PATH, DISCIPLINE_PERMISSIONS, disciplineHistoryPath } from '../model/disciplineRouting';
import { SEVERITY_LABELS, SEVERITY_ORDER, SEVERITY_TONES } from '../model/severity';
import type { DisciplinaryCaseDetail, DisciplinaryCaseEvent, InfractionSeverity } from '../model/types';
import { CaseProcessPanel } from './CaseProcessPanel';
import { CaseStepWorkspace } from './CaseStepWorkspace';
import styles from './CaseDetailPanel.module.css';

const ACTION_HINTS: Partial<Record<CaseAction, string>> = {
  investigate: 'Abre 10 días hábiles para reunir los hechos.',
  observe: 'Deja una nota de la investigación. El estado no cambia.',
  requestInformation: 'Pide un dato a quien reportó la falta.',
  respondInformation: 'Responde la solicitud que le hicieron.',
  requestCounsel: 'Pide apoyo a Orientación. El expediente sigue su curso.',
  issueCounsel: 'Solo si ya pidieron criterio. No decide el caso.',
  resolve: 'Desestima, modifica o mantiene. Mínimo 50 caracteres.',
  archive: 'Cierra sin sanción porque no hay mérito.',
  annul: 'Deja el expediente sin efecto. Solo administración.',
};

const OUTCOME_LABELS: Record<string, string> = {
  DISMISS: 'Desestima',
  MODIFY: 'Modifica',
  UPHOLD: 'Mantiene',
  PENDING: 'Pendiente',
  MET: 'Cumplido',
  UNMET: 'Incumplido',
};

type Shelf = 'none' | 'facts' | 'history' | 'follow';

export const CaseDetailPanel = ({ caseId }: { caseId: number }) => {
  const [detail, setDetail] = useState<DisciplinaryCaseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<CaseAction | null>(null);
  const [message, setMessage] = useState('');
  const [followDescription, setFollowDescription] = useState('');
  const [outcome, setOutcome] = useState('UPHOLD');
  const [severity, setSeverity] = useState<InfractionSeverity>('SERIOUS');
  const [requestEventId, setRequestEventId] = useState('');
  const [saving, setSaving] = useState(false);
  const [followKind, setFollowKind] = useState('OBSERVATION');
  const [followedOn, setFollowedOn] = useState('');
  const [reviewOn, setReviewOn] = useState('');
  const [participants, setParticipants] = useState('');
  const [closing, setClosing] = useState<{ id: number; outcome: 'MET' | 'UNMET'; note: string } | null>(
    null,
  );
  const [shelf, setShelf] = useState<Shelf>('none');
  const [showCommunicate, setShowCommunicate] = useState(false);
  const [viewedStep, setViewedStep] = useState<ReacStep | null>(null);
  const actionFormRef = useRef<HTMLFormElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const selectAction = (next: CaseAction) => {
    setShowCommunicate(false);
    setAction(next);
    setError(null);
    setMessage('');
  };

  useEffect(() => {
    if (!action || action === 'communicate' || action === 'followUp') return;
    actionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (action !== 'investigate') {
      window.setTimeout(() => messageRef.current?.focus(), 50);
    }
  }, [action]);

  const reload = () => {
    setLoading(true);
    void disciplineApi
      .getCase(caseId)
      .then((next) => {
        setDetail(next);
        setError(null);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No se pudo abrir el expediente.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    void disciplineApi
      .getCase(caseId)
      .then((next) => {
        if (active) setDetail(next);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo abrir el expediente.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [caseId]);

  const focusedCase = useRef<number | null>(null);
  useEffect(() => {
    if (!detail || focusedCase.current === detail.id) return;
    focusedCase.current = detail.id;
    setAction(null);
    setShelf('none');
    setViewedStep(null);
    setShowCommunicate(false);
  }, [detail]);

  if (loading) return <p className={styles.muted}>Cargando expediente…</p>;
  if (!detail) return <Alert>{error ?? 'El expediente no está disponible.'}</Alert>;

  const user = getSessionUser();
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('ADMIN') || roles.some((role) => role.toLowerCase() === 'administrador');
  const isConductor = isAdmin || roles.includes('Director') || user?.id === detail.responsibleUserId;
  const actions = availableCaseActions({
    status: detail.status,
    track: detail.track,
    isConductor,
    isReporter: user?.id === detail.reporterUserId,
    canReview: sessionHasPermission(DISCIPLINE_PERMISSIONS.review),
    canConfigure: sessionHasPermission(DISCIPLINE_PERMISSIONS.configure),
    canFollowUp: isConductor || roles.includes('Orientador'),
    hasPendingCounselRequest: hasPendingCounselRequest(detail.events),
  });
  const requests = openInformationRequests(detail.events);
  const stage = resolveCaseStage({ status: detail.status, track: detail.track, actions });
  const communicateOpen = showCommunicate || (stage.openCommunicateByDefault && action == null);
  const infractionLabel =
    detail.infractionName ||
    (detail as DisciplinaryCaseDetail & { infractionType?: { name?: string } }).infractionType?.name ||
    'Falta sin nombre';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!action || action === 'communicate' || action === 'followUp') return;
    const needsText = action !== 'investigate';
    const minLength = action === 'resolve' ? 50 : action === 'archive' || action === 'annul' ? 20 : 10;
    if (needsText && message.trim().length < minLength) {
      setError(`Escriba al menos ${minLength} caracteres antes de continuar.`);
      messageRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const path = `/disciplinary/cases/${detail.id}`;
      if (action === 'investigate') await disciplineApi.postCaseAction(`${path}/investigation`);
      if (action === 'observe') await disciplineApi.postCaseAction(`${path}/observations`, { message: message.trim() });
      if (action === 'requestInformation') {
        await disciplineApi.postCaseAction(`${path}/information-requests`, { message: message.trim() });
      }
      if (action === 'respondInformation') {
        await disciplineApi.postCaseAction(`${path}/information-requests/response`, {
          requestEventId: Number(requestEventId),
          message: message.trim(),
        });
      }
      if (action === 'requestCounsel') {
        await disciplineApi.postCaseAction(`${path}/counsel-requests`, { message: message.trim() });
      }
      if (action === 'issueCounsel') {
        await disciplineApi.postCaseAction(`${path}/counsel-opinions`, { message: message.trim() });
      }
      if (action === 'resolve') {
        await disciplineApi.postCaseAction(`${path}/resolution`, {
          outcome,
          reasoning: message.trim(),
          severity: outcome === 'MODIFY' ? severity : undefined,
        });
      }
      if (action === 'archive') {
        await disciplineApi.postCaseAction(`${path}/archive`, { reason: message.trim() });
      }
      if (action === 'annul') {
        await disciplineApi.postCaseAction(`${path}/annulment`, { reason: message.trim() });
      }
      setAction(null);
      setMessage('');
      reload();
    } catch (reason) {
      setError(reason instanceof DisciplineApiError ? reason.message : 'No se pudo guardar la acción.');
    } finally {
      setSaving(false);
    }
  };

  const submitFollowUp = async (event: FormEvent) => {
    event.preventDefault();
    if (followDescription.trim().length < 10) {
      setError('La descripción del seguimiento debe tener al menos 10 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await disciplineApi.postCaseAction(`/disciplinary/cases/${detail.id}/follow-ups`, {
        kind: followKind,
        followedOn,
        description: followDescription,
        participants: participants.trim() || undefined,
        reviewOn: reviewOn || undefined,
      });
      setFollowDescription('');
      setReviewOn('');
      setParticipants('');
      reload();
    } catch (reason) {
      setError(reason instanceof DisciplineApiError ? reason.message : 'No se pudo registrar el seguimiento.');
    } finally {
      setSaving(false);
    }
  };

  const closeFollowUp = async (followUpId: number, result: 'MET' | 'UNMET', note: string) => {
    if (note.trim().length < 10) {
      setError('La observación del resultado debe tener al menos 10 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await disciplineApi.postCaseAction(`/disciplinary/cases/${detail.id}/follow-ups/${followUpId}/outcome`, {
        outcome: result,
        note: note.trim(),
      });
      setClosing(null);
      reload();
    } catch (reason) {
      setError(reason instanceof DisciplineApiError ? reason.message : 'No se pudo cerrar el compromiso.');
    } finally {
      setSaving(false);
    }
  };

  const openPrimary = () => {
    setError(null);
    if (stage.primaryAction === 'open_communicate') {
      setAction(null);
      setShowCommunicate(true);
      window.setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
      return;
    }
    if (stage.primaryAction) selectAction(stage.primaryAction);
  };

  const toggleShelf = (next: Shelf) => setShelf((current) => (current === next ? 'none' : next));

  return (
    <div className={styles.cockpit}>
      {error ? <Alert>{error}</Alert> : null}
      <p className={styles.back}>
        <Link to={portalPathForSession(DISCIPLINE_CASES_PATH)}>Volver a la bandeja</Link>
      </p>

      <header className={`${styles.heading} ${styles.hero}`}>
        <div>
          <p className={styles.kicker}>{detail.caseNumber}</p>
          <h2>
            <Link to={portalPathForSession(disciplineHistoryPath(detail.student.id))}>
              {detail.student.fullName}
            </Link>
          </h2>
          <p>
            {detail.sectionLabel ?? 'Sin sección'} · {infractionLabel}
          </p>
        </div>
        <div className={styles.badges}>
          <Badge tone={STATUS_TONES[detail.status]}>{STATUS_LABELS[detail.status]}</Badge>
          <Badge tone={SEVERITY_TONES[detail.severity]}>
            {detail.severityLabel} · {detail.deduction}
          </Badge>
          <Badge tone={DEADLINE_TONES[detail.deadline]}>
            {DEADLINE_LABELS[detail.deadline]}
            {detail.dueOn ? ` · ${formatShortDate(detail.dueOn)}` : ''}
          </Badge>
          {sessionHasPermission(DISCIPLINE_PERMISSIONS.export) ? (
            <Button
              onClick={() => {
                void disciplineApi
                  .exportCasePdf(detail.id, `expediente-${detail.caseNumber}.pdf`)
                  .catch((reason: unknown) => {
                    setError(reason instanceof Error ? reason.message : 'No se pudo exportar el expediente.');
                  });
              }}
              type="button"
              variant="secondary"
            >
              PDF del expediente
            </Button>
          ) : null}
        </div>
      </header>

      {detail.track === 'DUE_PROCESS' && stage.reacStep ? (
        <nav aria-label="Pasos del debido proceso" className={styles.rail}>
          <p className={styles.railHint}>Toque un paso para verlo. Si aún no corresponde, verá una vista previa.</p>
          <ol className={styles.railList}>
            {reacRail().map((item) => {
              const live = stage.reacStep as ReacStep;
              const state = railState(item.step, live);
              const selected = (viewedStep ?? live) === item.step;
              return (
                <li className={`${styles[state]}${selected ? ` ${styles.railSelected}` : ''}`} key={item.step}>
                  <button
                    aria-current={selected ? 'step' : undefined}
                    className={styles.railButton}
                    onClick={() => {
                      setViewedStep(item.step);
                      setAction(null);
                      setShowCommunicate(item.step === 3 && item.step === live);
                      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" className={styles.railMarker}>
                      {state === 'done' ? '✓' : item.step}
                    </span>
                    <span className={styles.railLabel}>
                      <span className={styles.railStep}>Paso {item.step}</span>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      ) : detail.track === 'DIRECT' ? (
        <p className={styles.directTag}>Vía de amonestación directa · sin investigación</p>
      ) : null}

      {(() => {
        const liveStep = stage.reacStep;
        const displayStep = viewedStep ?? liveStep;
        const phase =
          displayStep && liveStep ? stepPhase(displayStep, liveStep) : ('current' as const);
        const onLiveStep = phase === 'current';

        const actionComposer =
          action && action !== 'communicate' && action !== 'followUp' ? (
            <form className={styles.composer} ref={actionFormRef} onSubmit={submit}>
              <div className={styles.composerHead}>
                <p className={styles.composerTitle}>{CASE_ACTION_LABELS[action]}</p>
                <button className={styles.composerCancel} type="button" onClick={() => setAction(null)}>
                  Cancelar
                </button>
              </div>
              {ACTION_HINTS[action] ? <p className={styles.muted}>{ACTION_HINTS[action]}</p> : null}
              {action === 'respondInformation' ? (
                <label>
                  Solicitud
                  <Select
                    value={requestEventId}
                    required
                    onChange={(event) => setRequestEventId(event.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {requests.map((request) => (
                      <option key={request.id} value={request.id}>
                        {request.message}
                      </option>
                    ))}
                  </Select>
                </label>
              ) : null}
              {action === 'resolve' ? (
                <label>
                  Resultado
                  <Select value={outcome} onChange={(event) => setOutcome(event.target.value)}>
                    <option value="DISMISS">Desestima</option>
                    <option value="MODIFY">Modifica</option>
                    <option value="UPHOLD">Mantiene</option>
                  </Select>
                </label>
              ) : null}
              {action === 'resolve' && outcome === 'MODIFY' ? (
                <label>
                  Nueva gravedad
                  <Select
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value as InfractionSeverity)}
                  >
                    {SEVERITY_ORDER.filter((code) => code !== detail.severity).map((code) => (
                      <option key={code} value={code}>
                        {SEVERITY_LABELS[code]}
                      </option>
                    ))}
                  </Select>
                </label>
              ) : null}
              {action === 'investigate' ? (
                <p>El expediente pasa a investigación y abre 10 días hábiles.</p>
              ) : (
                <label>
                  {action === 'resolve'
                    ? 'Fundamentación (mín. 50)'
                    : action === 'archive' || action === 'annul'
                      ? 'Justificación (mín. 20)'
                      : 'Texto (mín. 10 caracteres)'}
                  <Textarea
                    ref={messageRef}
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </label>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : `Confirmar: ${CASE_ACTION_LABELS[action]}`}
              </Button>
            </form>
          ) : null;

        return (
          <>
            {onLiveStep ? (
              <section aria-labelledby="now-title" className={styles.nowCard}>
                <p className={styles.nowKicker}>{stage.kicker}</p>
                <h3 id="now-title">{stage.title}</h3>
                <p className={styles.nowBody}>{stage.body}</p>
                {stage.primaryAction ? (
                  <div className={styles.primaryRow}>
                    <Button
                      className={styles.primaryCta}
                      onClick={openPrimary}
                      type="button"
                      variant={
                        communicateOpen && stage.primaryAction === 'open_communicate'
                          ? 'secondary'
                          : 'primary'
                      }
                    >
                      {stage.primaryLabel}
                    </Button>
                    {stage.primaryHint ? (
                      <span className={styles.primaryHint}>{stage.primaryHint}</span>
                    ) : null}
                  </div>
                ) : (
                  <p className={styles.muted}>
                    En este momento no hay una acción principal para su rol.
                  </p>
                )}
                {stage.secondaryActions.length > 0 ? (
                  <SecondaryActionsMenu
                    actions={stage.secondaryActions.filter((item) => {
                      if (item === 'respondInformation') return requests.length > 0;
                      return true;
                    })}
                    active={action}
                    onSelect={selectAction}
                  />
                ) : null}
              </section>
            ) : displayStep && liveStep ? (
              <div className={styles.previewToolbar}>
                <p>
                  Viendo el <strong>paso {displayStep}</strong> · el expediente está en el paso{' '}
                  <strong>{liveStep}</strong>
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setViewedStep(null);
                    setShowCommunicate(liveStep === 3 && actions.includes('communicate'));
                  }}
                >
                  Volver al paso actual
                </Button>
              </div>
            ) : null}

            <div className={styles.workspace} ref={workspaceRef}>
              {displayStep ? (
                <CaseStepWorkspace
                  step={displayStep}
                  phase={phase}
                  detail={detail}
                  isConductor={isConductor}
                  liveActions={
                    onLiveStep
                      ? {
                          canCommunicate: actions.includes('communicate'),
                          showCommunicate: communicateOpen,
                          onSelectAction: selectAction,
                          onChanged: reload,
                          onError: setError,
                          composer: actionComposer,
                        }
                      : undefined
                  }
                />
              ) : null}

              {onLiveStep && displayStep != null ? (
                <CaseProcessPanel
                  detail={detail}
                  isConductor={isConductor}
                  canCommunicate={displayStep === 3 && actions.includes('communicate')}
                  showCommunicate={displayStep === 3 && communicateOpen}
                  hideDefense={displayStep === 4}
                  layout="cockpit"
                  onChanged={reload}
                  onError={setError}
                />
              ) : null}

              {onLiveStep && !displayStep ? actionComposer : null}
            </div>
          </>
        );
      })()}

      <div className={styles.shelfBar}>
        <button
          aria-expanded={shelf === 'facts'}
          className={`${styles.shelfTab} ${shelf === 'facts' ? styles.shelfTabActive : ''}`}
          onClick={() => toggleShelf('facts')}
          type="button"
        >
          <NotebookPen aria-hidden="true" size={16} />
          Hechos y evidencias
          <ChevronDown aria-hidden="true" className={styles.shelfChevron} size={16} />
        </button>
        <button
          aria-expanded={shelf === 'history'}
          className={`${styles.shelfTab} ${shelf === 'history' ? styles.shelfTabActive : ''}`}
          onClick={() => toggleShelf('history')}
          type="button"
        >
          <History aria-hidden="true" size={16} />
          Cronología
          <ChevronDown aria-hidden="true" className={styles.shelfChevron} size={16} />
        </button>
        <button
          aria-expanded={shelf === 'follow'}
          className={`${styles.shelfTab} ${shelf === 'follow' ? styles.shelfTabActive : ''}`}
          onClick={() => toggleShelf('follow')}
          type="button"
        >
          Seguimiento
          <ChevronDown aria-hidden="true" className={styles.shelfChevron} size={16} />
        </button>
      </div>

      {shelf === 'facts' ? (
        <section className={styles.card}>
          <h3>Hechos</h3>
          <p>{detail.description}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Lugar</dt>
              <dd>{detail.place}</dd>
            </div>
            <div>
              <dt>Fecha del hecho</dt>
              <dd>{detail.occurredAt ? formatShortDate(detail.occurredAt.slice(0, 10)) : 'Sin fecha'}</dd>
            </div>
            <div>
              <dt>Cédula</dt>
              <dd>{detail.student.nationalId}</dd>
            </div>
            {detail.witnesses ? (
              <div>
                <dt>Testigos</dt>
                <dd>{detail.witnesses}</dd>
              </div>
            ) : null}
          </dl>
          {detail.resolutionReasoning ? (
            <p>
              <strong>
                Resolución ({OUTCOME_LABELS[detail.resolutionOutcome ?? ''] ?? detail.resolutionOutcome}):{' '}
              </strong>
              {detail.resolutionReasoning}
            </p>
          ) : null}
          <h3>Evidencias</h3>
          {detail.evidences.length === 0 ? <p className={styles.muted}>Sin evidencias.</p> : null}
          <ul className={styles.list}>
            {detail.evidences.map((file) => (
              <li key={file.id}>
                <FileText size={16} />
                <span>{file.originalName}</span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void disciplineApi.downloadCaseEvidence(detail.id, file.id, file.originalName)}
                >
                  Descargar
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {shelf === 'history' ? (
        <section className={styles.card}>
          <div className={styles.shelfIntro}>
            <h3>Cronología</h3>
            <p className={styles.muted}>
              Historial del expediente, del más reciente al más antiguo. Los hitos del proceso destacan
              frente a las notas.
            </p>
          </div>
          {detail.events.length === 0 ? (
            <p className={styles.emptyState}>Todavía no hay movimientos registrados.</p>
          ) : (
            <ol className={styles.chrono}>
              {[...detail.events].reverse().map((item) => {
                const tone = eventTone(item.type);
                return (
                  <li className={`${styles.chronoItem} ${styles[`tone_${tone}`]}`} key={item.id}>
                    <div className={styles.chronoMarker} aria-hidden="true" />
                    <div className={styles.chronoBody}>
                      <div className={styles.chronoHead}>
                        <strong>{EVENT_LABELS[item.type] ?? item.type}</strong>
                        <span className={styles.chronoMeta}>
                          {item.createdAt ? formatShortDate(item.createdAt.slice(0, 10)) : 'Sin fecha'}
                          {' · '}
                          {item.actorName ?? 'Sistema'}
                        </span>
                      </div>
                      <EventBody event={item} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      ) : null}

      {shelf === 'follow' ? (
        <section className={styles.card}>
          <div className={styles.shelfIntro}>
            <h3>Seguimiento</h3>
            <p className={styles.muted}>
              Entrevistas, compromisos y reuniones de acompañamiento. No cambian el estado del
              expediente ni la nota de conducta.
            </p>
          </div>
          {detail.followUps.length === 0 ? (
            <div className={styles.emptyPanel}>
              <p className={styles.emptyState}>Aún no hay seguimientos en este expediente.</p>
              <p className={styles.muted}>
                Use el formulario de abajo cuando converse con el estudiante o el encargado.
              </p>
            </div>
          ) : (
            <ul className={styles.followList}>
              {detail.followUps.map((item) => (
                <li className={styles.followCard} key={item.id}>
                  <div className={styles.followCardHead}>
                    <strong>{FOLLOW_UP_KIND_LABELS[item.kind] ?? item.kind}</strong>
                    <Badge
                      tone={
                        item.outcome === 'UNMET' ? 'danger' : item.outcome === 'MET' ? 'success' : 'neutral'
                      }
                    >
                      {OUTCOME_LABELS[item.outcome]}
                    </Badge>
                  </div>
                  <span className={styles.chronoMeta}>{formatShortDate(item.followedOn)}</span>
                  <p>{item.description}</p>
                  {item.outcomeNote ? <p className={styles.muted}>{item.outcomeNote}</p> : null}
                  {actions.includes('followUp') &&
                  item.kind === 'COMMITMENT' &&
                  item.outcome === 'PENDING' ? (
                    <div className={styles.inline}>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={saving}
                        onClick={() => setClosing({ id: item.id, outcome: 'MET', note: '' })}
                      >
                        Cumplido
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={saving}
                        onClick={() => setClosing({ id: item.id, outcome: 'UNMET', note: '' })}
                      >
                        Incumplido
                      </Button>
                    </div>
                  ) : null}
                  {closing?.id === item.id ? (
                    <form
                      className={styles.form}
                      onSubmit={(event) => {
                        event.preventDefault();
                        void closeFollowUp(item.id, closing.outcome, closing.note);
                      }}
                    >
                      <label>
                        Observación del resultado (mín. 10 caracteres)
                        <Textarea
                          rows={3}
                          value={closing.note}
                          onChange={(event) => setClosing({ ...closing, note: event.target.value })}
                        />
                      </label>
                      <Button type="submit" disabled={saving}>
                        {closing.outcome === 'MET' ? 'Confirmar cumplido' : 'Confirmar incumplido'}
                      </Button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {actions.includes('followUp') ? (
            <form className={`${styles.form} ${styles.followForm}`} onSubmit={submitFollowUp}>
              <p className={styles.composerTitle}>Registrar un seguimiento</p>
              <p className={styles.muted}>Tipo, fecha y una descripción clara de lo conversado.</p>
              <div className={styles.kindChips} role="group" aria-label="Tipo de seguimiento">
                {Object.entries(FOLLOW_UP_KIND_LABELS).map(([code, label]) => (
                  <button
                    className={`${styles.kindChip} ${followKind === code ? styles.kindChipActive : ''}`}
                    key={code}
                    onClick={() => setFollowKind(code)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.grid}>
                <label>
                  Fecha
                  <Input
                    type="date"
                    value={followedOn}
                    required
                    onChange={(event) => setFollowedOn(event.target.value)}
                  />
                </label>
                <label>
                  Revisar el
                  <Input type="date" value={reviewOn} onChange={(event) => setReviewOn(event.target.value)} />
                </label>
              </div>
              <label>
                Qué ocurrió
                <Textarea
                  rows={3}
                  value={followDescription}
                  onChange={(event) => setFollowDescription(event.target.value)}
                  placeholder="Ej.: Se reunió con el encargado; acordaron…"
                />
              </label>
              <label>
                Quién participó (opcional)
                <Input
                  value={participants}
                  onChange={(event) => setParticipants(event.target.value)}
                  placeholder="Guía, encargado, estudiante…"
                />
              </label>
              <Button type="submit" disabled={saving}>
                Guardar seguimiento
              </Button>
            </form>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

function SecondaryActionsMenu({
  actions,
  active,
  onSelect,
}: {
  actions: CaseAction[];
  active: CaseAction | null;
  onSelect: (action: CaseAction) => void;
}) {
  const [open, setOpen] = useState(false);
  if (actions.length === 0) return null;

  const usual = actions.filter((item) => item !== 'annul' && item !== 'archive');
  const heavy = actions.filter((item) => item === 'archive' || item === 'annul');

  return (
    <div className={styles.secondaryBlock}>
      <button
        aria-expanded={open}
        className={styles.secondaryToggle}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>
          <strong>Otras acciones de este paso</strong>
          <span className={styles.secondaryToggleHint}>
            Observaciones, pedidos a Orientación u opciones de cierre
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`${styles.moreToolsChevron}${open ? ` ${styles.moreToolsChevronOpen}` : ''}`}
          size={18}
        />
      </button>
      {open ? (
        <div className={styles.secondaryMenu}>
          {usual.map((item) => (
            <button
              className={`${styles.secondaryItem} ${active === item ? styles.secondaryItemActive : ''}`}
              key={item}
              onClick={() => onSelect(item)}
              type="button"
            >
              <strong>{CASE_ACTION_LABELS[item]}</strong>
              {ACTION_HINTS[item] ? <span>{ACTION_HINTS[item]}</span> : null}
            </button>
          ))}
          {heavy.length > 0 ? (
            <div className={styles.secondaryDanger}>
              {heavy.map((item) => (
                <button
                  className={`${styles.secondaryItem} ${styles.secondaryItemDanger} ${
                    active === item ? styles.secondaryItemActive : ''
                  }`}
                  key={item}
                  onClick={() => onSelect(item)}
                  type="button"
                >
                  <strong>{CASE_ACTION_LABELS[item]}</strong>
                  {ACTION_HINTS[item] ? <span>{ACTION_HINTS[item]}</span> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EventBody({ event }: { event: DisciplinaryCaseEvent }) {
  const note = event.payload?.message ?? event.payload?.note;
  const text = typeof note === 'string' ? note.trim() : '';
  const from = event.fromStatus ? STATUS_LABELS[event.fromStatus as keyof typeof STATUS_LABELS] : null;
  const to = event.toStatus ? STATUS_LABELS[event.toStatus as keyof typeof STATUS_LABELS] : null;
  return (
    <>
      {from && to ? (
        <p className={styles.chronoStatus}>
          {from} → {to}
        </p>
      ) : null}
      {text ? <p className={styles.chronoNote}>{text}</p> : null}
    </>
  );
}

function hasPendingCounselRequest(events: DisciplinaryCaseEvent[]) {
  const answered = new Set(
    events
      .filter((event) => event.type === 'COUNSEL_OPINION')
      .map((event) => Number(event.payload?.requestEventId)),
  );
  return events.some((event) => event.type === 'COUNSEL_REQUEST' && !answered.has(event.id));
}

function openInformationRequests(events: DisciplinaryCaseEvent[]) {
  const answered = new Set(
    events
      .filter((event) => event.type === 'INFO_RESPONSE')
      .map((event) => Number(event.payload?.requestEventId)),
  );
  return events
    .filter((event) => event.type === 'INFO_REQUEST' && !answered.has(event.id))
    .map((event) => ({
      id: event.id,
      message: typeof event.payload?.message === 'string' ? event.payload.message : `Solicitud ${event.id}`,
    }));
}
