import {
  Download,
  FileSpreadsheet,
  FileText,
  History,
  Loader2,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type {
  AttendanceHistoryItem,
  AttendanceRegistrationMethod,
  AttendanceStatus,
} from '@/entities/attendance';
import {
  ATTENDANCE_HOME_PATH,
  ATTENDANCE_REDEEM_PATH,
  ATTENDANCE_SESSION_PATH,
  useAttendanceHistoryPanel,
  type HistoryPageSize,
} from '@/features/manage-attendance';
import {
  Alert,
  Badge,
  Button,
  DataTableShell,
  DataToolbar,
  EmptyState,
  Input,
  Pagination,
  Select,
  Table,
} from '@/shared/ui';
import styles from './AttendanceHistoryPanel.module.css';

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Tarde',
  JUSTIFIED: 'Justificada',
};

const STATUS_TONE: Record<
  AttendanceStatus,
  'success' | 'danger' | 'warning' | 'neutral'
> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  JUSTIFIED: 'neutral',
};

const METHOD_LABEL: Record<AttendanceRegistrationMethod, string> = {
  MANUAL: 'Manual (Docente)',
  TOKEN: 'Token (Automático)',
};

function formatStatus(row: AttendanceHistoryItem): string {
  if (row.status === 'LATE' && row.lateMinutes != null) {
    return `Tarde ${row.lateMinutes} min.`;
  }
  return STATUS_LABEL[row.status];
}

function formatLesson(row: AttendanceHistoryItem): string {
  if (row.lessonNumber == null) return '—';
  if (row.lessonTotal != null) return `${row.lessonNumber}/${row.lessonTotal}`;
  return String(row.lessonNumber);
}

