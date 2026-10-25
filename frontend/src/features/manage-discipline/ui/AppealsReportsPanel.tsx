import { useEffect, useState } from 'react';
import { FileSpreadsheet, FileText, Scale } from 'lucide-react';
import { Alert, Button, EmptyState, Select } from '@/shared/ui';
import { sessionHasPermission } from '@/shared/auth';
import { disciplineApi } from '../api/disciplineApi';
import {
  APPEAL_REPORT_DEADLINE_OPTIONS,
  APPEAL_REPORT_KIND_OPTIONS,
  APPEAL_REPORT_OUTCOME_OPTIONS,
  APPEAL_REPORTS_COPY,
  appealDashboardKpis,
  appealOutcomeRows,
  appealStatusRows,
  isEmptyAppealDashboard,
} from '../model/appealReports';
import { DISCIPLINE_PERMISSIONS } from '../model/disciplineRouting';
import type { AppealKind, AppealOutcomeFilter, DeadlineIndicator, DisciplinaryAppealDashboard } from '../model/types';
import styles from './AppealsCenter.module.css';

export const AppealsReportsPanel = () => {
  const canExport = sessionHasPermission(DISCIPLINE_PERMISSIONS.export);
  const [kind, setKind] = useState<'' | AppealKind>('');
  const [outcome, setOutcome] = useState<'' | AppealOutcomeFilter>('');
  const [deadline, setDeadline] = useState<'' | Exclude<DeadlineIndicator, 'NONE'>>('');
  const [board, setBoard] = useState<DisciplinaryAppealDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const filters = {
    kind: kind || undefined,
    outcome: outcome || undefined,
    deadline: deadline || undefined,
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void disciplineApi
      .getAppealDashboard(filters)
      .then((next) => {
        if (active) setBoard(next);
      })
      .catch((reason: unknown) => {
        if (active) {
          setBoard(null);
          setError(reason instanceof Error ? reason.message : 'No se pudo cargar el tablero de recursos.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, outcome, deadline]);

  const download = async (format: 'excel' | 'pdf') => {
    setExporting(format);
    setError(null);
    try {
      await disciplineApi.exportAppeals(format, filters);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo exportar el reporte.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <h2>{APPEAL_REPORTS_COPY.title}</h2>
        <p className={styles.muted}>{APPEAL_REPORTS_COPY.filtersHint}</p>
        <div className={styles.actions}>
          <label className={styles.field}>
            Recurso
            <Select value={kind} onChange={(event) => setKind(event.target.value as '' | AppealKind)}>
              {APPEAL_REPORT_KIND_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles.field}>
            Resultado
            <Select value={outcome} onChange={(event) => setOutcome(event.target.value as '' | AppealOutcomeFilter)}>
              {APPEAL_REPORT_OUTCOME_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles.field}>
            Plazo
            <Select value={deadline} onChange={(event) => setDeadline(event.target.value as '' | Exclude<DeadlineIndicator, 'NONE'>)}>
              {APPEAL_REPORT_DEADLINE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          {canExport ? (
            <>
              <Button type="button" variant="secondary" disabled={exporting != null} onClick={() => void download('excel')}>
                <FileSpreadsheet aria-hidden size={16} /> {APPEAL_REPORTS_COPY.exportExcel}
              </Button>
              <Button type="button" variant="secondary" disabled={exporting != null} onClick={() => void download('pdf')}>
                <FileText aria-hidden size={16} /> {APPEAL_REPORTS_COPY.exportPdf}
              </Button>
            </>
          ) : null}
        </div>
        {canExport ? <p className={styles.muted}>{APPEAL_REPORTS_COPY.noCsv}</p> : null}
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando indicadores…</p> : null}
      {!loading && isEmptyAppealDashboard(board) ? (
        <EmptyState icon={Scale} title={APPEAL_REPORTS_COPY.empty} description="Ajuste los filtros o espere a que se interpongan recursos." />
      ) : null}
      {board && !loading && board.total > 0 ? (
        <>
          <div className={styles.kpis}>
            {appealDashboardKpis(board).map((item) => (
              <article key={item.key} className={styles.kpi}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
          <div className={styles.preview}>
            <h2>Resultados de resolución</h2>
            <dl>
              {appealOutcomeRows(board).map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.preview}>
            <h2>Distribución por estado del expediente</h2>
            <dl>
              {appealStatusRows(board).map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      ) : null}
    </section>
  );
};
