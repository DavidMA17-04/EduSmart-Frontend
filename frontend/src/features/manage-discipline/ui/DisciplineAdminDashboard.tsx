import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardPen,
  FileSpreadsheet,
  FileText,
  Inbox,
  Scale,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { academicPeriodApi } from '@/features/manage-academic-period/api/academicPeriodApi';
import { groupApi } from '@/features/manage-group';
import type { AcademicGroup } from '@/entities/group';
import { portalPathForSession } from '@/shared/auth/portalPaths';
import { sessionHasPermission } from '@/shared/auth';
import { Alert, DonutCard, type DonutSlice, Select } from '@/shared/ui';
import { brandColors } from '@/styles/brandColors';
import { chartTheme } from '@/styles/chartTheme';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import { disciplineApi } from '../api/disciplineApi';
import {
  formatDashboardMonth,
  formatSectionLabel,
  type DisciplinaryDashboard,
} from '../model/disciplineDashboard';
import {
  DISCIPLINE_APPEALS_PATH,
  DISCIPLINE_CASES_PATH,
  DISCIPLINE_HISTORY_PATH,
  DISCIPLINE_PERMISSIONS,
  DISCIPLINE_REGISTER_PATH,
  DISCIPLINE_SETTINGS_PATH,
  disciplineCasePath,
  disciplineHistoryPath,
} from '../model/disciplineRouting';
import styles from './DisciplineAdminDashboard.module.css';

const SEVERITY_COLORS: Record<string, string> = {
  'Muy leve': brandColors.green,
  Leve: brandColors.gold,
  Grave: brandColors.warning,
  'Muy grave': brandColors.danger,
  Gravísima: brandColors.navy,
};

