import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { Alert, Badge, Button, Input, SegmentedTabs, Select, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import {
  availableCaseActions,
  CASE_ACTION_LABELS,
  EVENT_LABELS,
  FOLLOW_UP_KIND_LABELS,
  type CaseAction,
} from '../model/caseActions';
import { DEADLINE_LABELS, DEADLINE_TONES, STATUS_LABELS, STATUS_TONES } from '../model/caseInbox';
import { DISCIPLINE_CASES_PATH, DISCIPLINE_PERMISSIONS, disciplineHistoryPath } from '../model/disciplineRouting';
import { SEVERITY_LABELS, SEVERITY_ORDER, SEVERITY_TONES } from '../model/severity';
import type { DisciplinaryCaseDetail, DisciplinaryCaseEvent, InfractionSeverity } from '../model/types';
import { CaseJourney } from './CaseJourney';
import { CaseProcessPanel } from './CaseProcessPanel';
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
  const [tab, setTab] = useState<'resumen' | 'tramite' | 'historia'>('resumen');
  const [closing, setClosing] = useState<{ id: number; outcome: 'MET' | 'UNMET'; note: string } | null>(null);

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
    const procedural =
      detail.status === 'INVESTIGATING' ||
      detail.status === 'COMMUNICATED' ||
      detail.status === 'PENDING_RESOLUTION' ||
      detail.status === 'RESOLVED' ||
      detail.status === 'IN_APPEAL';
    setTab(procedural ? 'tramite' : 'resumen');
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!action || action === 'communicate' || action === 'followUp') return;
    setSaving(true);
    setError(null);
    try {
      const path = `/disciplinary/cases/${detail.id}`;
      if (action === 'investigate') await disciplineApi.postCaseAction(`${path}/investigation`);
      if (action === 'observe') await disciplineApi.postCaseAction(`${path}/observations`, { message });
      if (action === 'requestInformation') {
        await disciplineApi.postCaseAction(`${path}/information-requests`, { message });
      }
      if (action === 'respondInformation') {
        await disciplineApi.postCaseAction(`${path}/information-requests/response`, {
          requestEventId: Number(requestEventId),
          message,
        });
      }
      if (action === 'requestCounsel') await disciplineApi.postCaseAction(`${path}/counsel-requests`, { message });
      if (action === 'issueCounsel') await disciplineApi.postCaseAction(`${path}/counsel-opinions`, { message });
      if (action === 'resolve') {
        await disciplineApi.postCaseAction(`${path}/resolution`, {
          outcome,
          reasoning: message,
          severity: outcome === 'MODIFY' ? severity : undefined,
        });
      }
      if (action === 'archive') await disciplineApi.postCaseAction(`${path}/archive`, { reason: message });
      if (action === 'annul') await disciplineApi.postCaseAction(`${path}/annulment`, { reason: message });
      setAction(null);
      setMessage('');
      reload();
    } catch (reason) {
      setError(reason instanceof DisciplineApiError ? reason.message : 'No se pudo completar la acción.');
    } finally {
      setSaving(false);
    }
  };

  const submitFollowUp = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
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

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        {error ? <Alert>{error}</Alert> : null}
        <p className={styles.back}>
          <Link to={DISCIPLINE_CASES_PATH}>Volver a la bandeja</Link>
        </p>
        <header className={`${styles.heading} ${styles.hero}`}>
          <div>
            <p className={styles.kicker}>{detail.caseNumber}</p>
            <h2>
              <Link to={disciplineHistoryPath(detail.student.id)}>{detail.student.fullName}</Link>
            </h2>
            <p>
              {detail.sectionLabel ?? 'Sin sección'} · {detail.infractionName}
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
                  void disciplineApi.exportCasePdf(detail.id, `expediente-${detail.caseNumber}.pdf`).catch((reason: unknown) => {
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

        <CaseJourney status={detail.status} track={detail.track} />

        <SegmentedTabs
          aria-label="Partes del expediente"
          items={[
            { id: 'resumen', label: 'Qué pasó' },
            { id: 'tramite', label: 'Trámite' },
            { id: 'historia', label: 'Cronología' },
          ]}
          onChange={setTab}
          value={tab}
        />

        {tab === 'resumen' ? (
          <>
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
                  <strong>Resolución ({OUTCOME_LABELS[detail.resolutionOutcome ?? ''] ?? detail.resolutionOutcome}): </strong>
                  {detail.resolutionReasoning}
                </p>
              ) : null}
            </section>

            <section className={styles.card}>
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
          </>
        ) : null}

        {tab === 'tramite' ? (
          <>
            <CaseProcessPanel
              detail={detail}
              isConductor={isConductor}
              canCommunicate={actions.includes('communicate')}
              onChanged={reload}
              onError={setError}
            />

            <section className={styles.card}>
              <h3>Seguimiento</h3>
              <p className={styles.muted}>
                Compromisos y reuniones de acompañamiento. No cambian el estado del expediente ni la nota.
              </p>
              {detail.followUps.length === 0 ? <p className={styles.muted}>Sin seguimientos.</p> : null}
              <ul className={styles.timeline}>
                {detail.followUps.map((item) => (
                  <li key={item.id}>
                    <strong>{FOLLOW_UP_KIND_LABELS[item.kind] ?? item.kind}</strong>
                    <span>{formatShortDate(item.followedOn)}</span>
                    <p>{item.description}</p>
                    <Badge tone={item.outcome === 'UNMET' ? 'danger' : item.outcome === 'MET' ? 'success' : 'neutral'}>
                      {OUTCOME_LABELS[item.outcome]}
                    </Badge>
                    {item.outcomeNote ? <p>{item.outcomeNote}</p> : null}
                    {actions.includes('followUp') && item.kind === 'COMMITMENT' && item.outcome === 'PENDING' ? (
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
                          Observación del resultado, al menos 10 caracteres
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
              {actions.includes('followUp') ? (
                <form className={styles.form} onSubmit={submitFollowUp}>
                  <div className={styles.grid}>
                    <label>
                      Tipo
                      <Select value={followKind} onChange={(event) => setFollowKind(event.target.value)}>
                        {Object.entries(FOLLOW_UP_KIND_LABELS).map(([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label>
                      Fecha
                      <Input type="date" value={followedOn} required onChange={(event) => setFollowedOn(event.target.value)} />
                    </label>
                  </div>
                  <label>
                    Descripción
                    <Textarea rows={3} value={followDescription} onChange={(event) => setFollowDescription(event.target.value)} />
                  </label>
                  <div className={styles.grid}>
                    <label>
                      Participantes
                      <Input value={participants} onChange={(event) => setParticipants(event.target.value)} />
                    </label>
                    <label>
                      Revisión
                      <Input type="date" value={reviewOn} onChange={(event) => setReviewOn(event.target.value)} />
                    </label>
                  </div>
                  <Button type="submit" disabled={saving}>
                    Guardar seguimiento
                  </Button>
                </form>
              ) : null}
            </section>
          </>
        ) : null}

        {tab === 'historia' ? (
          <section className={styles.card}>
            <h3>Cronología</h3>
            <ol className={styles.timeline}>
              {detail.events.map((item) => (
                <li key={item.id}>
                  <strong>{EVENT_LABELS[item.type] ?? item.type}</strong>
                  <span>
                    {item.actorName ?? 'Sistema'}
                    {item.createdAt ? ` · ${formatShortDate(item.createdAt.slice(0, 10))}` : ''}
                  </span>
                  <EventBody event={item} />
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      <aside className={styles.actions}>
        <h3>Qué puede hacer</h3>
        {actions.filter((item) => item !== 'followUp').length === 0 ? (
          <p className={styles.muted}>En este estado su rol no tiene acciones. Puede revisar los hechos y la cronología.</p>
        ) : null}
        <div className={styles.actionList}>
          {actions
            .filter((item) => item !== 'followUp' && item !== 'communicate')
            .map((item) => (
              <button
                className={`${styles.actionChoice} ${action === item ? styles.actionChoiceActive : ''}`}
                key={item}
                type="button"
                onClick={() => setAction(item)}
              >
                <strong>{CASE_ACTION_LABELS[item]}</strong>
                {ACTION_HINTS[item] ? <span>{ACTION_HINTS[item]}</span> : null}
              </button>
            ))}
          {actions.includes('communicate') ? (
            <p className={styles.muted}>Comunicar el cargo está en la pestaña Trámite.</p>
          ) : null}
        </div>
        {action && action !== 'communicate' && action !== 'followUp' ? (
          <form className={styles.form} onSubmit={submit}>
            {action === 'respondInformation' ? (
              <label>
                Solicitud
                <Select value={requestEventId} required onChange={(event) => setRequestEventId(event.target.value)}>
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
                <Select value={severity} onChange={(event) => setSeverity(event.target.value as InfractionSeverity)}>
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
                {action === 'resolve' ? 'Fundamentación' : action === 'archive' || action === 'annul' ? 'Justificación' : 'Texto'}
                <Textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
              </label>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : CASE_ACTION_LABELS[action]}
            </Button>
          </form>
        ) : null}
      </aside>
    </div>
  );
};

function EventBody({ event }: { event: DisciplinaryCaseEvent }) {
  const note = event.payload?.message ?? event.payload?.note;
  const text = typeof note === 'string' ? note : '';
  const from = event.fromStatus ? STATUS_LABELS[event.fromStatus as keyof typeof STATUS_LABELS] : null;
  const to = event.toStatus ? STATUS_LABELS[event.toStatus as keyof typeof STATUS_LABELS] : null;
  return (
    <>
      {from && to ? (
        <span>
          {from} → {to}
        </span>
      ) : null}
      {text ? <p>{text}</p> : null}
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
