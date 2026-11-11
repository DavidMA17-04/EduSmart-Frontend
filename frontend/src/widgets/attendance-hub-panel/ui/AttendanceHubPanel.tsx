import {
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  CalendarRange,
  ClipboardList,
  FileBarChart,
  History,
  Percent,
  Plus,
  UserCheck,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ATTENDANCE_ALERTS_PATH,
  ATTENDANCE_EXCEPTIONS_PATH,
  ATTENDANCE_HISTORY_PATH,
  ATTENDANCE_JUSTIFICATIONS_PATH,
  ATTENDANCE_NEW_PATH,
  ATTENDANCE_REPORTS_PATH,
  canCreateAttendanceClass,
  canManageAttendanceExceptions,
  canViewAttendanceHistory,
  useAttendanceDashboardKpis,
} from '@/features/manage-attendance';
import { sessionHasPermission } from '@/shared/auth';
import { DonutCard, type DonutSlice } from '@/shared/ui';
import { brandColors } from '@/styles/brandColors';
import { chartTheme } from '@/styles/chartTheme';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import styles from './AttendanceHubPanel.module.css';

export const AttendanceHubPanel = () => {
  const navigate = useNavigate();
  const { data, loading } = useAttendanceDashboardKpis();
  const canCreate = canCreateAttendanceClass(sessionHasPermission);
  const canHistory = canViewAttendanceHistory(sessionHasPermission);
  const canAlerts = sessionHasPermission('attendance.view');
  const canReports = sessionHasPermission('attendance.view');
  const canJustify = ['attendance.justify', 'attendance.review', 'attendance.view'].some(
    (code) => sessionHasPermission(code),
  );
  const canExceptions = canManageAttendanceExceptions(sessionHasPermission);

  const path = (to: string) => staffPathForSession(to);

  const groupBars = useMemo(
    () =>
      [...(data.groupRates ?? [])]
        .sort((a, b) => a.attendanceRate - b.attendanceRate)
        .slice(0, 7)
        .map((row) => ({
          name: row.groupName.length > 10 ? `${row.groupName.slice(0, 9)}…` : row.groupName,
          fullName: row.groupName,
          value: Math.round(row.attendanceRate * 10) / 10,
          fill:
            row.attendanceRate < 70
              ? brandColors.danger
              : row.attendanceRate < 85
                ? brandColors.warning
                : brandColors.primary,
        })),
    [data.groupRates],
  );

  const distributionSlices = useMemo<DonutSlice[]>(
    () =>
      [
        {
          name: 'Presentes',
          shortName: 'Presente',
          count: data.distribution.present,
          color: brandColors.green,
        },
        {
          name: 'Tardías',
          shortName: 'Tarde',
          count: data.distribution.late,
          color: brandColors.goldDark,
        },
        {
          name: 'Ausentes',
          shortName: 'Ausente',
          count: data.distribution.absent,
          color: brandColors.danger,
        },
        {
          name: 'Justificadas',
          shortName: 'Justif.',
          count: data.distribution.justified,
          color: brandColors.primaryHover,
        },
      ].filter((slice) => slice.count > 0),
    [data.distribution],
  );

  const alertRows = (data.alerts ?? []).slice(0, 5);

  const tasks = [
    {
      key: 'new',
      title: 'Tomar asistencia',
      hint: 'Abrir sesión de clase',
      to: ATTENDANCE_NEW_PATH,
      icon: Plus,
      visible: canCreate,
      accent: brandColors.primary,
    },
    {
      key: 'history',
      title: 'Historial',
      hint: 'Sesiones previas',
      to: ATTENDANCE_HISTORY_PATH,
      icon: History,
      visible: canHistory,
      accent: brandColors.primaryHover,
    },
    {
      key: 'alerts',
      title: 'Alertas',
      hint: 'Riesgo crónico',
      to: ATTENDANCE_ALERTS_PATH,
      icon: AlertTriangle,
      visible: canAlerts,
      accent: brandColors.warning,
    },
    {
      key: 'reports',
      title: 'Indicadores',
      hint: 'Tendencias y tasas',
      to: ATTENDANCE_REPORTS_PATH,
      icon: FileBarChart,
      visible: canReports,
      accent: brandColors.goldDark,
    },
    {
      key: 'justifications',
      title: 'Justificaciones',
      hint: 'Revisar o registrar',
      to: ATTENDANCE_JUSTIFICATIONS_PATH,
      icon: ClipboardList,
      visible: canJustify,
      accent: brandColors.green,
    },
    {
      key: 'exceptions',
      title: 'Excepciones',
      hint: 'Calendario especial',
      to: ATTENDANCE_EXCEPTIONS_PATH,
      icon: CalendarRange,
      visible: canExceptions,
      accent: brandColors.navy,
    },
  ].filter((item) => item.visible);

  const todayLabel = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div>
          <h1>Asistencias</h1>
          <p>
            {loading
              ? 'Cargando presencia del día…'
              : `Planifique el día: ${data.kpis.todayRate.toFixed(1)}% de presentismo · ${data.kpis.criticalAbsences} en riesgo`}
          </p>
        </div>
        <div className={styles.topActions}>
          {canJustify ? (
            <button
              className={styles.btnGhost}
              onClick={() => navigate(path(ATTENDANCE_JUSTIFICATIONS_PATH))}
              type="button"
            >
              <ClipboardList size={16} />
              Justificaciones
            </button>
          ) : null}
          {canCreate ? (
            <button
              className={styles.btnPrimary}
              onClick={() => navigate(path(ATTENDANCE_NEW_PATH))}
              type="button"
            >
              <Plus size={16} />
              Nueva clase
            </button>
          ) : null}
        </div>
      </header>

      <div aria-busy={loading} aria-live="polite" className={styles.kpiRow}>
        <button
          className={`${styles.kpi} ${styles.kpiFeatured}`}
          onClick={() => navigate(path(ATTENDANCE_REPORTS_PATH))}
          type="button"
        >
          <div className={styles.kpiTop}>
            <span>Asistencia de hoy</span>
            <ArrowUpRight size={16} />
          </div>
          <strong>{loading ? '—' : `${data.kpis.todayRate.toFixed(1)}%`}</strong>
          <em>
            {loading
              ? '…'
              : `${data.today.registeredStudents}/${data.today.expectedStudents} registrados`}
          </em>
        </button>

        <button
          className={styles.kpi}
          onClick={() => navigate(path(ATTENDANCE_HISTORY_PATH))}
          type="button"
        >
          <div className={styles.kpiTop}>
            <span>Presentes</span>
            <UserCheck size={16} />
          </div>
          <strong>{loading ? '—' : data.kpis.presentCount}</strong>
          <em>Incluye tardías del día</em>
        </button>

        <button
          className={styles.kpi}
          onClick={() => navigate(path(ATTENDANCE_ALERTS_PATH))}
          type="button"
        >
          <div className={styles.kpiTop}>
            <span>En riesgo</span>
            <AlertTriangle size={16} />
          </div>
          <strong>{loading ? '—' : data.kpis.criticalAbsences}</strong>
          <em>Umbral {data.criticalAbsenceRate}%</em>
        </button>

        <button
          className={styles.kpi}
          onClick={() => canCreate && navigate(path(ATTENDANCE_NEW_PATH))}
          type="button"
        >
          <div className={styles.kpiTop}>
            <span>Sesiones abiertas</span>
            <CalendarCheck size={16} />
          </div>
          <strong>{loading ? '—' : data.kpis.openSessions}</strong>
          <em>Clases en curso</em>
        </button>
      </div>

      <div className={styles.midGrid}>
        <article className={styles.card}>
          <div className={styles.cardHead}>
            <Percent size={16} />
            <h2>Analítica por grupo</h2>
          </div>
          {groupBars.length > 0 ? (
            <div className={styles.chartBox}>
              <ResponsiveContainer height={220} width="100%">
                <BarChart data={groupBars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid {...chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
                  <YAxis
                    domain={[0, 100]}
                    tick={chartTheme.axis.tick}
                    stroke={chartTheme.axis.stroke}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={chartTheme.tooltip.contentStyle}
                    formatter={(value, _name, item) => [
                      `${value}%`,
                      (item?.payload as { fullName?: string } | undefined)?.fullName ?? 'Grupo',
                    ]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={42}>
                    {groupBars.map((row) => (
                      <Cell fill={row.fill} key={row.fullName} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : data.trend.length > 0 ? (
            <div className={styles.chartBox}>
              <ResponsiveContainer height={220} width="100%">
                <AreaChart data={data.trend}>
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis dataKey="period" tick={chartTheme.axis.tick} />
                  <YAxis domain={[0, 100]} tick={chartTheme.axis.tick} width={32} />
                  <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                  <Area
                    dataKey="attendanceRate"
                    fill={chartTheme.area.fill}
                    name="% presentismo"
                    stroke={chartTheme.area.stroke}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className={styles.muted}>
              {loading ? 'Cargando analítica…' : 'Aún no hay tasas por grupo para hoy.'}
            </p>
          )}
        </article>

        <DonutCard
          centerLabel="Marcas"
          centerTotal={data.distribution.total || undefined}
          emptyText={loading ? 'Cargando distribución…' : 'Sin registros para graficar.'}
          icon={UserCheck}
          slices={distributionSlices}
          title="Progreso del día"
        />
      </div>

      <div className={styles.bottomGrid}>
        <article className={styles.card}>
          <div className={styles.cardHead}>
            <AlertTriangle size={16} />
            <h2>Estudiantes en seguimiento</h2>
            {canAlerts ? (
              <Link className={styles.headLink} to={path(ATTENDANCE_ALERTS_PATH)}>
                Ver todas
              </Link>
            ) : null}
          </div>
          {alertRows.length === 0 ? (
            <p className={styles.muted}>
              {loading
                ? 'Cargando alertas…'
                : 'No hay estudiantes con inasistencia crítica en el período.'}
            </p>
          ) : (
            <ul className={styles.peopleList}>
              {alertRows.map((row) => {
                const tone =
                  row.absenceRate >= 40
                    ? styles.badgeDanger
                    : row.consecutiveAbsences >= 3
                      ? styles.badgeWarn
                      : styles.badgeSoft;
                return (
                  <li key={`${row.studentUserId}-${row.groupName}`}>
                    <span aria-hidden="true" className={styles.avatar}>
                      {row.fullName.slice(0, 1)}
                    </span>
                    <span className={styles.personCopy}>
                      <strong>{row.fullName}</strong>
                      <em>
                        {row.groupName} · {row.totalAbsent}/{row.totalRecords} ausencias
                      </em>
                    </span>
                    <span className={`${styles.badge} ${tone}`}>
                      {row.absenceRate.toFixed(0)}% aus.
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}>
            <ClipboardList size={16} />
            <h2>Tareas</h2>
          </div>
          <ul className={styles.taskList}>
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <li key={task.key}>
                  <button
                    className={styles.taskBtn}
                    onClick={() => navigate(path(task.to))}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className={styles.taskIcon}
                      style={{ background: `color-mix(in srgb, ${task.accent} 16%, #fff)`, color: task.accent }}
                    >
                      <Icon size={16} />
                    </span>
                    <span>
                      <strong>{task.title}</strong>
                      <em>{task.hint}</em>
                    </span>
                    <ArrowUpRight aria-hidden="true" size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.footerNote}>{todayLabel}</p>
        </article>
      </div>
    </div>
  );
};