function formatSchedule(row: AttendanceHistoryItem): string {
  if (!row.scheduleStartTime || !row.scheduleEndTime) return '—';
  return `${row.scheduleStartTime} - ${row.scheduleEndTime}`;
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export const AttendanceHistoryPanel = () => {
  const model = useAttendanceHistoryPanel();
  const summary = model.summary;
  const presentPct =
    summary.total > 0
      ? Math.round((summary.present / summary.total) * 1000) / 10
      : 0;
  const latePct =
    summary.total > 0
      ? Math.round((summary.late / summary.total) * 1000) / 10
      : 0;
  const absentPct =
    summary.total > 0
      ? Math.round((summary.absent / summary.total) * 1000) / 10
      : 0;
  const justifiedPct =
    summary.total > 0
      ? Math.round((summary.justified / summary.total) * 1000) / 10
      : 0;

  return (
    <section className={styles.layout}>
      <div className={styles.main}>
        <DataTableShell
          toolbar={
            <DataToolbar
              filters={
                <div className={styles.filters}>
                  {!model.isStudentView ? null : (
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Curso / Materia</span>
                      <Select
                        aria-label="Filtrar por curso"
                        onChange={(e) =>
                          model.setTeachingAssignmentId(e.target.value)
                        }
                        value={model.teachingAssignmentId}
                      >
                        <option value="">Todos los cursos</option>
                        {model.offerings.map((o) => (
                          <option
                            key={o.teachingAssignmentId}
                            value={o.teachingAssignmentId}
                          >
                            {o.name}
                          </option>
                        ))}
                      </Select>
                    </label>
                  )}

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Desde</span>
                    <Input
                      aria-label="Fecha desde"
                      onChange={(e) => model.setStartDate(e.target.value)}
                      type="date"
                      value={model.startDate}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Hasta</span>
                    <Input
                      aria-label="Fecha hasta"
                      onChange={(e) => model.setEndDate(e.target.value)}
                      type="date"
                      value={model.endDate}
                    />
                  </label>

                  {!model.isStudentView ? (
                    <>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Grupo</span>
                        <Select
                          aria-label="Filtrar por grupo"
                          onChange={(e) => model.setGroupId(e.target.value)}
                          value={model.groupId}
                        >
                          <option value="">Todos</option>
                          {model.groups.map((g) => (
                            <option key={g.groupId} value={g.groupId}>
                              {g.name}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Asignatura</span>
                        <Select
                          aria-label="Filtrar por asignatura"
                          disabled={!model.groupId}
                          onChange={(e) =>
                            model.setTeachingAssignmentId(e.target.value)
                          }
                          value={model.teachingAssignmentId}
                        >
                          <option value="">Todas</option>
                          {model.offerings.map((o) => (
                            <option
                              key={o.teachingAssignmentId}
                              value={o.teachingAssignmentId}
                            >
                              {o.name}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Estado</span>
                        <Select
                          aria-label="Filtrar por estado"
                          onChange={(e) =>
                            model.setStatus(
                              e.target.value as '' | AttendanceStatus,
                            )
                          }
                          value={model.status}
                        >
                          <option value="">Todos</option>
                          <option value="PRESENT">Presente</option>
                          <option value="ABSENT">Ausente</option>
                          <option value="LATE">Tarde</option>
                          <option value="JUSTIFIED">Justificada</option>
                        </Select>
                      </label>
                    </>
                  ) : null}

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Tipo de registro</span>
                    <Select
                      aria-label="Filtrar por método"
                      onChange={(e) =>
                        model.setRegistrationMethod(
                          e.target.value as '' | AttendanceRegistrationMethod,
                        )
                      }
                      value={model.registrationMethod}
                    >
                      <option value="">Todos</option>
                      <option value="MANUAL">Manual (Docente)</option>
                      <option value="TOKEN">Token (Automático)</option>
                    </Select>
                  </label>

                  {!model.isStudentView ? (
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Estudiante</span>
                      <Input
                        aria-label="Buscar estudiante"
                        onChange={(e) => model.setSearch(e.target.value)}
                        placeholder="Nombre o cédula"
                        value={model.search}
                      />
                    </label>
                  ) : null}
                </div>
              }
              primaryAction={
                <div className={styles.toolbarActions}>
                  <Button
                    onClick={model.clearFilters}
                    type="button"
                    variant="secondary"
                  >
                    <RotateCcw aria-hidden="true" size={16} />
                    Limpiar
                  </Button>
                  <Button
                    disabled={model.isExporting || model.total === 0}
                    onClick={() => void model.exportHistory('excel')}
                    type="button"
                    variant="secondary"
                  >
                    {model.isExporting ? (
                      <Loader2 aria-hidden="true" className={styles.spin} size={16} />
                    ) : (
                      <FileSpreadsheet aria-hidden="true" size={16} />
                    )}
                    Excel
                  </Button>
                  <Button
                    disabled={model.isExporting || model.total === 0}
                    onClick={() => void model.exportHistory('pdf')}
                    type="button"
                  >
                    {model.isExporting ? (
                      <Loader2 aria-hidden="true" className={styles.spin} size={16} />
                    ) : (
                      <FileText aria-hidden="true" size={16} />
                    )}
                    Exportar PDF
                  </Button>
                </div>
              }
            />
          }
        >
          {model.error ? <Alert>{model.error}</Alert> : null}

          {model.isLoading ? (
            <div aria-busy="true" className={styles.skeleton}>
              <p className={styles.muted}>
                <Loader2 aria-hidden="true" className={styles.spin} size={16} />{' '}
                Cargando historial…
              </p>
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
            </div>
          ) : null}

          {!model.isLoading && model.items.length === 0 ? (
            <EmptyState
              description="Prueba ajustando el rango de fechas, el curso o el tipo de registro."
              icon={Search}
              title="Sin registros de asistencia"
            />
          ) : null}

          {!model.isLoading && model.items.length > 0 ? (
            <>
              <div className={styles.resultMeta}>
                <p className={styles.muted}>
                  Mostrando {model.total} registro
                  {model.total === 1 ? '' : 's'} encontrado
                  {model.total === 1 ? '' : 's'}
                </p>
                <span className={styles.exportHint}>
                  <Download aria-hidden="true" size={14} />
                  Exporta el resultado filtrado
                </span>
              </div>

              <Table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Curso / Materia</th>
                    <th>Lección</th>
                    <th>Horario</th>
                    <th>Tipo de registro</th>
                    <th>Estado</th>
                    <th>Registrado por</th>
                    {!model.isStudentView ? <th>Estudiante</th> : null}
                    {!model.isStudentView ? <th>Acciones</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {model.items.map((row) => (
                    <tr key={row.attendanceId}>
                      <td>{formatDate(row.sessionDate)}</td>
                      <td>
                        <div className={styles.studentCell}>
                          <strong>{row.offering.name}</strong>
                          <span className={styles.studentId}>
                            {row.offering.labelKind}
                          </span>
                        </div>
                      </td>
                      <td>{formatLesson(row)}</td>
                      <td>{formatSchedule(row)}</td>
                      <td>
                        <Badge
                          tone={
                            row.registrationMethod === 'TOKEN'
                              ? 'success'
                              : 'neutral'
                          }
                        >
                          {METHOD_LABEL[row.registrationMethod]}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={STATUS_TONE[row.status]}>
                          {formatStatus(row)}
                        </Badge>
                      </td>
                      <td>{row.registeredBy.fullName}</td>
                      {!model.isStudentView ? (
                        <td>
                          <div className={styles.studentCell}>
                            <strong>{row.student.fullName}</strong>
                            <span className={styles.studentId}>
                              {row.student.nationalId}
                            </span>
                          </div>
                        </td>
                      ) : null}
                      {!model.isStudentView ? (
                        <td>
                          <Link
                            className={styles.linkButton}
                            to={ATTENDANCE_SESSION_PATH(row.sessionId)}
                          >
                            <History aria-hidden="true" size={14} />
                            Ver sesión
                          </Link>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className={styles.footer}>
                <label className={styles.pageSize}>
                  Filas por página
                  <Select
                    aria-label="Filas por página"
                    onChange={(e) =>
                      model.setLimit(Number(e.target.value) as HistoryPageSize)
                    }
                    value={String(model.limit)}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </Select>
                </label>
                <Pagination
                  currentPage={model.page}
                  onPageChange={model.setPage}
                  totalPages={Math.max(model.totalPages, 1)}
                />
              </div>
            </>
          ) : null}
        </DataTableShell>
      </div>

      <aside className={styles.sidebar} aria-label="Resumen de asistencias">
        <article className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>Resumen de asistencias</h3>
          <div className={styles.donutWrap}>
            <div
              aria-hidden="true"
              className={styles.donut}
              style={{
                background: `conic-gradient(
                  #1f9d55 0 ${presentPct}%,
                  #e6a700 ${presentPct}% ${presentPct + latePct}%,
                  #d64545 ${presentPct + latePct}% ${presentPct + latePct + absentPct}%,
                  #6b5ce7 ${presentPct + latePct + absentPct}% ${presentPct + latePct + absentPct + justifiedPct}%,
                  #d9e2ef ${presentPct + latePct + absentPct + justifiedPct}% 100%
                )`,
              }}
            >
              <div className={styles.donutHole}>
                <strong>{summary.total}</strong>
                <span>Total</span>
              </div>
            </div>
            <ul className={styles.legend}>
              <li>
                <span className={`${styles.dot} ${styles.dotPresent}`} />
                Presentes: {summary.present} ({presentPct}%)
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotLate}`} />
                Tardes: {summary.late} ({latePct}%)
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotAbsent}`} />
                Ausentes: {summary.absent} ({absentPct}%)
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotJustified}`} />
                Justificadas: {summary.justified} ({justifiedPct}%)
              </li>
            </ul>
          </div>
        </article>

        <article className={styles.percentCard}>
          <p className={styles.percentLabel}>Porcentaje de asistencia</p>
          <p className={styles.percentValue}>
            {summary.attendancePercent}%
            <span> ({summary.band})</span>
          </p>
        </article>

        <article className={styles.infoCard}>
          <h3 className={styles.summaryTitle}>Información importante</h3>
          <p className={styles.muted}>
            El historial muestra todas las lecciones registradas. El tipo{' '}
            <strong>Token</strong> es automático; <strong>Manual</strong> lo
            registra el docente.
          </p>
        </article>

        <article className={styles.quickCard}>
          <h3 className={styles.summaryTitle}>Accesos rápidos</h3>
          <div className={styles.quickLinks}>
            {model.isStudentView ? (
              <Link className={styles.quickLink} to={ATTENDANCE_REDEEM_PATH}>
                Ingresar código de asistencia
              </Link>
            ) : (
              <Link className={styles.quickLink} to={ATTENDANCE_HOME_PATH}>
                Ir a tomar asistencia
              </Link>
            )}
          </div>
        </article>
      </aside>
    </section>
  );
};
