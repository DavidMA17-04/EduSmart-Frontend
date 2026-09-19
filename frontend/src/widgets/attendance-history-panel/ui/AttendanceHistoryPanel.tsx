import { History, Loader2, RotateCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import type {
  AttendanceRegistrationMethod,
  AttendanceStatus,
} from '@/entities/attendance';
import {
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
  MANUAL: 'Manual',
  TOKEN: 'Token',
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

export const AttendanceHistoryPanel = () => {
  const model = useAttendanceHistoryPanel();

  return (
    <section className={styles.layout}>
      <DataTableShell
        toolbar={
          <DataToolbar
            filters={
              <div className={styles.filters}>
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
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Método</span>
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
                    <option value="MANUAL">Manual</option>
                    <option value="TOKEN">Token</option>
                  </Select>
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Estudiante</span>
                  <Input
                    aria-label="Buscar estudiante"
                    onChange={(e) => model.setSearch(e.target.value)}
                    placeholder="Nombre o cédula"
                    value={model.search}
                  />
                </label>
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
                  Limpiar filtros
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
              <Loader2 aria-hidden="true" size={16} /> Cargando historial…
            </p>
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRow} />
          </div>
        ) : null}

        {!model.isLoading && model.items.length === 0 ? (
          <EmptyState
            description="Prueba ajustando el rango de fechas, el grupo o la búsqueda."
            icon={Search}
            title="Sin registros de asistencia"
          />
        ) : null}

        {!model.isLoading && model.items.length > 0 ? (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Grupo</th>
                  <th>Asignatura</th>
                  <th>Docente</th>
                  <th>Estudiante</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {model.items.map((row) => (
                  <tr key={row.attendanceId}>
                    <td>
                      <div>{row.sessionDate}</div>
                      <div className={styles.studentId}>
                        {formatDateTime(row.startedAt)}
                      </div>
                    </td>
                    <td>{row.group.name}</td>
                    <td>{row.offering.name}</td>
                    <td>{row.teacher.fullName}</td>
                    <td>
                      <div className={styles.studentCell}>
                        <strong>{row.student.fullName}</strong>
                        <span className={styles.studentId}>
                          {row.student.nationalId}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge tone={STATUS_TONE[row.status]}>
                        {STATUS_LABEL[row.status]}
                      </Badge>
                    </td>
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
                      <Link
                        className={styles.linkButton}
                        to={ATTENDANCE_SESSION_PATH(row.sessionId)}
                      >
                        <History aria-hidden="true" size={14} />
                        Ver sesión
                      </Link>
                    </td>
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
              <p className={styles.muted}>{model.total} registro(s)</p>
            </div>
          </>
        ) : null}
      </DataTableShell>
    </section>
  );
};
