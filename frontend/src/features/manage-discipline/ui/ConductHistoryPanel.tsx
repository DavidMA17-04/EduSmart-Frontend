import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Alert, Badge, Button, EmptyState, Select } from '@/shared/ui';
import { disciplineApi } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import { STATUS_LABELS, STATUS_TONES } from '../model/caseInbox';
import { mergeHistoryStudents, resolveHistoryStudent, type HistoryAudience } from '../model/conductHistory';
import { disciplineCasePath } from '../model/disciplineRouting';
import { SEVERITY_LABELS, SEVERITY_ORDER, SEVERITY_TONES } from '../model/severity';
import type {
  ConductPeriodHistory,
  DisciplinaryCaseStatus,
  HistoryStudentOption,
  InfractionSeverity,
  StudentConductHistory,
} from '../model/types';
import styles from './ConductHistoryPanel.module.css';

const STATUSES = Object.keys(STATUS_LABELS) as DisciplinaryCaseStatus[];

const DEDUCTION_TONE = {
  APPLIED: 'success',
  PROPOSED: 'warning',
  NONE: 'neutral',
} as const;

export function ConductHistoryPanel({
  audience,
  sessionUserId,
  canSearchStudents,
  canExport,
}: {
  audience: HistoryAudience;
  sessionUserId: number;
  canSearchStudents: boolean;
  canExport: boolean;
}) {
  const { studentId: studentIdParam } = useParams();
  const parsedStudentId = Number(studentIdParam);
  const requestedStudentId = Number.isInteger(parsedStudentId) && parsedStudentId > 0 ? parsedStudentId : null;
  const [roster, setRoster] = useState<HistoryStudentOption[]>([]);
  const [rosterReady, setRosterReady] = useState(audience === 'student');
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [periodOptions, setPeriodOptions] = useState<ConductPeriodHistory[]>([]);
  const [history, setHistory] = useState<StudentConductHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchHits, setSearchHits] = useState<HistoryStudentOption[]>([]);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  useEffect(() => {
    if (audience === 'student') return;
    let active = true;
    void (async () => {
      try {
        const page = await disciplineApi.listCases({ page: 1, pageSize: 100 });
        const fromCases = page.data.map((row) => ({ id: row.studentUserId, fullName: row.studentFullName }));
        const fromNotes =
          audience === 'guardian'
            ? (await disciplineApi.listMyNotifications()).items.map((item) => ({
                id: item.studentUserId,
                fullName: item.studentName,
              }))
            : [];
        if (active) setRoster(mergeHistoryStudents(fromCases, fromNotes));
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar a los estudiantes.');
      } finally {
        if (active) setRosterReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [audience]);

  useEffect(() => {
    if (!canSearchStudents || search.trim().length < 2) {
      setSearchHits([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void disciplineApi
        .searchStudents(search.trim())
        .then((hits) => setSearchHits(hits.map((hit) => ({ id: hit.id, fullName: hit.fullName }))))
        .catch(() => setSearchHits([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [canSearchStudents, search]);

  const decision =
    audience === 'guardian' && !rosterReady
      ? { studentId: null, blocked: false }
      : resolveHistoryStudent({
          audience,
          sessionUserId,
          requestedStudentId,
          allowedStudentIds: roster.map((student) => student.id),
        });
  const blocked = decision.blocked && pickedId == null;
  const studentId = blocked ? null : audience === 'student' ? decision.studentId : (pickedId ?? decision.studentId);

  useEffect(() => {
    setStatus('');
    setSeverity('');
    setPeriodId('');
    setPeriodOptions([]);
    setHistory(null);
  }, [studentId]);

  useEffect(() => {
    if (!rosterReady || blocked || studentId == null) return;
    let active = true;
    setLoading(true);
    setError(null);
    void disciplineApi
      .getStudentHistory(studentId, {
        status: (status || undefined) as DisciplinaryCaseStatus | undefined,
        severity: (severity || undefined) as InfractionSeverity | undefined,
        academicPeriodId: periodId ? Number(periodId) : undefined,
      })
      .then((next) => {
        if (!active) return;
        setHistory(next);
        if (!periodId) setPeriodOptions(next.periods);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el historial.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [rosterReady, blocked, studentId, status, severity, periodId]);

  const choices = mergeHistoryStudents(
    roster,
    searchHits,
    history ? [{ id: history.student.id, fullName: history.student.fullName }] : [],
  );

  const exportHistory = async (format: 'excel' | 'pdf') => {
    if (studentId == null) return;
    setExporting(format);
    setError(null);
    try {
      await disciplineApi.exportStudentHistory(studentId, format, {
        status: (status || undefined) as DisciplinaryCaseStatus | undefined,
        severity: (severity || undefined) as InfractionSeverity | undefined,
        academicPeriodId: periodId ? Number(periodId) : undefined,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo exportar el historial.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <section className={styles.panel}>
      {audience !== 'student' ? (
        <div className={styles.filters}>
          {canSearchStudents ? (
            <label>
              Buscar estudiante
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre o cédula"
              />
            </label>
          ) : null}
          <label>
            Estudiante
            <Select
              value={studentId ?? ''}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPickedId(Number.isFinite(next) && next > 0 ? next : null);
              }}
            >
              <option value="">Seleccione</option>
              {choices.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </Select>
          </label>
        </div>
      ) : null}

      {studentId != null && !blocked ? (
        <div className={styles.filters}>
          <label>
            Período
            <Select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
              <option value="">Todos</option>
              {periodOptions.map((period) => (
                <option key={period.academicPeriodId} value={period.academicPeriodId}>
                  {period.periodName}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Estado
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              {STATUSES.map((code) => (
                <option key={code} value={code}>
                  {STATUS_LABELS[code]}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Gravedad
            <Select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option value="">Todas</option>
              {SEVERITY_ORDER.map((code) => (
                <option key={code} value={code}>
                  {SEVERITY_LABELS[code]}
                </option>
              ))}
            </Select>
          </label>
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}
      {blocked ? (
        <Alert>Solo puede consultar el historial de sus representados.</Alert>
      ) : null}
      {!rosterReady || loading ? <p className={styles.muted}>Cargando historial…</p> : null}
      {rosterReady && !blocked && studentId == null ? (
        <EmptyState
          description="Elija un estudiante para ver su nota de conducta y sus expedientes."
          icon={GraduationCap}
          title="Historial disciplinario"
        />
      ) : null}
      {history && !loading ? (
        <div className={styles.stack}>
          <header className={styles.student}>
            <h2>{history.student.fullName}</h2>
            <p>{history.student.nationalId}</p>
            {canExport ? (
              <div className={styles.exports}>
                <Button
                  disabled={exporting != null}
                  onClick={() => void exportHistory('excel')}
                  type="button"
                  variant="secondary"
                >
                  Excel
                </Button>
                <Button
                  disabled={exporting != null}
                  onClick={() => void exportHistory('pdf')}
                  type="button"
                  variant="secondary"
                >
                  PDF
                </Button>
              </div>
            ) : null}
          </header>
          {history.periods.length === 0 ? (
            <EmptyState
              description="Sin expedientes en este filtro. La nota de conducta parte de 100."
              icon={GraduationCap}
              title="Sin rebajos"
            />
          ) : (
            history.periods.map((period) => (
              <article key={period.academicPeriodId} className={styles.period}>
                <header className={styles.periodHead}>
                  <div>
                    <h3>{period.periodName}</h3>
                    <p>Rebajo aplicado: {period.appliedDeduction} puntos</p>
                  </div>
                  <p className={styles.grade}>
                    <span>Nota de conducta</span>
                    <strong>{period.conductGrade}</strong>
                  </p>
                </header>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Expediente</th>
                      <th>Falta</th>
                      <th>Estado</th>
                      <th>Gravedad</th>
                      <th>Rebajo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {period.cases.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {audience === 'student' ? (
                            <strong>{item.caseNumber}</strong>
                          ) : (
                            <Link to={disciplineCasePath(item.id)}>{item.caseNumber}</Link>
                          )}
                          <span>
                            {item.occurredAt ? formatShortDate(item.occurredAt.slice(0, 10)) : 'Sin fecha'}
                          </span>
                        </td>
                        <td>{item.infractionName}</td>
                        <td>
                          <Badge tone={STATUS_TONES[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                        </td>
                        <td>
                          <Badge tone={SEVERITY_TONES[item.severity]}>{item.severityLabel}</Badge>
                        </td>
                        <td>
                          <Badge tone={DEDUCTION_TONE[item.deductionState]}>{item.deductionLabel}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
