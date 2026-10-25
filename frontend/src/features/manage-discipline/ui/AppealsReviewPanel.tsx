import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Alert, Badge, Button, EmptyState, Select } from '@/shared/ui';
import { disciplineApi } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import { DEADLINE_LABELS, DEADLINE_TONES } from '../model/caseInbox';
import { APPEAL_KIND_LABELS, appealOutcomeLabel } from '../model/appealCenter';
import { APPEAL_REVIEW_COPY, appealReviewHref } from '../model/appealReview';
import type { AppealKind, DeadlineIndicator, DisciplinaryAppealReviewPage } from '../model/types';
import styles from './AppealsCenter.module.css';

const KIND_FILTERS: Array<{ value: '' | AppealKind; label: string }> = [
  { value: '', label: 'Todos los tipos' },
  { value: 'REVOCATION', label: 'Revocatoria' },
  { value: 'APPEAL', label: 'Apelación' },
];

export const AppealsReviewPanel = () => {
  const [kind, setKind] = useState<'' | AppealKind>('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<DisciplinaryAppealReviewPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void disciplineApi
      .listReviewableAppeals({ page, kind: kind || undefined })
      .then((next) => {
        if (!active) return;
        setResult(next);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar la bandeja.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, page]);

  const total = result?.total ?? 0;
  const pageSize = result?.pageSize ?? 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <h2>{APPEAL_REVIEW_COPY.title}</h2>
        <p className={styles.muted}>{APPEAL_REVIEW_COPY.noCommittee}</p>
        <label className={styles.field}>
          Tipo de recurso
          <Select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as '' | AppealKind);
              setPage(1);
            }}
          >
            {KIND_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando bandeja…</p> : null}
      {!loading && result && result.data.length === 0 ? (
        <EmptyState icon={Scale} title={APPEAL_REVIEW_COPY.empty} description="Cuando un recurso quede a su cargo, aparecerá aquí." />
      ) : null}
      {!loading && result && result.data.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Estudiante</th>
                <th>Recurso</th>
                <th>Presentado</th>
                <th>Estado</th>
                <th>Plazo</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>
                      <Link
                        className={styles.caseLink}
                        to={appealReviewHref(row.id)}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {row.caseNumber}
                      </Link>
                    </strong>
                  </td>
                  <td>{row.studentFullName}</td>
                  <td>{APPEAL_KIND_LABELS[row.kind]}</td>
                  <td>{row.filedAt ? formatShortDate(row.filedAt) : '—'}</td>
                  <td>{appealOutcomeLabel(row.outcome)}</td>
                  <td>
                    <Badge tone={DEADLINE_TONES[row.deadline as DeadlineIndicator] ?? 'neutral'}>
                      {row.dueOn ? formatShortDate(row.dueOn) : DEADLINE_LABELS[row.deadline]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {pages > 1 ? (
        <div className={styles.pager}>
          <Button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Anterior
          </Button>
          <span className={styles.muted}>
            Página {page} de {pages}
          </span>
          <Button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>
            Siguiente
          </Button>
        </div>
      ) : null}
    </section>
  );
};
