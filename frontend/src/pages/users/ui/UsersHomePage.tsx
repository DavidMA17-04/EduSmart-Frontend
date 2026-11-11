import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Clock3,
  FileSpreadsheet,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/features/dashboard';
import type { DashboardSummary } from '@/features/dashboard';
import { userApi } from '@/features/manage-user/api/userApi';
import { sessionHasPermission } from '@/shared/auth';
import { DonutCard, type DonutSlice } from '@/shared/ui';
import { brandColors } from '@/styles/brandColors';
import { chartTheme } from '@/styles/chartTheme';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import styles from './UsersHomePage.module.css';

type StatusCounts = {
  ALL: number;
  ACTIVE: number;
  INACTIVE: number;
  BLOCKED: number;
  PENDING: number;
};

const ROLE_COLORS: Record<string, string> = {
  Administrador: brandColors.gold,
  Docente: brandColors.primaryHover,
  Estudiante: brandColors.primary,
  Encargado: brandColors.green,
  Orientador: brandColors.navy,
  Director: brandColors.goldDark,
};

type StatusKey = 'PENDING' | 'BLOCKED' | 'ACTIVE' | 'INACTIVE';

export function UsersHomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let pending = 2;
    const settle = () => {
      pending -= 1;
      if (alive && pending <= 0) setLoading(false);
    };

    void dashboardApi
      .getSummary()
      .then((payload) => {
        if (alive) setSummary(payload);
      })
      .catch(() => undefined)
      .finally(settle);

    void userApi
      .listPaged({ page: 1, limit: 1 })
      .then((payload) => {
        if (alive && payload.mode === 'paged') {
          setStatusCounts(payload.statusCounts);
        }
      })
      .catch(() => undefined)
      .finally(settle);

    return () => {
      alive = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      ACTIVE: statusCounts?.ACTIVE ?? summary?.activeUsers ?? 0,
      PENDING: statusCounts?.PENDING ?? 0,
      BLOCKED: statusCounts?.BLOCKED ?? 0,
      INACTIVE: statusCounts?.INACTIVE ?? 0,
      ALL:
        statusCounts?.ALL ??
        (statusCounts
          ? statusCounts.ACTIVE + statusCounts.PENDING + statusCounts.BLOCKED + statusCounts.INACTIVE
          : (summary?.activeUsers ?? 0)),
    }),
    [statusCounts, summary],
  );

  const roleSlices = useMemo<DonutSlice[]>(
    () =>
      (summary?.usersByRole ?? [])
        .slice()
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((row, index) => ({
          name: row.role,
          shortName: row.role.length > 12 ? `${row.role.slice(0, 10)}…` : row.role,
          count: row.count,
          color: ROLE_COLORS[row.role] ?? chartTheme.series[index % chartTheme.series.length],
        })),
    [summary],
  );

  const directoryPath = (status?: StatusKey) =>
    staffPathForSession(`/admin/users/directory${status ? `?status=${status}` : ''}`);

  const needsAction = counts.PENDING + counts.BLOCKED;
  const today = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const kpis = [
    {
      key: 'pending',
      status: 'PENDING' as const,
      value: counts.PENDING,
      label: 'Pendientes',
      sub: 'Requieren activación',
      icon: Clock3,
      tone: styles.kpiWarn,
    },
    {
      key: 'blocked',
      status: 'BLOCKED' as const,
      value: counts.BLOCKED,
      label: 'Bloqueados',
      sub: 'Acceso suspendido',
      icon: AlertTriangle,
      tone: styles.kpiDanger,
    },
    {
      key: 'active',
      status: 'ACTIVE' as const,
      value: counts.ACTIVE,
      label: 'Activos',
      sub: 'Cuentas operativas',
      icon: UserCheck,
      tone: styles.kpiOk,
    },
    {
      key: 'inactive',
      status: 'INACTIVE' as const,
      value: counts.INACTIVE,
      label: 'Inactivos',
      sub: 'Sin uso reciente',
      icon: UserX,
      tone: styles.kpiMuted,
    },
  ];

  const quickAccess = [
    {
      key: 'directory',
      label: 'Directorio',
      hint: 'Buscar y editar',
      to: '/admin/users/directory',
      icon: Users,
      visible: sessionHasPermission('administrator.view'),
    },
    {
      key: 'import',
      label: 'Importar masivo',
      hint: 'Excel / CSV',
      to: '/admin/users/import/bulk',
      icon: FileSpreadsheet,
      visible: sessionHasPermission('administrator.view'),
    },
    {
      key: 'new',
      label: 'Alta manual',
      hint: 'Un usuario',
      to: '/admin/users/new',
      icon: UserPlus,
      visible: sessionHasPermission('administrator.view'),
    },
    {
      key: 'roles',
      label: 'Roles y permisos',
      hint: 'Gobernanza',
      to: '/admin/roles-permissions',
      icon: ShieldCheck,
      visible: sessionHasPermission('roles_permissions.view'),
    },
    {
      key: 'incorporate',
      label: 'Incorporación',
      hint: 'Guía de altas',
      to: '/admin/users/incorporate',
      icon: BookOpen,
      visible: sessionHasPermission('administrator.view'),
    },
  ].filter((item) => item.visible);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Identidades · CTP Hojancha</p>
          <h1>
            Usuarios <span className={styles.nameHighlight}>en higiene</span>
          </h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Cargando cuentas…'
              : `${counts.ALL.toLocaleString('es-CR')} cuentas · ${needsAction} necesitan acción`}
          </p>
        </div>
        <div className={styles.dateBlock} aria-hidden="true">
          <span className={styles.time}>{today}</span>
        </div>
      </header>

      <div
        aria-busy={loading}
        aria-label="Indicadores de estado de cuentas"
        aria-live="polite"
        className={styles.kpiGrid}
      >
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <button
              aria-label={`Abrir directorio filtrado: ${kpi.label}, ${kpi.value}`}
              className={`${styles.kpi} ${kpi.tone}`}
              key={kpi.key}
              onClick={() => navigate(directoryPath(kpi.status))}
              style={{ animationDelay: `${index * 60}ms` }}
              type="button"
            >
              <span aria-hidden="true" className={styles.kpiIcon}>
                <Icon size={18} />
              </span>
              <span className={styles.kpiBody}>
                {loading ? (
                  <span aria-hidden="true" className={styles.skeletonValue} />
                ) : (
                  <span className={styles.kpiValue}>{kpi.value}</span>
                )}
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiSub}>{kpi.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.midGrid}>
        <article className={styles.actionBoard}>
          <div className={styles.cardHead}>
            <AlertTriangle size={18} />
            <h2>Requiere acción</h2>
          </div>
          {needsAction === 0 && !loading ? (
            <p className={styles.emptyAction}>
              No hay pendientes ni bloqueados. El directorio puede usarse para consulta o altas.
            </p>
          ) : (
            <ul className={styles.actionList}>
              <li>
                <div>
                  <strong>{loading ? '—' : counts.PENDING}</strong>
                  <span>Cuentas pendientes de activar</span>
                </div>
                <Link className={styles.actionLink} to={directoryPath('PENDING')}>
                  Revisar
                </Link>
              </li>
              <li>
                <div>
                  <strong>{loading ? '—' : counts.BLOCKED}</strong>
                  <span>Cuentas bloqueadas</span>
                </div>
                <Link className={styles.actionLink} to={directoryPath('BLOCKED')}>
                  Revisar
                </Link>
              </li>
            </ul>
          )}
          <Link className={styles.primaryCta} to={directoryPath()}>
            <Users size={16} />
            Abrir directorio completo
          </Link>
        </article>

        <DonutCard
          emptyText={loading ? 'Cargando distribución por rol…' : 'Sin distribución por rol.'}
          icon={LayoutDashboard}
          slices={roleSlices}
          title="Usuarios por rol"
        />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <UserPlus size={18} />
          <h2>¿Qué desea hacer?</h2>
        </div>
        <div className={styles.qaGrid}>
          {quickAccess.map(({ key, label, hint, to, icon: Icon }) => (
            <Link className={styles.qaItem} key={key} to={staffPathForSession(to)}>
              <span aria-hidden="true" className={styles.qaIcon}>
                <Icon size={20} />
              </span>
              <span className={styles.qaCopy}>
                <strong>{label}</strong>
                <span>{hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
