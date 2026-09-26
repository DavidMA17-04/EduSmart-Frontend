import { useCallback, useEffect, useState } from 'react';
import type {
  JustifiableAbsenceOption,
  JustificationListFilters,
  JustificationListItem,
  JustificationStatus,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import { attendanceApi } from '../api/attendanceApi';
import { JustificationStatusBadge } from './JustificationStatusBadge';
import { RequestJustificationModal } from './RequestJustificationModal';
import { ReviewJustificationModal } from './ReviewJustificationModal';
import { Button } from '@/shared/ui';
import { sessionHasPermission } from '@/shared/auth';
import { ATTENDANCE_PERMISSIONS } from '../model/attendanceRouting';
import styles from './JustificationsInboxPanel.module.css';

const PAGE_SIZE = 20;

/** Real API errors reach the UI; mocks never mask a failure (PBI-27 cierre). */
function formatJustificationsError(e: unknown): string {
  if (e instanceof HttpError) {
    if (e.status === 403) {
      return 'Sin permiso para esta operación. Verifique su rol.';
    }
    if (e.status === 400 || e.status === 409 || e.status === 422) {
      return e.message;
    }
    if (e.status >= 500) {
      return 'El servidor no pudo procesar la solicitud. Reintente.';
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return 'No se pudo completar la solicitud. Reintente.';
}

function parseOptionalId(raw: string): number | undefined {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isInteger(value) && value > 0
    ? value
    : undefined;
}

export function JustificationsInboxPanel() {
  const [filters, setFilters] = useState<JustificationListFilters>({
    status: '',
    q: '',
    dateFrom: '',
    dateTo: '',
  });
  const [studentFilter, setStudentFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<JustificationListItem[]>([]);
  const [absences, setAbsences] = useState<JustifiableAbsenceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<JustificationListItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const mockMode = attendanceApi.isJustificationsMockMode();
  const canReview = sessionHasPermission(ATTENDANCE_PERMISSIONS.review);
  const canJustify = sessionHasPermission(ATTENDANCE_PERMISSIONS.justify);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const studentUserId = canReview ? parseOptionalId(studentFilter) : undefined;
      const groupId = canReview ? parseOptionalId(groupFilter) : undefined;
      const [result, justifiable] = await Promise.all([
        attendanceApi.listJustifications({
          status: filters.status || undefined,
          q: filters.q || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          studentUserId,
          groupId,
          page,
          pageSize: PAGE_SIZE,
        }),
        attendanceApi.listJustifiableAbsences(
          studentUserId != null ? { studentUserId } : {},
        ),
      ]);
      setRows(result.items);
      setTotal(result.total);
      setAbsences(justifiable);
    } catch (e) {
      setError(formatJustificationsError(e));
    } finally {
      setLoading(false);
    }
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.q,
    filters.status,
    studentFilter,
    groupFilter,
    page,
    canReview,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const applyFiltersAndResetPage = (patch: Partial<JustificationListFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  return (
    <div className={styles.canvas}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <label>
              Estado
              <select
                value={filters.status ?? ''}
                onChange={(e) =>
                  applyFiltersAndResetPage({
                    status: e.target.value as JustificationStatus | '',
                  })
                }
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="APPROVED">Aprobada</option>
                <option value="REJECTED">Rechazada</option>
              </select>
            </label>
            <label>
              Buscar
              <input
                type="search"
                placeholder="Estudiante o sección"
                value={filters.q ?? ''}
                onChange={(e) =>
                  applyFiltersAndResetPage({ q: e.target.value })
                }
              />
            </label>
            <label>
              Desde
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) =>
                  applyFiltersAndResetPage({ dateFrom: e.target.value })
                }
              />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) =>
                  applyFiltersAndResetPage({ dateTo: e.target.value })
                }
              />
            </label>
            {canReview ? (
              <>
                <label>
                  ID estudiante
                  <input
                    type="number"
                    min={1}
                    placeholder="Todos"
                    value={studentFilter}
                    onChange={(e) => {
                      setStudentFilter(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
                <label>
                  ID sección
                  <input
                    type="number"
                    min={1}
                    placeholder="Todas"
                    value={groupFilter}
                    onChange={(e) => {
                      setGroupFilter(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
              </>
            ) : null}
          </div>
          <div className={styles.actions}>
            {mockMode ? (
              <span className={styles.mockChip}>
                Modo demo (mocks) — no usar en cierre QA
              </span>
            ) : null}
            {canJustify ? (
              <Button type="button" onClick={() => setRequestOpen(true)}>
                Nueva justificación
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}{' '}
            <Button type="button" variant="secondary" onClick={() => void reload()}>
              Reintentar
            </Button>
          </p>
        ) : null}
        {loading ? <p className={styles.muted}>Cargando…</p> : null}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estudiante</th>
                <th>Sección</th>
                <th>Materia</th>
                <th>Motivo</th>
                <th>Evidencias</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.sessionDate}</td>
                  <td>{row.student.fullName}</td>
                  <td>{row.group.name}</td>
                  <td>{row.offering.name}</td>
                  <td className={styles.reason}>{row.reason}</td>
                  <td>
                    {row.evidences.length === 0
                      ? '—'
                      : row.evidences.map((e) => (
                          <a
                            key={e.id}
                            className={styles.evidenceLink}
                            href={e.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {e.fileName}
                          </a>
                        ))}
                  </td>
                  <td>
                    <JustificationStatusBadge status={row.status} />
                  </td>
                  <td>
                    {canReview && row.status === 'PENDING' ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setReviewItem(row)}
                      >
                        Revisar
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.muted}>
                    No hay solicitudes con los filtros actuales.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.muted}>
            Página {page} de {totalPages} · {total} solicitudes
          </span>
          <div className={styles.paginationActions}>
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <RequestJustificationModal
        open={requestOpen}
        absences={absences}
        submitting={submitting}
        onClose={() => setRequestOpen(false)}
        onSubmit={async ({ attendanceId, reason, file }) => {
          setSubmitting(true);
          try {
            const created = await attendanceApi.createJustification({
              attendanceId,
              reason,
            });
            if (file) {
              await attendanceApi.uploadJustificationEvidence(created.id, file);
            }
            setRequestOpen(false);
            await reload();
          } catch (e) {
            setError(formatJustificationsError(e));
          } finally {
            setSubmitting(false);
          }
        }}
      />

      <ReviewJustificationModal
        open={Boolean(reviewItem)}
        item={reviewItem}
        submitting={submitting}
        onClose={() => setReviewItem(null)}
        onDecide={async (decision) => {
          if (!reviewItem) return;
          setSubmitting(true);
          try {
            await attendanceApi.reviewJustification(reviewItem.id, decision);
            setReviewItem(null);
            await reload();
          } catch (e) {
            setError(formatJustificationsError(e));
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
