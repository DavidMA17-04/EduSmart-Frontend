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
import { Alert, Button } from '@/shared/ui';
import { Link } from 'react-router-dom';
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
            <Link to={ATTENDANCE_REPORTS_PATH}>
              <Button type="button" variant="secondary">
                Ver reportes
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <div className={styles.kpis}>
        <article className={styles.kpi}>
          <Percent aria-hidden="true" size={16} />
          <span className={styles.kpiValue}>{data.kpis.todayRate.toFixed(1)}%</span>
          <span className={styles.kpiLabel}>Asistencia de hoy</span>
          <span className={styles.kpiSub}>
            {data.today.registeredStudents} registrados / {data.today.expectedStudents} esperados
          </span>
        </article>
        <article className={styles.kpi}>
          <UserCheck aria-hidden="true" size={16} />
          <span className={styles.kpiValue}>{data.kpis.presentCount}</span>
          <span className={styles.kpiLabel}>Estudiantes presentes</span>
          <span className={styles.kpiSub}>Incluye tardías del día</span>
        </article>
        <article className={styles.kpi}>
          <AlertTriangle aria-hidden="true" size={16} />
          <span className={styles.kpiValue}>{data.kpis.criticalAbsences}</span>
          <span className={styles.kpiLabel}>Ausencias críticas</span>
          <span className={styles.kpiSub}>Umbral {data.criticalAbsenceRate}%</span>
        </article>
        <article className={styles.kpi}>
          <CalendarCheck aria-hidden="true" size={16} />
          <span className={styles.kpiValue}>{data.kpis.openSessions}</span>
          <span className={styles.kpiLabel}>Sesiones abiertas</span>
          <span className={styles.kpiSub}>Clases en curso</span>
        </article>
      </div>

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
                <ResponsiveContainer height={240} width="100%">
                  <AreaChart data={data.trend}>
                    <CartesianGrid stroke={brandColors.border} strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      dataKey="attendanceRate"
                      fill={brandColors.primaryLight}
                      name="% presentismo"
                      stroke={brandColors.primary}
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
                <>
                  <ResponsiveContainer height={180} width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={slices}
                        dataKey="value"
                        innerRadius={48}
                        nameKey="name"
                        outerRadius={72}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {slices.map((slice) => (
                          <Cell fill={slice.color} key={slice.key} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className={styles.legend}>
                    {slices.map((slice) => (
                      <li key={slice.key}>
                        <span className={styles.dot} style={{ background: slice.color }} />
                        {slice.name}: {slice.value}
                      </li>
                    ))}
                  </ul>
                </>
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
            )}
          </article>
        </>
      )}
    </section>
  );
};
