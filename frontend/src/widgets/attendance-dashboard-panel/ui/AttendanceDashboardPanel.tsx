import {
  AlertTriangle,
  CalendarCheck,
  Loader2,
  Percent,
  RefreshCw,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ATTENDANCE_REPORTS_PATH, useAttendanceDashboardKpis } from '@/features/manage-attendance';
import { brandColors } from '@/styles/brandColors';
import { chartTheme } from '@/styles/chartTheme';
import { Alert, Button, KpiCard, KpiGrid } from '@/shared/ui';
import { Link } from 'react-router-dom';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import styles from './AttendanceDashboardPanel.module.css';

type AttendanceDashboardPanelProps = {
  variant?: 'full' | 'compact';
};

const DISTRIBUTION_COLORS = {
  present: brandColors.green,
  late: brandColors.goldDark,
  absent: brandColors.danger,
  justified: brandColors.primaryHover,
} as const;

export const AttendanceDashboardPanel = ({
  variant = 'full',
}: AttendanceDashboardPanelProps) => {
  const { data, loading, error, reload } = useAttendanceDashboardKpis();
  const compact = variant === 'compact';

  const slices = [
    { name: 'Presentes', key: 'present', value: data.distribution.present, color: DISTRIBUTION_COLORS.present },
    { name: 'Tardías', key: 'late', value: data.distribution.late, color: DISTRIBUTION_COLORS.late },
    { name: 'Ausentes', key: 'absent', value: data.distribution.absent, color: DISTRIBUTION_COLORS.absent },
    { name: 'Justificadas', key: 'justified', value: data.distribution.justified, color: DISTRIBUTION_COLORS.justified },
  ];

  return (
    <section className={styles.layout}>
      <div className={styles.toolbar}>
        <span className={styles.scope}>
          {data.scope === 'institutional'
            ? 'Vista institucional'
            : 'Vista de docente (solo asignaciones propias)'}
          {data.asOfDate ? ` · ${data.asOfDate}` : ''}
        </span>
        <div className={styles.toolbar}>
          <Button
            disabled={loading}
            onClick={() => void reload()}
            type="button"
            variant="secondary"
          >
            {loading ? <Loader2 aria-hidden="true" size={16} /> : <RefreshCw aria-hidden="true" size={16} />}
            Actualizar
          </Button>
          {compact ? (
            <Link to={staffPathForSession(ATTENDANCE_REPORTS_PATH)}>
              <Button type="button" variant="secondary">
                Ver reportes
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <KpiGrid columns={4}>
        <KpiCard
          icon={Percent}
          label="Asistencia de hoy"
          tone="navy"
          value={`${data.kpis.todayRate.toFixed(1)}%`}
          hint={`${data.today.registeredStudents} registrados / ${data.today.expectedStudents} esperados`}
        />
        <KpiCard
          icon={UserCheck}
          label="Estudiantes presentes"
          tone="green"
          value={data.kpis.presentCount}
          hint="Incluye tardías del día"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Ausencias críticas"
          tone="danger"
          value={data.kpis.criticalAbsences}
          hint={`Umbral ${data.criticalAbsenceRate}%`}
        />
        <KpiCard
          icon={CalendarCheck}
          label="Sesiones abiertas"
          tone="gold"
          value={data.kpis.openSessions}
          hint="Clases en curso"
        />
      </KpiGrid>

      {compact ? null : (
        <>
          <div className={styles.charts}>
            <article className={styles.card}>
              <div className={styles.cardHead}>
                <Users size={16} />
                <h3>Tendencia de presentismo</h3>
              </div>
              {data.trend.length === 0 ? (
                <p className={styles.muted}>Aún no hay marcas en el período seleccionado.</p>
              ) : (
                <ResponsiveContainer height={180} width="100%">
                  <AreaChart data={data.trend}>
                    <CartesianGrid {...chartTheme.grid} />
                    <XAxis dataKey="period" tick={chartTheme.axis.tick} />
                    <YAxis domain={[0, 100]} tick={chartTheme.axis.tick} />
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
              )}
            </article>
            <article className={styles.card}>
              <div className={styles.cardHead}>
                <UserCheck size={16} />
                <h3>Distribución de estados</h3>
              </div>
              {data.distribution.total === 0 ? (
                <p className={styles.muted}>Sin registros para graficar.</p>
              ) : (
                <div className={styles.donutRow}>
                  <div className={styles.donutWrap}>
                    <ResponsiveContainer height={168} width="100%">
                      <PieChart>
                        <Pie
                          cx="50%"
                          cy="50%"
                          data={slices.filter((s) => s.value > 0)}
                          dataKey="value"
                          innerRadius={50}
                          nameKey="name"
                          outerRadius={72}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {slices
                            .filter((s) => s.value > 0)
                            .map((slice) => (
                              <Cell fill={slice.color} key={slice.key} />
                            ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.donutCenter} aria-hidden="true">
                      <span className={styles.donutTotal}>{data.distribution.total}</span>
                      <span className={styles.donutTotalLabel}>Total</span>
                    </div>
                  </div>
                  <ul className={styles.legend}>
                    {slices.map((slice) => (
                      <li key={slice.key}>
                        <span className={styles.dot} style={{ background: slice.color }} />
                        {slice.name}: {slice.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </div>

          <article className={styles.card}>
            <div className={styles.cardHead}>
              <AlertTriangle size={16} />
              <h3>Alertas tempranas</h3>
            </div>
            {data.alerts.length === 0 ? (
              <p className={styles.muted}>
                No hay estudiantes con inasistencia crítica en el período.
              </p>
            ) : (
              <div className="table-scroll">
              <table className={styles.alerts}>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Grupo</th>
                    <th>Ausencias</th>
                    <th>Consecutivas</th>
                    <th>% Inasistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {data.alerts.map((row) => (
                    <tr key={`${row.studentUserId}-${row.groupName}`}>
                      <td>
                        {row.fullName}
                        <span className={styles.studentMeta}>{row.nationalId}</span>
                      </td>
                      <td>{row.groupName}</td>
                      <td>
                        {row.totalAbsent}/{row.totalRecords}
                      </td>
                      <td>{row.consecutiveAbsences}</td>
                      <td>{row.absenceRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
};
