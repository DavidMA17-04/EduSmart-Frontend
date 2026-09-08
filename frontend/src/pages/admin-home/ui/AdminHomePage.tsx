import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarRange,
  FileSpreadsheet,
  FolderOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '@/features/dashboard';
import type { DashboardSummary } from '@/features/dashboard';
import { getSessionUser } from '@/shared/auth';
import { brandColors } from '@/styles/brandColors';
import styles from './AdminHomePage.module.css';

function getGreeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Etiqueta pluralizada según cantidad (0/1/n). */
function countLabel(count: number, singular: string, plural: string): string {
  const word = count === 1 ? singular : plural;
  return word.charAt(0).toUpperCase() + word.slice(1);
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

const ROLE_COLORS: Record<string, string> = {
  Administrador: brandColors.gold,
  Docente: brandColors.primaryHover,
  Estudiante: brandColors.primary,
};

const FALLBACK_COLORS = [
  brandColors.navy,
  brandColors.muted,
  brandColors.green,
  brandColors.goldDark,
];

function colorForRole(role: string, index: number): string {
  return ROLE_COLORS[role] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

type DonutSlice = { name: string; shortName: string; count: number; color: string };

function DonutCard({
  title,
  icon: Icon,
  slices,
  emptyText,
}: {
  title: string;
  icon: typeof LayoutDashboard;
  slices: DonutSlice[];
  emptyText: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const hasData = slices.some((slice) => slice.count > 0);
  const activeSlice = activeIndex != null ? slices[activeIndex] : null;
  const centerValue = activeSlice ? activeSlice.count : total;
  const centerLabel = activeSlice ? activeSlice.shortName : 'Total';

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      {hasData ? (
        <div className={styles.donutRow}>
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height={168}>
              <PieChart>
                <Pie
                  animationBegin={0}
                  animationDuration={700}
                  animationEasing="ease-out"
                  cx="50%"
                  cy="50%"
                  data={slices}
                  dataKey="count"
                  innerRadius={50}
                  isAnimationActive
                  nameKey="name"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((slice, index) => {
                    const isActive = activeIndex === index;
                    const isDimmed = activeIndex != null && !isActive;
                    return (
                      <Cell
                        fill={slice.color}
                        key={slice.name}
                        style={{
                          cursor: 'pointer',
                          filter: isActive ? 'brightness(1.08)' : 'none',
                          opacity: isDimmed ? 0.4 : 1,
                          outline: 'none',
                          transition: 'opacity 0.4s ease, filter 0.4s ease',
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <div className={styles.donutCenterContent} key={`${centerValue}-${centerLabel}`}>
                <span className={styles.donutTotal}>{centerValue}</span>
                <span className={styles.donutTotalLabel}>{centerLabel}</span>
              </div>
            </div>
          </div>
          <ul className={styles.legend}>
            {slices.map((slice, index) => (
              <li
                className={activeIndex === index ? styles.legendActive : undefined}
                key={slice.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span className={styles.legendDot} style={{ background: slice.color }} />
                <span className={styles.legendLabel}>{slice.name}</span>
                <span className={styles.legendCount}>
                  {slice.count} ({total > 0 ? Math.round((slice.count / total) * 100) : 0}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.muted}>{emptyText}</p>
      )}
    </div>
  );
}

const quickAccess = [
  { label: 'Usuarios', to: '/admin/users', icon: Users },
  { label: 'Directorio', to: '/admin/users/directory', icon: FolderOpen },
  { label: 'Roles y permisos', to: '/admin/roles-permissions', icon: ShieldCheck },
  { label: 'Oferta académica', to: '/admin/specialties', icon: GraduationCap },
  { label: 'Períodos', to: '/admin/academic-periods', icon: CalendarRange },
  { label: 'Secciones', to: '/admin/sections-groups', icon: Layers },
  { label: 'Importar', to: '/admin/users', icon: FileSpreadsheet },
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

  const loadSummary = () => {
    setLoading(true);
    setError(null);
    return dashboardApi
      .getSummary()
      .then((summary) => {
        setData(summary);
        setError(null);
      })
      .catch(() => {
        setError('No se pudieron cargar las estadísticas.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    dashboardApi
      .getSummary()
      .then((summary) => {
        if (!active) return;
        setData(summary);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('No se pudieron cargar las estadísticas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const usersByRoleSlices = useMemo<DonutSlice[]>(
    () =>
      (data?.usersByRole ?? []).map((role, index) => ({
        name: role.role,
        shortName: role.role.length > 10 ? `${role.role.slice(0, 9)}…` : role.role,
        count: role.count,
        color: colorForRole(role.role, index),
      })),
    [data],
  );

  const usersStatusSlices = useMemo<DonutSlice[]>(() => {
    if (!data) return [];
    const inactive = Math.max(0, data.totalUsers - data.activeUsers);
    return [
      { name: 'Activos', shortName: 'Activos', count: data.activeUsers, color: brandColors.green },
      { name: 'Inactivos', shortName: 'Inactivos', count: inactive, color: brandColors.muted },
    ];
  }, [data]);

  const offerSlices = useMemo<DonutSlice[]>(() => {
    if (!data) return [];
    return [
      {
        name: 'Talleres exploratorios',
        shortName: 'Talleres',
        count: data.totalExploratoryWorkshops ?? 0,
        color: '#0E7490',
      },
      {
        name: 'Especialidades técnicas',
        shortName: 'Especialidades',
        count: data.totalSpecialties,
        color: brandColors.goldDark,
      },
    ];
  }, [data]);

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
      {error && (
        <div className={styles.errorRow}>
          <p className={styles.error}>{error}</p>
          <button
            className={styles.retryButton}
            disabled={loading}
            onClick={() => {
              void loadSummary();
            }}
            type="button"
          >
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div className={styles.kpiGrid}>
            <div className={`${styles.kpi} ${styles.kpi1}`}>
              <div className={styles.kpiIcon}><Users size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalUsers}</span>
                <span className={styles.kpiLabel}>
                  {countLabel(data.totalUsers, 'usuario', 'usuarios')}
                </span>
                <span className={styles.kpiSub}>Registrados en el sistema</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi2}`}>
              <div className={styles.kpiIcon}><UserCheck size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.activeUsers}</span>
                <span className={styles.kpiLabel}>
                  {countLabel(data.activeUsers, 'usuario activo', 'usuarios activos')}
                </span>
                <span className={styles.kpiSub}>Con acceso habilitado</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi3}`}>
              <div className={styles.kpiIcon}><ShieldCheck size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalRoles}</span>
                <span className={styles.kpiLabel}>
                  {countLabel(data.totalRoles, 'rol', 'roles')}
                </span>
                <span className={styles.kpiSub}>Configurados</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi4}`}>
              <div className={styles.kpiIcon}><CalendarRange size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalAcademicPeriods}</span>
                <span className={styles.kpiLabel}>
                  {countLabel(data.totalAcademicPeriods, 'período', 'períodos')}
                </span>
                <span className={styles.kpiSub}>Académicos registrados</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi5}`}>
              <div className={styles.kpiIcon}><Layers size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalSections}</span>
                <span className={styles.kpiLabel}>
                  {countLabel(data.totalSections, 'sección', 'secciones')}
                </span>
                <span className={styles.kpiSub}>Niveles y grupos</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi6}`}>
              <div className={styles.kpiIcon}><BookOpen size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalExploratoryWorkshops ?? 0}</span>
                <span className={styles.kpiLabel}>
                  {countLabel(
                    data.totalExploratoryWorkshops ?? 0,
                    'taller exploratorio',
                    'talleres exploratorios',
                  )}
                </span>
                <span className={styles.kpiSub}>Séptimo a noveno</span>
              </div>
            </div>
            <div className={`${styles.kpi} ${styles.kpi7}`}>
              <div className={styles.kpiIcon}><GraduationCap size={22} /></div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiValue}>{data.totalSpecialties}</span>
                <span className={styles.kpiLabel}>
                  {countLabel(data.totalSpecialties, 'especialidad', 'especialidades')}
                </span>
                <span className={styles.kpiSub}>Décimo a duodécimo</span>
              </div>
            </div>
          </div>

          {/* Donut charts */}
          <div className={styles.midGrid}>
            <DonutCard
              emptyText="Sin datos de roles disponibles."
              icon={LayoutDashboard}
              slices={usersByRoleSlices}
              title="Distribución de usuarios"
            />
            <DonutCard
              emptyText="Sin datos de estado de usuarios."
              icon={UserCheck}
              slices={usersStatusSlices}
              title="Usuarios activos e inactivos"
            />
            <DonutCard
              emptyText="Sin talleres ni especialidades registradas."
              icon={BookOpen}
              slices={offerSlices}
              title="Talleres y especialidades"
            />
          </div>

          {/* Quick access */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <Zap size={18} />
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
