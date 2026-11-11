import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  FileSpreadsheet,
  FileText,
  Gavel,
  Inbox,
  Layers,
  ListChecks,
} from 'lucide-react';
import { academicPeriodApi } from '@/features/manage-academic-period/api/academicPeriodApi';
import { groupApi } from '@/features/manage-group';
import type { AcademicGroup } from '@/entities/group';
import { brandColors } from '@/styles/brandColors';
import { chartTheme } from '@/styles/chartTheme';
import {
  Alert,
  Button,
  DonutCard,
  type DonutSlice,
  EmptyState,
  ModuleBarChart,
  Select,
} from '@/shared/ui';
import { disciplineApi } from '../api/disciplineApi';
import { disciplineCasePath, disciplineHistoryPath } from '../model/disciplineRouting';
import {
  dedupeSectionLabel,
  formatDashboardMonth,
  formatSectionLabel,
  type DisciplinaryDashboard,
} from '../model/disciplineDashboard';
import styles from './DisciplineDashboardPanel.module.css';

const SEVERITY_COLORS: Record<string, string> = {
  'Muy leve': brandColors.green,
  Leve: brandColors.gold,
  Grave: brandColors.warning,
  'Muy grave': brandColors.danger,
  Gravísima: brandColors.navy,
};

function toDonutSlices(
  rows: Array<{ label: string; count: number }>,
  colorFor?: (label: string, index: number) => string,
): DonutSlice[] {
  return rows.map((row, index) => ({
    name: row.label,
    shortName: row.label.length > 14 ? `${row.label.slice(0, 12)}…` : row.label,
    count: row.count,
    color: colorFor?.(row.label, index) ?? chartTheme.series[index % chartTheme.series.length],
  }));
}

export function DisciplineDashboardPanel({ canExport }: { canExport: boolean }) {
  const [periodId, setPeriodId] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [groupId, setGroupId] = useState('');
  const [periods, setPeriods] = useState<Array<{ id: number; name: string }>>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [board, setBoard] = useState<DisciplinaryDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
  }, [periodId, gradeLevel, groupId]);

  const levels = useMemo(
    () =>
      [...new Set(groups.map((group) => group.section?.gradeLevel).filter((level): level is number => level != null))].sort(
        (left, right) => left - right,
      ),
    [groups],
  );
  const sections = groups.filter((group) => !gradeLevel || group.section?.gradeLevel === Number(gradeLevel));

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

  return (
    <section className={styles.layout}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <label>
            Período
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
                  {level}
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
        {canExport ? (
          <div className={styles.exports}>
            <Button disabled={exporting != null} onClick={() => void download('excel')} type="button" variant="secondary">
              <FileSpreadsheet aria-hidden size={16} />
              Excel
            </Button>
            <Button disabled={exporting != null} onClick={() => void download('pdf')} type="button" variant="secondary">
              <FileText aria-hidden size={16} />
              PDF
            </Button>
          </div>
        ) : null}
      </div>
      {canExport ? <p className={styles.muted}>La exportación usa el período y la sección elegidos.</p> : null}
      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando tablero…</p> : null}
      {board && !loading ? (
        <>
          <p className={styles.needsActionLabel}>Needs Action · plazos del debido proceso</p>
          <div className={styles.kpis}>
            <article className={`${styles.kpi} ${styles.kpiTotal}`}>
              <span className={styles.kpiIcon}><Inbox aria-hidden size={18} /></span>
              <div>
                <strong>{board.total}</strong>
                <span>Expedientes abiertos</span>
              </div>
            </article>
            <article className={`${styles.kpi} ${styles.kpiSoon}`}>
              <span className={styles.kpiIcon}><Clock3 aria-hidden size={18} /></span>
              <div>
                <strong>{board.deadlines.dueSoon}</strong>
                <span>Por vencer</span>
              </div>
            </article>
            <article className={`${styles.kpi} ${board.deadlines.overdue > 0 ? styles.kpiLate : styles.kpiNeutral}`}>
              <span className={styles.kpiIcon}><AlertTriangle aria-hidden size={18} /></span>
              <div>
                <strong>{board.deadlines.overdue}</strong>
                <span>Vencidos</span>
              </div>
            </article>
            <article className={`${styles.kpi} ${board.alerts.length > 0 ? styles.kpiAlerts : styles.kpiNeutral}`}>
              <span className={styles.kpiIcon}><AlertTriangle aria-hidden size={18} /></span>
              <div>
                <strong>{board.alerts.length}</strong>
                <span>Alertas de proceso</span>
              </div>
            </article>
          </div>

          {board.total === 0 ? (
            <div className={styles.chartsEmpty}>
              <EmptyState description="Pruebe con otro período, nivel o sección." icon={Inbox} title="Sin expedientes" />
            </div>
          ) : (
            <div className={styles.charts}>
              <DonutCard
                emptyText="Sin datos de gravedad."
                icon={Gavel}
                slices={toDonutSlices(board.bySeverity, (label, index) =>
                  SEVERITY_COLORS[label] ?? chartTheme.series[index % chartTheme.series.length],
                )}
                title="Por gravedad"
              />
              <DonutCard
                emptyText="Sin datos de estado."
                icon={ListChecks}
                slices={toDonutSlices(board.byStatus)}
                title="Por estado"
              />
              <ModuleBarChart
                data={board.byMonth.map((item, index) => ({
                  name: formatDashboardMonth(item.month),
                  value: item.count,
                  color: chartTheme.series[index % chartTheme.series.length],
                }))}
                emptyText="Sin serie mensual."
                height={220}
                icon={CalendarDays}
                layout="vertical"
                title="Por mes"
              />
              <ModuleBarChart
                data={board.bySection.map((item, index) => ({
                  name: dedupeSectionLabel(item.sectionLabel),
                  value: item.count,
                  color: chartTheme.series[index % chartTheme.series.length],
                }))}
                emptyText="Sin datos por sección."
                height={220}
                icon={Layers}
                title="Por sección"
              />
            </div>
          )}

          <div className={styles.split}>
            <article className={styles.card}>
              <h3>Alertas</h3>
              {board.alerts.length === 0 ? <p className={styles.muted}>No hay alertas en este filtro.</p> : null}
              <ul className={styles.list}>
                {board.alerts.map((alert, index) => (
                  <li className={styles.alert} data-code={alert.code} key={`${alert.code}-${alert.caseId ?? alert.studentUserId ?? index}`}>
                    <div>
                      <strong>{alert.message}</strong>
                      {alert.fullName ? <span>{alert.fullName}</span> : null}
                      {alert.caseNumber ? <span>{alert.caseNumber}</span> : null}
                    </div>
                    {alert.caseId ? (
                      <Link to={portalPathForSession(disciplineCasePath(alert.caseId))}>
                        Abrir
                      </Link>
                    ) : null}
                    {!alert.caseId && alert.studentUserId ? (
                      <Link to={portalPathForSession(disciplineHistoryPath(alert.studentUserId))}>
                        Historial
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
            <article className={styles.card}>
              <h3>Estudiantes con más expedientes</h3>
              {board.topStudents.length === 0 ? <p className={styles.muted}>Sin expedientes en este filtro.</p> : null}
              <ul className={styles.list}>
                {board.topStudents.map((student) => (
                  <li key={student.studentUserId}>
                    <Link to={portalPathForSession(disciplineHistoryPath(student.studentUserId))}>
                      {student.fullName}
                    </Link>
                    <span>{student.count}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}
