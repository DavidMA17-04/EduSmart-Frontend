import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarRange,
  Clock,
  FileSpreadsheet,
  FolderOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardApi } from '@/features/dashboard';
import type { DashboardSummary } from '@/features/dashboard';
import { getSessionUser } from '@/shared/auth';
import styles from './AdminHomePage.module.css';

function getGreeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const DONUT_COLORS = ['#002E7A', '#164687', '#CFAC65', '#021A53', '#6B7280', '#168750'];

const quickAccess = [
  { label: 'Usuarios', to: '/admin/users', icon: Users },
  { label: 'Directorio', to: '/admin/users/directory', icon: FolderOpen },
  { label: 'Roles y permisos', to: '/admin/roles-permissions', icon: ShieldCheck },
  { label: 'Especialidades', to: '/admin/specialties', icon: GraduationCap },
  { label: 'Períodos', to: '/admin/academic-periods', icon: CalendarRange },
  { label: 'Secciones', to: '/admin/sections-groups', icon: Layers },
  { label: 'Importar', to: '/admin/users', icon: FileSpreadsheet },
  { label: 'Configuración', to: '/admin/settings', icon: Settings },
];

export const AdminHomePage = () => {
  const sessionUser = getSessionUser();
  const displayName = sessionUser?.roles[0] ?? 'Administrador';

  const [now, setNow] = useState(() => new Date());
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    dashboardApi
      .getSummary()
      .then((summary) => { if (active) setData(summary); })
      .catch(() => { if (active) setError('No se pudieron cargar las estadísticas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const donutTotal = useMemo(
    () => data?.usersByRole.reduce((sum, r) => sum + r.count, 0) ?? 0,
    [data],
  );

  return (
    <section className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>¡{getGreeting(now)}, <span className={styles.nameHighlight}>{displayName}</span>!</h1>
          <p className={styles.subtitle}>Panel de control administrativo</p>
        </div>
        <div className={styles.dateBlock}>
          <CalendarRange size={16} />
          <span>{formatDate(now)}</span>
          <span className={styles.time}>{formatTime(now)}</span>
        </div>
      </header>

      {loading && <p className={styles.muted}>Cargando estadísticas…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {data && (
        <>
          {/* KPI Cards */}
          <div className={styles.kpiGrid}>
            <div className={`${styles.kpi} ${styles.kpi1}`}>
              <div className={styles.kpiIcon}><Users size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalUsers}</span>
                <span className={styles.kpiLabel}>Total Usuarios</span>
                <span className={styles.kpiSub}>Registrados en el sistema</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi2}`}>
              <div className={styles.kpiIcon}><UserCheck size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.activeUsers}</span>
                <span className={styles.kpiLabel}>Usuarios Activos</span>
                <span className={styles.kpiSub}>Con acceso habilitado</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi3}`}>
              <div className={styles.kpiIcon}><ShieldCheck size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalRoles}</span>
                <span className={styles.kpiLabel}>Roles</span>
                <span className={styles.kpiSub}>Configurados</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi4}`}>
              <div className={styles.kpiIcon}><CalendarRange size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalAcademicPeriods}</span>
                <span className={styles.kpiLabel}>Períodos</span>
                <span className={styles.kpiSub}>Académicos registrados</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi5}`}>
              <div className={styles.kpiIcon}><Layers size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalSections}</span>
                <span className={styles.kpiLabel}>Secciones</span>
                <span className={styles.kpiSub}>Niveles y grupos</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi6}`}>
              <div className={styles.kpiIcon}><GraduationCap size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalSpecialties}</span>
                <span className={styles.kpiLabel}>Especialidades</span>
                <span className={styles.kpiSub}>Técnicas registradas</span>
              </div>
            </div>
          </div>

          {/* Middle row */}
          <div className={styles.midGrid}>
            {/* Donut chart */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <LayoutDashboard size={18} />
                <h2>Distribución de usuarios</h2>
              </div>
              {data.usersByRole.length > 0 ? (
                <div className={styles.donutRow}>
                  <div className={styles.donutWrap}>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={data.usersByRole}
                          dataKey="count"
                          nameKey="role"
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={64}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {data.usersByRole.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [String(value), 'Usuarios']}
                          contentStyle={{ borderRadius: 8, border: '1px solid #C1C5C8', fontSize: 13 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.donutCenter}>
                      <span className={styles.donutTotal}>{donutTotal}</span>
                      <span className={styles.donutTotalLabel}>Total</span>
                    </div>
                  </div>
                  <ul className={styles.legend}>
                    {data.usersByRole.map((r, i) => (
                      <li key={r.role}>
                        <span
                          className={styles.legendDot}
                          style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                        />
                        <span className={styles.legendLabel}>{r.role}</span>
                        <span className={styles.legendCount}>
                          {r.count} ({donutTotal > 0 ? Math.round((r.count / donutTotal) * 100) : 0}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className={styles.muted}>Sin datos de roles disponibles.</p>
              )}
            </div>

            {/* Activity placeholder */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <Clock size={18} />
                <h2>Actividad reciente</h2>
              </div>
              <div className={styles.activityPlaceholder}>
                <BookOpen size={28} />
                <p><strong>Próximamente</strong></p>
                <p>Historial de actividad del sistema: importaciones, cambios de roles, ediciones de usuarios y más.</p>
              </div>
            </div>
          </div>

          {/* Quick access */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <Settings size={18} />
              <h2>Accesos rápidos</h2>
            </div>
            <div className={styles.qaGrid}>
              {quickAccess.map(({ label, to, icon: Icon }) => (
                <Link key={to + label} to={to} className={styles.qaItem}>
                  <div className={styles.qaIcon}><Icon size={20} /></div>
                  <span className={styles.qaLabel}>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        © 2026 EduSmart – CTP Hojancha. Todos los derechos reservados.
      </footer>
    </section>
  );
};
