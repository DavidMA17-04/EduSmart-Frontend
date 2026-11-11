import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarRange,
  DoorOpen,
  FileBarChart,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { dashboardApi } from '@/features/dashboard';
import type { DashboardSummary } from '@/features/dashboard';
import { useAuthStore } from '@/features/auth';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { DonutCard, type DonutSlice } from '@/shared/ui';
import { profileDisplayName } from '../model/profileDisplayName';
import { brandColors } from '@/styles/brandColors';
import { chartTheme } from '@/styles/chartTheme';
import { AttendanceDashboardPanel } from '@/widgets/attendance-dashboard-panel';
import { HouseWelcome } from './HouseWelcome';
import styles from './AdminHomePage.module.css';

/** Etiqueta pluralizada según cantidad (0/1/n). */
function countLabel(count: number, singular: string, plural: string): string {
  const word = count === 1 ? singular : plural;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const ROLE_COLORS: Record<string, string> = {
  Administrador: brandColors.gold,
  Docente: brandColors.primaryHover,
  Estudiante: brandColors.primary,
};

function colorForRole(role: string, index: number): string {
  return ROLE_COLORS[role] ?? chartTheme.series[index % chartTheme.series.length];
}

const quickAccess: Array<{
  label: string;
  to: string;
  icon: typeof Users;
  permission?: string;
}> = [
  { label: 'Usuarios', to: '/admin/users', icon: Users },
  { label: 'Estructura académica', to: '/admin/academic', icon: GraduationCap },
  { label: 'Asistencias', to: '/admin/attendance', icon: UserCheck },
  { label: 'Disciplina', to: '/admin/discipline', icon: ShieldAlert },
  { label: 'Control de salidas', to: '/admin/security/dashboard', icon: DoorOpen },
  { label: 'Avisos y comunicados', to: '/admin/communications', icon: Megaphone },
  { label: 'Reportes', to: '/admin/reports', icon: FileBarChart, permission: 'administrator.view' },
];

export const AdminHomePage = () => {
  const storedUser = useAuthStore((state) => state.user);
  const sessionUser = getSessionUser();
  const displayName = profileDisplayName(storedUser ?? (sessionUser ? { email: sessionUser.email } : null));
  const canViewAttendance = sessionHasPermission('attendance.view');

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        color: brandColors.primaryHover,
      },
      {
        name: 'Carreras técnicas',
        shortName: 'Carreras',
        count: data.totalSpecialties,
        color: brandColors.goldDark,
      },
    ];
  }, [data]);

  return (
    <section className={styles.page}>
      {/* Header */}
      <HouseWelcome name={displayName} subtitle="Panel de control administrativo" />

      {canViewAttendance ? (
        <AttendanceDashboardPanel variant="compact" />
      ) : null}

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
                  {countLabel(data.totalAcademicPeriods, 'curso lectivo', 'cursos lectivos')}
                </span>
                <span className={styles.kpiSub}>Registrados</span>
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
              {quickAccess
                .filter((item) => !item.permission || sessionHasPermission(item.permission))
                .map(({ label, to, icon: Icon }) => (
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
