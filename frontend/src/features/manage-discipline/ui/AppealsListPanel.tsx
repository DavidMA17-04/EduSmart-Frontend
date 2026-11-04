import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Alert, Badge, Button, EmptyState } from '@/shared/ui';
import { disciplineApi } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import { STATUS_LABELS, STATUS_TONES } from '../model/caseInbox';
import {
  APPEAL_CENTER_COPY,
  appealListKindLabel,
  appealOutcomeLabel,
} from '../model/appealCenter';
import { APPEAL_TRACKING_COPY, appealTrackingCaseHref, appealTrackingHref } from '../model/appealTracking';
import type { DisciplinaryAppealPage } from '../model/types';
import styles from './AppealsCenter.module.css';

export const AppealsListPanel = ({
  studentUserId,
  title = APPEAL_CENTER_COPY.myAppeals,
}: {
  studentUserId?: number;
  title?: string;
} = {}) => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<DisciplinaryAppealPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void disciplineApi
      .listAppeals({ page, studentUserId })
      .then((next) => {
        if (active) {
          setResult(next);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el listado de recursos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, studentUserId]);

  const total = result?.total ?? 0;
  const pageSize = result?.pageSize ?? 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <h2>{title}</h2>
        <p className={styles.muted}>{APPEAL_TRACKING_COPY.historyHint}</p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando recursos…</p> : null}
      {!loading && result && result.data.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No hay recursos"
          description="Cuando interponga una revocatoria o una apelación, aparecerá aquí."
        />
      ) : null}
      {!loading && result && result.data.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Recurso</th>
                <th>Presentado</th>
                <th>Estado</th>
                <th>Resultado</th>
                <th>Rebajo</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>
                      <Link
                        className={styles.caseLink}
                        to={portalPathForSession(appealTrackingHref(row.id))}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {row.caseNumber}
                      </Link>
                    </strong>
                    <span>{row.studentFullName}</span>
                    <span>
                      <Link
                        className={styles.caseLink}
                        to={portalPathForSession(appealTrackingCaseHref(row.caseId))}
                        onClick={(event) => event.stopPropagation()}
                      >
                        Expediente
                      </Link>
                    </span>
                  </td>
                  <td>{appealListKindLabel(row)}</td>
                  <td>{row.filedAt ? formatShortDate(row.filedAt.slice(0, 10)) : 'Sin fecha'}</td>
                  <td>
                    <Badge tone={STATUS_TONES[row.caseStatus]}>{STATUS_LABELS[row.caseStatus]}</Badge>
                  </td>
                  <td>{appealOutcomeLabel(row.outcome)}</td>
                  <td>{row.deductionLabel ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {total > pageSize ? (
        <div className={styles.pager}>
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Anterior
          </Button>
          <span>
            Página {page} de {pages}
          </span>
          <Button type="button" variant="secondary" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>
            Siguiente
          </Button>
        </div>
      ) : null}
    </section>
  );
};
