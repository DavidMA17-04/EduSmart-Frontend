import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import type { AttendanceStatus } from '@/entities/attendance';
import {
  formatAttendanceGroupOptionLabel,
  useAttendanceReportsPanel,
} from '@/features/manage-attendance';
import { Alert, Button, Input, Select } from '@/shared/ui';
import styles from './AttendanceReportsPanel.module.css';

const STATUS_OPTIONS: Array<{ value: AttendanceStatus | ''; label: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'PRESENT', label: 'Presente' },
  { value: 'ABSENT', label: 'Ausente' },
  { value: 'LATE', label: 'Tardía' },
  { value: 'JUSTIFIED', label: 'Justificada' },
];

export const AttendanceReportsPanel = () => {
  const model = useAttendanceReportsPanel();

  return (
    <section className={styles.layout}>
      {model.catalogError ? <Alert>{model.catalogError}</Alert> : null}
      {model.error ? <Alert>{model.error}</Alert> : null}

      <form
        className={styles.filters}
        onSubmit={(event) => {
          event.preventDefault();
          void model.loadSummary();
        }}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Período académico</span>
          <Select
            onChange={(event) => model.setAcademicPeriodId(event.target.value)}
            value={model.academicPeriodId}
          >
            <option value="">Todos</option>
            {model.periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </Select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Grupo / sección</span>
          <Select
            onChange={(event) => model.setGroupId(event.target.value)}
            value={model.groupId}
          >
            <option value="">Todos</option>
            {model.groups.map((group) => (
              <option key={group.groupId} value={group.groupId}>
                {formatAttendanceGroupOptionLabel(group)}
              </option>
            ))}
          </Select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Asignatura</span>
          <Select
            onChange={(event) => model.setCourseId(event.target.value)}
            value={model.courseId}
          >
            <option value="">Todas</option>
            {model.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Desde</span>
          <Input
            onChange={(event) => model.setStartDate(event.target.value)}
            type="date"
            value={model.startDate}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Hasta</span>
          <Input
            onChange={(event) => model.setEndDate(event.target.value)}
            type="date"
            value={model.endDate}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Estado</span>
          <Select
            onChange={(event) =>
              model.setStatus(event.target.value as AttendanceStatus | '')
            }
            value={model.status}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <div className={styles.actions}>
          <Button disabled={model.loading} type="submit">
            {model.loading ? (
              <Loader2 aria-hidden="true" size={16} />
            ) : null}
            Actualizar indicadores
          </Button>
          <Button
            disabled={model.exporting !== null}
            onClick={() => void model.exportReport('excel')}
            type="button"
            variant="secondary"
          >
            {model.exporting === 'excel' ? (
              <Loader2 aria-hidden="true" size={16} />
            ) : (
              <FileSpreadsheet aria-hidden="true" size={16} />
            )}
            Descargar Excel
          </Button>
          <Button
            disabled={model.exporting !== null}
            onClick={() => void model.exportReport('pdf')}
            type="button"
            variant="secondary"
          >
            {model.exporting === 'pdf' ? (
              <Loader2 aria-hidden="true" size={16} />
            ) : (
              <FileText aria-hidden="true" size={16} />
            )}
            Descargar PDF
          </Button>
        </div>
      </form>

      <div className={styles.kpis}>
        <article className={styles.kpi}>
          <span className={styles.kpiValue}>{model.summary.totalSessions}</span>
          <span className={styles.kpiLabel}>Total de clases impartidas</span>
        </article>
        <article className={styles.kpi}>
          <span className={styles.kpiValue}>
            {model.summary.averageAttendanceRate.toFixed(1)}%
          </span>
          <span className={styles.kpiLabel}>Promedio de asistencia</span>
        </article>
        <article className={styles.kpi}>
          <span className={styles.kpiValue}>{model.summary.totalJustifications}</span>
          <span className={styles.kpiLabel}>Total de justificaciones</span>
        </article>
      </div>
    </section>
  );
};
