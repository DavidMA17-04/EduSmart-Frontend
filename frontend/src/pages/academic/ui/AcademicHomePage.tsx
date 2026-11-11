import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  CalendarClock,
  CalendarRange,
  GraduationCap,
  Layers,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { administrativeReportsApi } from '@/features/administrative-reports';
import type { AcademicStructureReportRow } from '@/features/administrative-reports';
import { dashboardApi } from '@/features/dashboard';
import type { DashboardSummary } from '@/features/dashboard';
import { sessionHasPermission } from '@/shared/auth';
import { DonutCard, type DonutSlice, ModuleBarChart } from '@/shared/ui';
import { brandColors } from '@/styles/brandColors';
import { chartTheme } from '@/styles/chartTheme';
import {
  ACADEMIC_PERIODS_MANAGE,
  ACADEMIC_SECTIONS_MANAGE,
  ACADEMIC_SPECIALTIES_MANAGE,
  ACADEMIC_SUBJECTS_MANAGE,
} from '@/widgets/app-shell/model/academicCatalogAccess';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import styles from './AcademicHomePage.module.css';

export function AcademicHomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [rows, setRows] = useState<AcademicStructureReportRow[]>([]);
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

    void administrativeReportsApi
      .getAcademicStructure()
      .then((list) => {
        if (alive) setRows(list);
      })
      .catch(() => undefined)
      .finally(settle);

    return () => {
      alive = false;
    };
  }, []);

  const byGrade = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const key = row.gradeLevel ? `${row.gradeLevel}°` : 'Sin nivel';
      map.set(key, (map.get(key) ?? 0) + (row.studentCount || 0));
    }
    return [...map.entries()]
      .map(([name, value], index) => ({
        name,
        value,
        color: chartTheme.series[index % chartTheme.series.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [rows]);

  const offerSlices = useMemo<DonutSlice[]>(
    () => [
      {
        name: 'Talleres exploratorios',
        shortName: 'Talleres',
        count: summary?.totalExploratoryWorkshops ?? 0,
        color: brandColors.primaryHover,
      },
      {
        name: 'Especialidades',
        shortName: 'Carreras',
        count: summary?.totalSpecialties ?? 0,
        color: brandColors.goldDark,
      },
    ],
    [summary],
  );

  const gaps = useMemo(() => {
    const noGuide = rows.filter((row) => !row.guideTeacher).length;
    const inactive = rows.filter((row) => String(row.status || '').toUpperCase() !== 'ACTIVE').length;
    const empty = rows.filter((row) => (row.studentCount || 0) === 0).length;
    return {
      noGuide,
      inactive,
      empty,
      total: noGuide + inactive + empty,
    };
  }, [rows]);

  const periods = summary?.totalAcademicPeriods ?? 0;
  const sections = summary?.totalSections ?? 0;
  const specialties = summary?.totalSpecialties ?? 0;
  const workshops = summary?.totalExploratoryWorkshops ?? 0;

  const today = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const path = (to: string) => staffPathForSession(to);

  const kpis = [
    {
      key: 'periods',
      value: periods,
      label: 'Cursos lectivos',
      sub: 'Periodos registrados',
      icon: CalendarRange,
      tone: styles.kpiPrimary,
      to: '/admin/academic-periods',
      visible: ACADEMIC_PERIODS_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'sections',
      value: sections,
      label: 'Secciones',
      sub: 'Grupos del ciclo',
      icon: Layers,
      tone: styles.kpiOk,
      to: '/admin/sections-groups',
      visible: ACADEMIC_SECTIONS_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'specialties',
      value: specialties,
      label: 'Especialidades',
      sub: 'Décimo a duodécimo',
      icon: GraduationCap,
      tone: styles.kpiGold,
      to: '/admin/specialties',
      visible: ACADEMIC_SPECIALTIES_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'workshops',
      value: workshops,
      label: 'Talleres',
      sub: 'Séptimo a noveno',
      icon: BookOpen,
      tone: styles.kpiMuted,
      to: '/admin/specialties',
      visible: ACADEMIC_SPECIALTIES_MANAGE.some((code) => sessionHasPermission(code)),
    },
  ];

  const quickAccess = [
    {
      key: 'specialties',
      label: 'Especialidades',
      hint: 'Oferta académica',
      to: '/admin/specialties',
      icon: GraduationCap,
      visible: ACADEMIC_SPECIALTIES_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'subjects',
      label: 'Materias',
      hint: 'Catálogo curricular',
      to: '/admin/subjects',
      icon: BookOpen,
      visible: ACADEMIC_SUBJECTS_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'periods',
      label: 'Cursos lectivos',
      hint: 'Periodos y cierres',
      to: '/admin/academic-periods',
      icon: CalendarRange,
      visible: ACADEMIC_PERIODS_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'wizard',
      label: 'Configurar ciclo',
      hint: 'Asistente anual',
      to: '/admin/academic-structure-wizard',
      icon: CalendarClock,
      visible: sessionHasPermission('academic_structure.configure'),
    },
    {
      key: 'sections',
      label: 'Secciones',
      hint: 'Grupos y cupos',
      to: '/admin/sections-groups',
      icon: Layers,
      visible: ACADEMIC_SECTIONS_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'assignments',
      label: 'Asignaciones',
      hint: 'Docente · materia',
      to: '/admin/teaching-assignments',
      icon: BookMarked,
      visible: ACADEMIC_SUBJECTS_MANAGE.some((code) => sessionHasPermission(code)),
    },
    {
      key: 'schedule',
      label: 'Horario',
      hint: 'Tablero semanal',
      to: '/admin/schedule',
      icon: CalendarClock,
      visible: sessionHasPermission('schedules.view'),
    },
    {
      key: 'my-schedule',
      label: 'Mi horario',
      hint: 'Carga personal',
      to: '/admin/my-schedule',
      icon: CalendarClock,
      visible:
        sessionHasPermission('schedules.view_own') && !sessionHasPermission('schedules.view'),
    },
  ].filter((item) => item.visible);

  const sectionsPath = path('/admin/sections-groups');

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Estructura · ciclo lectivo</p>
          <h1>
            Académico <span className={styles.nameHighlight}>en control</span>
          </h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Cargando estructura…'
              : `${sections} secciones · ${gaps.total} señales de hueco`}
          </p>
        </div>
        <div className={styles.dateBlock} aria-hidden="true">
          <span className={styles.time}>{today}</span>
        </div>
      </header>

      <div
        aria-busy={loading}
        aria-label="Indicadores de estructura académica"
        aria-live="polite"
        className={styles.kpiGrid}
      >
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <button
              aria-label={
                kpi.visible
                  ? `Abrir ${kpi.label}: ${kpi.value}`
                  : `${kpi.label}: ${kpi.value}`
              }
              className={`${styles.kpi} ${kpi.tone}`}
              disabled={!kpi.visible}
              key={kpi.key}
              onClick={() => {
                if (kpi.visible) navigate(path(kpi.to));
              }}
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
          {gaps.total === 0 && !loading ? (
            <p className={styles.emptyAction}>
              Sin huecos reportados en grupos. Puede seguir con catálogos u horarios.
            </p>
          ) : (
            <ul className={styles.actionList}>
              <li>
                <div>
                  <strong>{loading ? '—' : gaps.noGuide}</strong>
                  <span>Grupos sin docente guía</span>
                </div>
                <Link className={styles.actionLink} to={sectionsPath}>
                  Revisar
                </Link>
              </li>
              <li>
                <div>
                  <strong>{loading ? '—' : gaps.inactive}</strong>
                  <span>Grupos inactivos</span>
                </div>
                <Link className={styles.actionLink} to={sectionsPath}>
                  Revisar
                </Link>
              </li>
              <li>
                <div>
                  <strong>{loading ? '—' : gaps.empty}</strong>
                  <span>Grupos sin matrícula</span>
                </div>
                <Link className={styles.actionLink} to={sectionsPath}>
                  Revisar
                </Link>
              </li>
            </ul>
          )}
          <Link className={styles.primaryCta} to={sectionsPath}>
            <Users size={16} />
            Abrir niveles y secciones
          </Link>
        </article>

        <DonutCard
          emptyText={loading ? 'Cargando oferta…' : 'Sin oferta académica registrada.'}
          icon={GraduationCap}
          slices={offerSlices}
          title="Talleres y especialidades"
        />
      </div>

      <ModuleBarChart
        data={byGrade}
        emptyText={loading ? 'Cargando matrícula por nivel…' : 'Sin matrícula por nivel para graficar.'}
        height={220}
        icon={Layers}
        title="Estudiantes por nivel"
      />

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <GraduationCap size={18} />
          <h2>¿Qué desea hacer?</h2>
        </div>
        <div className={styles.qaGrid}>
          {quickAccess.map(({ key, label, hint, to, icon: Icon }) => (
            <Link className={styles.qaItem} key={key} to={path(to)}>
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
