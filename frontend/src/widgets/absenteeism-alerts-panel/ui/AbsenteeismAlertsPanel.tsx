import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
import type { AbsenteeismRiskLevel } from '@/entities/attendance';
import {
  ATTENDANCE_HISTORY_PATH,
  useAbsenteeismAlertsPanel,
} from '@/features/manage-attendance';
import { Alert, Badge, Button, EmptyState } from '@/shared/ui';
import { Link } from 'react-router-dom';
import styles from './AbsenteeismAlertsPanel.module.css';

const RISK_LABEL: Record<AbsenteeismRiskLevel, string> = {
  HIGH: 'Riesgo alto',
  MEDIUM: 'En observación',
  LOW: 'Situación normal',
};

const RISK_TONE: Record<
  AbsenteeismRiskLevel,
  'danger' | 'warning' | 'success'
> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-');
  if (!y || !m) return ym;
  const date = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat('es-CR', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export const AbsenteeismAlertsPanel = () => {
  const model = useAbsenteeismAlertsPanel();
  const data = model.dashboard;

  if (model.isLoading && !data) {
    return (
      <div aria-busy="true" className={styles.loading}>
        <Loader2 aria-hidden="true" className={styles.spin} size={18} />
        Evaluando ausentismo…
      </div>
    );
  }

  if (model.error && !data) {
    return (
      <div className={styles.layout}>
        <Alert>{model.error}</Alert>
        <Button onClick={() => void model.reload()} type="button">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        description="Cuando existan registros de asistencia se calcularán las alertas."
        icon={Bell}
        title="Sin datos de ausentismo"
      />
    );
  }

  const dist = data.riskDistribution;
  const highPct = dist.total ? (dist.high / dist.total) * 100 : 0;
  const mediumPct = dist.total ? (dist.medium / dist.total) * 100 : 0;
  const lowPct = dist.total ? (dist.low / dist.total) * 100 : 0;
  const maxTrend = Math.max(
    1,
    ...data.trend.flatMap((t) => [t.high, t.medium, t.low]),
  );

  return (
    <section className={styles.layout}>
      {model.error ? <Alert>{model.error}</Alert> : null}

      <div className={styles.toolbar}>
        <p className={styles.muted}>
          Actualizado:{' '}
          {new Intl.DateTimeFormat('es-CR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(data.evaluatedAt))}
        </p>
        <Button
          onClick={() => void model.reload()}
          type="button"
          variant="secondary"
        >
          <RefreshCw aria-hidden="true" size={16} />
          Actualizar
        </Button>
      </div>

      <div className={styles.kpiRow}>
        <article className={`${styles.kpi} ${styles.kpiHigh}`}>
          <AlertTriangle aria-hidden="true" size={18} />
          <div>
            <strong>{data.kpis.highRisk}</strong>
            <span>Estudiantes en alerta</span>
            <small>Riesgo alto de ausentismo</small>
          </div>
        </article>
        <article className={`${styles.kpi} ${styles.kpiMedium}`}>
          <Eye aria-hidden="true" size={18} />
          <div>
            <strong>{data.kpis.mediumRisk}</strong>
            <span>En observación</span>
            <small>Riesgo medio</small>
          </div>
        </article>
        <article className={`${styles.kpi} ${styles.kpiLow}`}>
          <CheckCircle2 aria-hidden="true" size={18} />
          <div>
            <strong>{data.kpis.normal}</strong>
            <span>Situación normal</span>
            <small>Asistencia adecuada</small>
          </div>
        </article>
        <article className={`${styles.kpi} ${styles.kpiMonth}`}>
          <Users aria-hidden="true" size={18} />
          <div>
            <strong>{data.kpis.absencesThisMonth}</strong>
            <span>Ausencias este mes</span>
            <small>Total de ausencias injustificadas</small>
          </div>
        </article>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <h3>Estudiantes en riesgo alto</h3>
              <Link className={styles.link} to={ATTENDANCE_HISTORY_PATH}>
                Ver historial
              </Link>
            </header>

            {data.highRiskStudents.length === 0 ? (
              <EmptyState
                description="Ningún estudiante cumple criterios de riesgo alto en este momento."
                icon={CheckCircle2}
                title="Sin alertas altas"
              />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Grupo</th>
                      <th>Ausencias</th>
                      <th>% Asistencia</th>
                      <th>Última ausencia</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.highRiskStudents.map((row) => (
                      <tr key={row.studentUserId}>
                        <td>
                          <div className={styles.studentCell}>
                            <span
                              aria-hidden="true"
                              className={styles.avatar}
                            >
                              {initials(row.fullName)}
                            </span>
                            <div>
                              <strong>{row.fullName}</strong>
                              <small>{row.nationalId || '—'}</small>
                            </div>
                          </div>
                        </td>
                        <td>{row.group?.name ?? '—'}</td>
                        <td>{row.unjustifiedAbsencesMonth}</td>
                        <td>
                          <div className={styles.percentCell}>
                            <div className={styles.percentTrack}>
                              <div
                                className={styles.percentFill}
                                style={{
                                  width: `${Math.min(100, row.attendancePercent)}%`,
                                }}
                              />
                            </div>
                            <span>{row.attendancePercent}%</span>
                          </div>
                        </td>
                        <td>{formatDate(row.lastAbsenceDate)}</td>
                        <td>
                          <Badge tone={RISK_TONE[row.riskLevel]}>
                            {RISK_LABEL[row.riskLevel]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <h3>Tendencia de ausencias</h3>
            </header>
            <div className={styles.trend}>
              {data.trend.map((point) => (
                <div className={styles.trendCol} key={point.month}>
                  <div className={styles.trendBars}>
                    <span
                      className={`${styles.trendBar} ${styles.barHigh}`}
                      style={{ height: `${(point.high / maxTrend) * 100}%` }}
                      title={`Alto: ${point.high}`}
                    />
                    <span
                      className={`${styles.trendBar} ${styles.barMedium}`}
                      style={{
                        height: `${(point.medium / maxTrend) * 100}%`,
                      }}
                      title={`Medio: ${point.medium}`}
                    />
                    <span
                      className={`${styles.trendBar} ${styles.barLow}`}
                      style={{ height: `${(point.low / maxTrend) * 100}%` }}
                      title={`Bajo: ${point.low}`}
                    />
                  </div>
                  <small>{formatMonth(point.month)}</small>
                </div>
              ))}
            </div>
            <p className={styles.muted}>
              Serie de alertas persistidas en los últimos 6 meses.
            </p>
          </article>
        </div>

        <aside className={styles.sideCol}>
          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <h3>Distribución de riesgo</h3>
            </header>
            <div
              aria-hidden="true"
              className={styles.donut}
              style={{
                background: `conic-gradient(
                  #d64545 0 ${highPct}%,
                  #e6a700 ${highPct}% ${highPct + mediumPct}%,
                  #1f9d55 ${highPct + mediumPct}% ${highPct + mediumPct + lowPct}%,
                  #d9e2ef ${highPct + mediumPct + lowPct}% 100%
                )`,
              }}
            >
              <div className={styles.donutHole}>
                <strong>{dist.total}</strong>
                <span>Total</span>
              </div>
            </div>
            <ul className={styles.legend}>
              <li>
                <span className={`${styles.dot} ${styles.dotHigh}`} />
                Alto: {dist.high} ({highPct.toFixed(1)}%)
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotMedium}`} />
                Medio: {dist.medium} ({mediumPct.toFixed(1)}%)
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotLow}`} />
                Bajo: {dist.low} ({lowPct.toFixed(1)}%)
              </li>
            </ul>
          </article>

          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <h3>Reglas de ausentismo</h3>
            </header>
            {model.rules.length === 0 ? (
              <p className={styles.muted}>Sin reglas configuradas.</p>
            ) : (
              <ul className={styles.rulesList}>
                {model.rules.map((rule) => (
                  <li className={styles.ruleRow} key={rule.id}>
                    <div className={styles.ruleMeta}>
                      <strong>{rule.label}</strong>
                      <small>
                        {rule.code} ·{' '}
                        {RISK_LABEL[rule.riskLevel] ?? rule.riskLevel}
                      </small>
                    </div>
                    <label className={styles.ruleThreshold}>
                      Umbral
                      <input
                        aria-label={`Umbral de ${rule.label}`}
                        defaultValue={rule.thresholdValue}
                        disabled={!model.canEditRules || model.isSavingRule}
                        key={`${rule.id}-${rule.thresholdValue}`}
                        min={1}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (
                            !Number.isInteger(value) ||
                            value < 1 ||
                            value === rule.thresholdValue
                          ) {
                            return;
                          }
                          void model.updateRule(rule.id, {
                            thresholdValue: value,
                          });
                        }}
                        type="number"
                      />
                    </label>
                    <label className={styles.ruleActive}>
                      <input
                        checked={rule.isActive}
                        disabled={!model.canEditRules || model.isSavingRule}
                        onChange={(e) =>
                          void model.updateRule(rule.id, {
                            isActive: e.target.checked,
                          })
                        }
                        type="checkbox"
                      />
                      Activa
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {!model.canEditRules ? (
              <p className={styles.muted}>
                Solo administradores con permiso de edición pueden modificar
                umbrales.
              </p>
            ) : null}
          </article>

          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <h3>Alertas persistidas</h3>
            </header>
            {model.alerts.length === 0 ? (
              <p className={styles.muted}>Sin alertas registradas.</p>
            ) : (
              <ul className={styles.recent}>
                {model.alerts.slice(0, 12).map((alert) => (
                  <li key={alert.id}>
                    <div>
                      <strong>{alert.student.fullName}</strong>
                      <p>
                        {alert.group?.name ?? 'Sin grupo'} · Ausencias mes:{' '}
                        {alert.unjustifiedAbsencesMonth} · Asistencia:{' '}
                        {alert.attendancePercent}%
                      </p>
                      <small>
                        {new Intl.DateTimeFormat('es-CR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(alert.triggeredAt))}
                      </small>
                    </div>
                    <Badge tone={RISK_TONE[alert.riskLevel]}>
                      {RISK_LABEL[alert.riskLevel]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <h3>Alertas recientes (notificaciones)</h3>
            </header>
            {data.recentAlerts.length === 0 ? (
              <p className={styles.muted}>Sin notificaciones recientes.</p>
            ) : (
              <ul className={styles.recent}>
                {data.recentAlerts.map((alert) => (
                  <li key={alert.id}>
                    <div>
                      <strong>{alert.studentFullName}</strong>
                      <p>{alert.body}</p>
                      <small>
                        {new Intl.DateTimeFormat('es-CR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(alert.triggeredAt))}
                      </small>
                    </div>
                    {!alert.readAt ? (
                      <Button
                        onClick={() => void model.markRead(alert.id)}
                        type="button"
                        variant="secondary"
                      >
                        Marcar leída
                      </Button>
                    ) : (
                      <Badge tone="neutral">Leída</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </aside>
      </div>
    </section>
  );
};