export function DisciplineAdminDashboard() {
  const navigate = useNavigate();
  const canCreate = sessionHasPermission(DISCIPLINE_PERMISSIONS.create);
  const canBoard =
    sessionHasPermission(DISCIPLINE_PERMISSIONS.view) ||
    sessionHasPermission(DISCIPLINE_PERMISSIONS.viewOwn);
  const canExport = sessionHasPermission(DISCIPLINE_PERMISSIONS.export);
  const canSettings =
    sessionHasPermission(DISCIPLINE_PERMISSIONS.view) ||
    sessionHasPermission(DISCIPLINE_PERMISSIONS.configure);

  const [periodId, setPeriodId] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [groupId, setGroupId] = useState('');
  const [periods, setPeriods] = useState<Array<{ id: number; name: string }>>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [board, setBoard] = useState<DisciplinaryDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(canBoard);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  useEffect(() => {
    void academicPeriodApi
      .list()
      .then((rows) => setPeriods(rows.map((row) => ({ id: Number(row.id), name: row.name }))))
      .catch(() => setPeriods([]));
    void groupApi
      .list()
      .then(setGroups)
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    if (!canBoard) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    void disciplineApi
      .getDashboard({
        academicPeriodId: periodId ? Number(periodId) : undefined,
        gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
        groupId: groupId ? Number(groupId) : undefined,
      })
      .then((next) => {
        if (active) setBoard(next);
      })
      .catch((reason: unknown) => {
        if (active) {
          setBoard(null);
          setError(reason instanceof Error ? reason.message : 'No se pudo cargar el tablero.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [periodId, gradeLevel, groupId, canBoard]);

  const levels = useMemo(
    () =>
      [...new Set(groups.map((group) => group.section?.gradeLevel).filter((level): level is number => level != null))].sort(
        (left, right) => left - right,
      ),
    [groups],
  );
  const sections = groups.filter((group) => !gradeLevel || group.section?.gradeLevel === Number(gradeLevel));

  const monthBars = useMemo(
    () =>
      (board?.byMonth ?? []).map((item, index) => ({
        name: formatDashboardMonth(item.month),
        value: item.count,
        fill: chartTheme.series[index % chartTheme.series.length],
      })),
    [board],
  );

  const statusBars = useMemo(
    () =>
      (board?.byStatus ?? []).map((item, index) => ({
        name: item.label.length > 12 ? `${item.label.slice(0, 11)}…` : item.label,
        fullName: item.label,
        value: item.count,
        fill: chartTheme.series[index % chartTheme.series.length],
      })),
    [board],
  );

  const severitySlices = useMemo<DonutSlice[]>(
    () =>
      (board?.bySeverity ?? []).map((row, index) => ({
        name: row.label,
        shortName: row.label.length > 12 ? `${row.label.slice(0, 10)}…` : row.label,
        count: row.count,
        color: SEVERITY_COLORS[row.label] ?? chartTheme.series[index % chartTheme.series.length],
      })),
    [board],
  );

  const path = (to: string) => staffPathForSession(to);

  const download = async (format: 'excel' | 'pdf') => {
    setExporting(format);
    setError(null);
    try {
      await disciplineApi.exportCases(format, {
        academicPeriodId: periodId ? Number(periodId) : undefined,
        groupId: groupId ? Number(groupId) : undefined,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo exportar el listado.');
    } finally {
      setExporting(null);
    }
  };

  const guide = [
    {
      key: 'register',
      title: 'Registrar una falta',
      body: 'Amonestación directa o debido proceso según el catálogo.',
      to: DISCIPLINE_REGISTER_PATH,
      visible: canCreate,
    },
    {
      key: 'cases',
      title: 'Ver expedientes',
      body: 'Bandeja abierta, plazos y seguimiento REAC.',
      to: DISCIPLINE_CASES_PATH,
      visible: canBoard,
    },
    {
      key: 'history',
      title: 'Historial de conducta',
      body: 'Nota y rebajos de un estudiante.',
      to: DISCIPLINE_HISTORY_PATH,
      visible: canBoard,
    },
    {
      key: 'appeals',
      title: 'Apelaciones',
      body: 'Presentar, revisar o reportar recursos.',
      to: DISCIPLINE_APPEALS_PATH,
      visible: canBoard,
    },
    {
      key: 'settings',
      title: 'Configurar reglas',
      body: 'Catálogo, calendario y flujo REAC.',
      to: DISCIPLINE_SETTINGS_PATH,
      visible: canSettings,
    },
  ].filter((item) => item.visible);

  const total = board?.total ?? 0;
  const dueSoon = board?.deadlines.dueSoon ?? 0;
  const overdue = board?.deadlines.overdue ?? 0;
  const alertCount = board?.alerts.length ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div>
          <h1>Disciplina</h1>
          <p>Overview del debido proceso · plazos, gravedad y bandeja.</p>
        </div>
        <div className={styles.topActions}>
          {canExport ? (
            <>
              <button
                className={styles.btnGhost}
                disabled={exporting != null}
                onClick={() => void download('excel')}
                type="button"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
              <button
                className={styles.btnGhost}
                disabled={exporting != null}
                onClick={() => void download('pdf')}
                type="button"
              >
                <FileText size={16} />
                PDF
              </button>
            </>
          ) : null}
          {canBoard ? (
            <button
              className={styles.btnGhost}
              onClick={() => navigate(path(DISCIPLINE_CASES_PATH))}
              type="button"
            >
              <Inbox size={16} />
              Expedientes
            </button>
          ) : null}
          {canCreate ? (
            <button
              className={styles.btnPrimary}
              onClick={() => navigate(path(DISCIPLINE_REGISTER_PATH))}
              type="button"
            >
              <ClipboardPen size={16} />
              Registrar falta
            </button>
          ) : null}
        </div>
      </header>

      {canBoard ? (
        <div className={styles.filters}>
          <label>
            Periodo
            <Select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
              <option value="">Todos</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Nivel
            <Select
              value={gradeLevel}
              onChange={(event) => {
                setGradeLevel(event.target.value);
                setGroupId('');
              }}
            >
              <option value="">Todos</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}°
                </option>
              ))}
            </Select>
          </label>
          <label>
            Sección
            <Select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              <option value="">Todas</option>
              {sections.map((group) => (
                <option key={group.id} value={group.id}>
                  {formatSectionLabel(group.section?.gradeLevel, group.name)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}

      {!canBoard ? (
        <p className={styles.viewOnly}>
          Puede registrar amonestaciones desde la acción principal. Los indicadores aparecen con
          permiso de consulta.
        </p>
      ) : (
        <>
          <div aria-busy={loading} aria-live="polite" className={styles.metricRow}>
            <article className={styles.metric}>
              <span>Expedientes abiertos</span>
              <strong>{loading ? '—' : total}</strong>
              <em>En el filtro actual</em>
            </article>
            <article className={styles.metric}>
              <span>Por vencer</span>
              <strong>{loading ? '—' : dueSoon}</strong>
              <em className={styles.deltaWarn}>Plazos cercanos</em>
            </article>
            <article className={styles.metric}>
              <span>Vencidos</span>
              <strong>{loading ? '—' : overdue}</strong>
              <em className={overdue > 0 ? styles.deltaDanger : undefined}>Requieren acción</em>
            </article>
            <article className={styles.metric}>
              <span>Alertas</span>
              <strong>{loading ? '—' : alertCount}</strong>
              <em>Proceso y reincidencia</em>
            </article>
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.mainCol}>
              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <h2>Volumen por mes</h2>
                </div>
                {monthBars.length === 0 ? (
                  <p className={styles.muted}>{loading ? 'Cargando…' : 'Sin serie mensual.'}</p>
                ) : (
                  <div className={styles.chartBox}>
                    <ResponsiveContainer height={200} width="100%">
                      <BarChart data={monthBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid {...chartTheme.grid} vertical={false} />
                        <XAxis dataKey="name" tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
                        <YAxis allowDecimals={false} tick={chartTheme.axis.tick} width={28} />
                        <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                        <Bar dataKey="value" maxBarSize={36} name="Expedientes" radius={[8, 8, 0, 0]}>
                          {monthBars.map((row) => (
                            <Cell fill={row.fill} key={row.name} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <ul className={styles.legendInline}>
                  <li>
                    <span style={{ background: brandColors.primary }} /> Abiertos
                  </li>
                  <li>
                    <span style={{ background: brandColors.gold }} /> Por periodo
                  </li>
                  <li>
                    <span style={{ background: brandColors.green }} /> Flujo REAC
                  </li>
                </ul>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <h2>Por estado del trámite</h2>
                </div>
                {statusBars.length === 0 ? (
                  <p className={styles.muted}>{loading ? 'Cargando…' : 'Sin estados para graficar.'}</p>
                ) : (
                  <div className={styles.chartBox}>
                    <ResponsiveContainer height={200} width="100%">
                      <BarChart data={statusBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid {...chartTheme.grid} vertical={false} />
                        <XAxis dataKey="name" tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
                        <YAxis allowDecimals={false} tick={chartTheme.axis.tick} width={28} />
                        <Tooltip
                          contentStyle={chartTheme.tooltip.contentStyle}
                          formatter={(value, _n, item) => [
                            value,
                            (item?.payload as { fullName?: string } | undefined)?.fullName ?? 'Estado',
                          ]}
                        />
                        <Bar dataKey="value" maxBarSize={36} radius={[8, 8, 0, 0]}>
                          {statusBars.map((row) => (
                            <Cell fill={row.fill} key={row.fullName} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <h2>Señales de proceso</h2>
                </div>
                {(board?.alerts.length ?? 0) === 0 ? (
                  <p className={styles.muted}>
                    {loading ? 'Cargando alertas…' : 'Sin alertas en este filtro.'}
                  </p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Alerta</th>
                          <th>Detalle</th>
                          <th>Estado</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {(board?.alerts ?? []).slice(0, 8).map((alert, index) => {
                          const urgent =
                            alert.code === 'DEADLINE_OVERDUE' || alert.code === 'LOW_CONDUCT';
                          return (
                            <tr key={`${alert.code}-${alert.caseId ?? alert.studentUserId ?? index}`}>
                              <td>
                                <strong>{alert.message}</strong>
                              </td>
                              <td>
                                {alert.fullName ?? alert.caseNumber ?? '—'}
                              </td>
                              <td>
                                <span className={`${styles.dot} ${urgent ? styles.dotDanger : styles.dotWarn}`} />
                                {urgent ? 'Crítico' : 'Atención'}
                              </td>
                              <td>
                                {alert.caseId ? (
                                  <Link to={portalPathForSession(disciplineCasePath(alert.caseId))}>
                                    Abrir
                                  </Link>
                                ) : alert.studentUserId ? (
                                  <Link
                                    to={portalPathForSession(disciplineHistoryPath(alert.studentUserId))}
                                  >
                                    Historial
                                  </Link>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            </div>

            <aside className={styles.sideCol}>
              <article className={styles.guideCard}>
                <p className={styles.guideKicker}>Guía rápida</p>
                <h2>¿Qué necesita hacer?</h2>
                <div className={styles.guideBlocks}>
                  {guide.map((item) => (
                    <button
                      key={item.key}
                      className={styles.guideBlock}
                      onClick={() => navigate(path(item.to))}
                      type="button"
                    >
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                    </button>
                  ))}
                </div>
                {canCreate ? (
                  <button
                    className={styles.guideCta}
                    onClick={() => navigate(path(DISCIPLINE_REGISTER_PATH))}
                    type="button"
                  >
                    <ClipboardPen size={16} />
                    Empezar por registrar
                  </button>
                ) : null}
              </article>

              <DonutCard
                emptyText={loading ? 'Cargando gravedad…' : 'Sin datos de gravedad.'}
                icon={Scale}
                slices={severitySlices}
                title="Por gravedad"
              />

              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <h2>Más expedientes</h2>
                </div>
                {(board?.topStudents.length ?? 0) === 0 ? (
                  <p className={styles.muted}>{loading ? 'Cargando…' : 'Sin ranking en este filtro.'}</p>
                ) : (
                  <ul className={styles.topList}>
                    {(board?.topStudents ?? []).slice(0, 5).map((student) => (
                      <li key={student.studentUserId}>
                        <Link to={portalPathForSession(disciplineHistoryPath(student.studentUserId))}>
                          {student.fullName}
                        </Link>
                        <span>{student.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
