import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge } from '@/shared/ui';
import { disciplineApi } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import { DEADLINE_LABELS, DEADLINE_TONES } from '../model/caseInbox';
import { APPEAL_KIND_LABELS, appealOutcomeLabel } from '../model/appealCenter';
import {
  APPEAL_REVIEW_COPY,
  appealReviewCaseHref,
  canOfferPartialAccept,
  submitReviewResolution,
} from '../model/appealReview';
import { DISCIPLINE_APPEALS_REVIEW_PATH } from '../model/disciplineRouting';
import type { DisciplinaryAppealReviewItem, InfractionSeverity } from '../model/types';
import { AppealResolutionForm } from './AppealResolutionForm';
import styles from './AppealsCenter.module.css';

export const AppealReviewDetailPanel = () => {
  const { appealId } = useParams();
  const navigate = useNavigate();
  const id = Number(appealId);
  const [item, setItem] = useState<DisciplinaryAppealReviewItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!Number.isInteger(id) || id <= 0) {
      setError('El recurso no es válido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    void disciplineApi
      .getReviewableAppeal(id)
      .then((next) => {
        setItem(next);
        setError(null);
      })
      .catch((reason: unknown) => {
        setItem(null);
        setError(reason instanceof Error ? reason.message : 'No se pudo abrir la revisión.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarga al cambiar el recurso
  }, [id]);

  return (
    <section className={styles.panel}>
      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando revisión…</p> : null}
      {item ? (
        <>
          <div className={styles.preview}>
          <h2>{APPEAL_REVIEW_COPY.detail}</h2>
          <dl>
            <div>
              <dt>Expediente</dt>
              <dd>
                <Link className={styles.caseLink} to={appealReviewCaseHref(item.caseId)}>
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
              <dd>{item.filedAt ? formatShortDate(item.filedAt) : '—'}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{appealOutcomeLabel(item.outcome)}</dd>
            </div>
            <div>
              <dt>Plazo</dt>
              <dd>
                <Badge tone={DEADLINE_TONES[item.deadline] ?? 'neutral'}>
                  {item.dueOn ? formatShortDate(item.dueOn) : DEADLINE_LABELS[item.deadline]}
                </Badge>
              </dd>
            </div>
            <div>
              <dt>Fundamento</dt>
              <dd>
                <pre>{item.body}</pre>
              </dd>
            </div>
          </dl>
          </div>
          <p className={styles.muted}>{APPEAL_REVIEW_COPY.noCommittee}</p>
          <div className={styles.actions}>
            <Link to={appealReviewCaseHref(item.caseId)}>{APPEAL_REVIEW_COPY.caseLink}</Link>
            <Link to={DISCIPLINE_APPEALS_REVIEW_PATH}>Volver a la bandeja</Link>
          </div>
          <AppealResolutionForm
            appeal={item}
            allowModify={canOfferPartialAccept(item.kind)}
            currentSeverity={(item.caseSeverity as InfractionSeverity) || 'MINOR'}
            label={item.kind === 'APPEAL' ? 'Resolver apelación' : 'Resolver revocatoria'}
            onSubmit={(input) =>
              submitReviewResolution(item.kind, disciplineApi, item.caseId, item.id, {
                outcome: input.outcome as 'UPHOLD' | 'REVOKE' | 'MODIFY',
                reasoning: input.reasoning,
                severity: input.severity,
              })
            }
            onChanged={() => navigate(DISCIPLINE_APPEALS_REVIEW_PATH)}
            onError={(message) => setError(message)}
          />
        </>
      ) : null}
    </section>
  );
};
