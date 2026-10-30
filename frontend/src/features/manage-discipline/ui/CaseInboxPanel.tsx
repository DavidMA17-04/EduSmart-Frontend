import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { Alert, Badge, Button, EmptyState, Select } from '@/shared/ui';
import { disciplineApi } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import { disciplineCasePath, disciplineHistoryPath } from '../model/disciplineRouting';
import { DEADLINE_LABELS, DEADLINE_TONES, STATUS_LABELS, STATUS_TONES } from '../model/caseInbox';
import { SEVERITY_LABELS, SEVERITY_ORDER, SEVERITY_TONES } from '../model/severity';
import type { DeadlineIndicator, DisciplinaryCasePage, DisciplinaryCaseStatus, InfractionSeverity } from '../model/types';
import styles from './CaseInboxPanel.module.css';

const STATUSES = Object.keys(STATUS_LABELS) as DisciplinaryCaseStatus[];
const DEADLINES: Array<Exclude<DeadlineIndicator, 'NONE'>> = ['ON_TIME', 'DUE_SOON', 'OVERDUE'];

export const CaseInboxPanel = () => {
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<DisciplinaryCasePage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void disciplineApi
      .listCases({
        status: (status || undefined) as DisciplinaryCaseStatus | undefined,
        severity: (severity || undefined) as InfractionSeverity | undefined,
        deadline: (deadline || undefined) as Exclude<DeadlineIndicator, 'NONE'> | undefined,
        page,
      })
      .then((next) => {
        if (active) setResult(next);
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
  }, [status, severity, deadline, page]);

  const total = result?.total ?? 0;
  const pageSize = result?.pageSize ?? 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className={styles.panel}>
      <div className={styles.filters}>
        <label>
          Estado
          <Select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">Todos</option>
            {STATUSES.map((code) => (
              <option key={code} value={code}>
                {STATUS_LABELS[code]}
              </option>
            ))}
          </Select>
        </label>
        <label>
          Gravedad
          <Select
            value={severity}
            onChange={(event) => {
              setPage(1);
              setSeverity(event.target.value);
            }}
          >
            <option value="">Todas</option>
            {SEVERITY_ORDER.map((code) => (
              <option key={code} value={code}>
                {SEVERITY_LABELS[code]}
              </option>
            ))}
          </Select>
        </label>
        <label>
          Plazo
          <Select
            value={deadline}
            onChange={(event) => {
              setPage(1);
              setDeadline(event.target.value);
            }}
          >
            <option value="">Todos</option>
            {DEADLINES.map((code) => (
              <option key={code} value={code}>
                {DEADLINE_LABELS[code]}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando expedientes…</p> : null}
      {!loading && result && result.data.length === 0 ? (
        <EmptyState description="Pruebe con otros filtros o registre una amonestación." icon={Inbox} title="No hay expedientes" />
      ) : null}
      {!loading && result && result.data.length > 0 ? (
        <div className={`${styles.tableWrap} table-scroll`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Estudiante</th>
                <th>Falta</th>
                <th>Estado</th>
                <th>Gravedad</th>
                <th>Plazo</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>
                      <Link to={portalPathForSession(disciplineCasePath(row.id))}>
                        {row.caseNumber}
                      </Link>
                    </strong>
                    <span>{row.occurredAt ? formatShortDate(row.occurredAt.slice(0, 10)) : 'Sin fecha'}</span>
                  </td>
                  <td>
                    <Link to={portalPathForSession(disciplineHistoryPath(row.studentUserId))}>
                      {row.studentFullName}
                    </Link>
                    <span>{row.sectionLabel ?? 'Sin sección'}</span>
                    {row.missingGuideTeacher ? <Badge tone="warning">Sin docente guía</Badge> : null}
                    {row.isLateReport ? <Badge tone="warning">Reporte extemporáneo</Badge> : null}
                  </td>
                  <td>{row.infractionName}</td>
                  <td>
                    <Badge tone={STATUS_TONES[row.status]}>{STATUS_LABELS[row.status]}</Badge>
                  </td>
                  <td>
                    <Badge tone={SEVERITY_TONES[row.severity]}>
                      {row.severityLabel} · {row.deduction}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={DEADLINE_TONES[row.deadline]}>{DEADLINE_LABELS[row.deadline]}</Badge>
                    {row.dueOn ? <span>{formatShortDate(row.dueOn)}</span> : null}
                  </td>
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
