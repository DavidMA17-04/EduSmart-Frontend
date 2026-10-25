import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { APPEAL_KIND_LABELS, appealOutcomeLabel } from '../model/appealCenter';
import {
  APPEAL_TRACKING_COPY,
  appealDay,
  appealTrackingCaseHref,
  canConfirmAppealRead,
} from '../model/appealTracking';
import { formatShortDate } from '../model/businessDays';
import { STATUS_LABELS, STATUS_TONES } from '../model/caseInbox';
import { DISCIPLINE_APPEALS_PATH } from '../model/disciplineRouting';
import { notifyDisciplineInboxChanged } from '../model/guardianInbox';
import type { DisciplinaryAppealTracking } from '../model/types';
import { AppealsListPanel } from './AppealsListPanel';
import styles from './AppealsCenter.module.css';

export const AppealTrackingPanel = () => {
  const { appealId } = useParams();
  const id = Number(appealId);
  const [item, setItem] = useState<DisciplinaryAppealTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = () => {
    if (!Number.isInteger(id) || id <= 0) {
      setError('El recurso no es válido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    void disciplineApi
      .getAppeal(id)
      .then((next) => {
        setItem(next);
        setError(null);
      })
      .catch((reason: unknown) => {
        setItem(null);
        setError(reason instanceof Error ? reason.message : 'No se pudo abrir el seguimiento.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarga al cambiar el recurso
  }, [id]);

  const confirmRead = () => {
    if (!item || !canConfirmAppealRead(item.resolutionNotice) || !item.resolutionNotice?.notificationId) return;
    setPending(true);
    setError(null);
    void disciplineApi
      .confirmNotificationRead(item.resolutionNotice.notificationId)
      .then((receipt) => {
        setNotice(receipt.label);
        notifyDisciplineInboxChanged();
        return load();
      })
      .catch((reason: unknown) => {
        setError(reason instanceof DisciplineApiError ? reason.message : 'No se pudo confirmar la lectura.');
      })
      .finally(() => setPending(false));
  };

  return (
    <section className={styles.panel}>
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert>{notice}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando seguimiento…</p> : null}
      {item ? (
        <>
          <div className={styles.preview}>
            <h2>{APPEAL_TRACKING_COPY.title}</h2>
            <dl>
              <div>
                <dt>Expediente</dt>
                <dd>
                  <Link className={styles.caseLink} to={appealTrackingCaseHref(item.caseId)}>
                    {item.caseNumber}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Estudiante</dt>
                <dd>{item.studentFullName}</dd>
              </div>
              <div>
                <dt>Recurso</dt>
                <dd>{APPEAL_KIND_LABELS[item.kind]}</dd>
              </div>
              <div>
                <dt>Presentado</dt>
                <dd>{item.filedAt ? formatShortDate(appealDay(item.filedAt) ?? item.filedAt) : '—'}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <Badge tone={item.outcome ? 'success' : 'warning'}>{appealOutcomeLabel(item.outcome)}</Badge>
                </dd>
              </div>
              <div>
                <dt>Situación</dt>
                <dd>
                  <Badge tone={STATUS_TONES[item.caseStatus]}>{STATUS_LABELS[item.caseStatus]}</Badge>
                </dd>
              </div>
              <div>
                <dt>Rebajo</dt>
                <dd>{item.deductionLabel ?? '—'}</dd>
              </div>
              {item.witnesses ? (
                <div>
                  <dt>Testigos</dt>
                  <dd>{item.witnesses}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className={styles.card}>
            <h2>{APPEAL_TRACKING_COPY.timeline}</h2>
            {item.timeline.length === 0 ? (
              <p className={styles.muted}>Aún no hay acontecimientos registrados de este recurso.</p>
            ) : (
              <ol className={styles.timeline}>
                {item.timeline.map((entry) => (
                  <li key={`${entry.kind}-${entry.occurredAt}`}>
                    <strong>{entry.title}</strong>
                    <span>
                      <Badge tone={entry.kind === 'READ' ? 'success' : entry.kind.includes('RESOLVED') ? 'success' : 'warning'}>
                        {entry.statusLabel}
                      </Badge>
                      {formatShortDate(appealDay(entry.occurredAt) ?? entry.occurredAt)}
                    </span>
                    {entry.note ? <em>{entry.note}</em> : null}
                  </li>
                ))}
              </ol>
            )}
            <p className={styles.muted}>{APPEAL_TRACKING_COPY.noCommittee}</p>
          </div>

          <div className={styles.card}>
            <h2>Notificación</h2>
            {item.resolutionNotice ? (
              <>
                <p>
                  Resolución emitida el{' '}
                  {formatShortDate(appealDay(item.resolutionNotice.issuedAt) ?? item.resolutionNotice.issuedAt)}.
                </p>
                {item.resolutionNotice.readAt ? (
                  <p>{`${APPEAL_TRACKING_COPY.alreadyRead} el ${formatShortDate(appealDay(item.resolutionNotice.readAt) ?? item.resolutionNotice.readAt)}.`}</p>
                ) : canConfirmAppealRead(item.resolutionNotice) ? (
                  <Button type="button" disabled={pending} onClick={confirmRead}>
                    {APPEAL_TRACKING_COPY.confirmRead}
                  </Button>
                ) : (
                  <p className={styles.muted}>{APPEAL_TRACKING_COPY.physical}</p>
                )}
                <p className={styles.muted}>{APPEAL_TRACKING_COPY.openDoesNotRead}</p>
              </>
            ) : (
              <p className={styles.muted}>Todavía no hay una resolución de recurso notificada.</p>
            )}
          </div>

          <div className={styles.actions}>
            <Link to={appealTrackingCaseHref(item.caseId)}>{APPEAL_TRACKING_COPY.caseLink}</Link>
            <Link to={DISCIPLINE_APPEALS_PATH}>{APPEAL_TRACKING_COPY.back}</Link>
          </div>

          <AppealsListPanel studentUserId={item.studentUserId} title={APPEAL_TRACKING_COPY.history} />
        </>
      ) : null}
    </section>
  );
};
