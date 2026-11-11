import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardPen, Inbox } from 'lucide-react';
import { Alert, Badge, Button, EmptyState, Select } from '@/shared/ui';
import { sessionHasPermission } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import { disciplineApi } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import {
  DISCIPLINE_PERMISSIONS,
  DISCIPLINE_REGISTER_PATH,
  disciplineCasePath,
  disciplineHistoryPath,
} from '../model/disciplineRouting';
import { DEADLINE_LABELS, DEADLINE_TONES, STATUS_LABELS, STATUS_TONES } from '../model/caseInbox';
import { inboxNextStep } from '../model/caseStage';
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
  const canCreate = sessionHasPermission(DISCIPLINE_PERMISSIONS.create);

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarCopy}>
          <h2>Bandeja de trabajo</h2>
          <p>
            Cada fila dice <strong>qué toca ahora</strong>. Abra el expediente para continuar el paso.
          </p>
        </div>
        {canCreate ? (
          <Link className={styles.registerLink} to={staffPathForSession(DISCIPLINE_REGISTER_PATH)}>
            <ClipboardPen aria-hidden="true" size={16} />
            Registrar amonestación
          </Link>
        ) : null}
      </div>

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
        <EmptyState
          description={
            canCreate
              ? 'Pruebe con otros filtros o registre una amonestación para abrir el primer expediente.'
              : 'Pruebe con otros filtros o espere nuevos casos a su cargo.'
          }
          icon={Inbox}
          title="No hay expedientes"
        />
      ) : null}
      {!loading && result && result.data.length > 0 ? (
        <ul className={styles.caseList}>
          {result.data.map((row) => {
            const next = inboxNextStep({ status: row.status, track: row.track });
            return (
              <li className={styles.caseCard} key={row.id}>
                <div className={styles.caseMain}>
                  <div className={styles.caseId}>
                    <Link to={portalPathForSession(disciplineCasePath(row.id))}>{row.caseNumber}</Link>
                    <span>
                      {row.occurredAt ? formatShortDate(row.occurredAt.slice(0, 10)) : 'Sin fecha'}
                    </span>
                  </div>
                  <div className={styles.caseStudent}>
                    <Link to={portalPathForSession(disciplineHistoryPath(row.studentUserId))}>
                      {row.studentFullName}
                    </Link>
                    <span>
                      {row.sectionLabel ?? 'Sin sección'} · {row.infractionName}
                    </span>
                    <div className={styles.caseFlags}>
                      {row.missingGuideTeacher ? <Badge tone="warning">Sin docente guía</Badge> : null}
                      {row.isLateReport ? <Badge tone="warning">Reporte extemporáneo</Badge> : null}
                    </div>
                  </div>
                </div>
                <div className={styles.caseMeta}>
                  <Badge tone={STATUS_TONES[row.status]}>{STATUS_LABELS[row.status]}</Badge>
                  <Badge tone={SEVERITY_TONES[row.severity]}>
                    {row.severityLabel} · {row.deduction}
                  </Badge>
                  <Badge tone={DEADLINE_TONES[row.deadline]}>
                    {DEADLINE_LABELS[row.deadline]}
                    {row.dueOn ? ` · ${formatShortDate(row.dueOn)}` : ''}
                  </Badge>
                </div>
                <div className={styles.caseNext}>
                  <p className={styles.caseNextLabel}>Qué toca</p>
                  <p className={styles.caseNextTitle}>{next.label}</p>
                  {next.detail ? <p className={styles.caseNextDetail}>{next.detail}</p> : null}
                  <Link className={styles.caseOpen} to={portalPathForSession(disciplineCasePath(row.id))}>
                    Abrir
                    <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
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
