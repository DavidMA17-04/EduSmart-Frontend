import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Loader2,
  Save,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ATTENDANCE_HOME_PATH,
  useAttendanceSession,
} from '@/features/manage-attendance';
import { formatFinalizeSummaryLines } from '@/features/manage-attendance/model/attendanceClose';
import { gradeLevelLabel } from '@/features/manage-attendance/model/createAttendanceSessionFlow';
import { RosterRow } from '@/features/manage-attendance/ui/RosterRow';
import { SessionHeader } from '@/features/manage-attendance/ui/SessionHeader';
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  useToast,
} from '@/shared/ui';
import styles from './AttendanceSessionPanel.module.css';

type AttendanceSessionPanelProps = {
  sessionId: number | null;
};

export const AttendanceSessionPanel = ({
  sessionId,
}: AttendanceSessionPanelProps) => {
  const toast = useToast();
  const model = useAttendanceSession(sessionId);

  const onSave = async () => {
    const result = await model.saveChanges();
    if (result.outcome === 'noop' || !result.message) return;
    if (result.outcome === 'saved') {
      toast.push(result.message, 'success');
      return;
    }
    if (result.outcome === 'saved_refresh_failed') {
      toast.push(result.message, 'info');
      return;
    }
    toast.push(result.message, 'error');
  };

  const onConfirmFinalize = async () => {
    const result = await model.confirmFinalize();
    if (result.outcome === 'noop' || !result.message) return;
    if (
      result.outcome === 'finalized' ||
      result.outcome === 'already_closed'
    ) {
      toast.push(result.message, 'success');
      return;
    }
    if (result.outcome === 'finalized_refresh_failed') {
      toast.push(result.message, 'info');
      return;
    }
    toast.push(result.message, 'error');
  };

  const onGenerateToken = async () => {
    const result = await model.generateToken();
    toast.push(result.message, result.ok ? 'success' : 'error');
  };

  const onCopyToken = async () => {
    const ok = await model.copySessionToken();
    toast.push(
      ok ? 'Código copiado al portapapeles.' : 'No se pudo copiar el código.',
      ok ? 'success' : 'error',
    );
  };

  const onMarkAllPresent = () => {
    model.markAllPresent();
    toast.push('Todos marcados como Presente (sin guardar).', 'info');
  };

  const onLoadRoster = async () => {
    const result = await model.reloadRoster();
    if (!result.message) return;
    toast.push(
      result.message,
      result.ok ? (result.count === 0 ? 'info' : 'success') : 'error',
    );
  };

  const onExport = async (format: 'pdf' | 'excel') => {
    const result = await model.exportSession(format);
    toast.push(result.message, result.ok ? 'success' : 'error');
  };

  if (sessionId == null) {
    return (
      <div className={styles.panel}>
        <EmptyState
          description="Revisa el enlace o vuelve al módulo de Asistencias."
          icon={Users}
          title="Sesión no válida"
        />
        <div className={styles.centeredAction}>
          <Link className={styles.linkButton} to={ATTENDANCE_HOME_PATH}>
            Volver a Asistencias
          </Link>
        </div>
      </div>
    );
  }

  if (model.loading) {
    return (
      <div aria-busy="true" className={styles.panel}>
        <div className={styles.loadingBlock}>
          <Loader2 aria-hidden="true" className={styles.spinner} size={22} />
          <span>Cargando sesión…</span>
        </div>
        <div aria-hidden="true" className={styles.skeletonList}>
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
        </div>
      </div>
    );
  }

  if (model.sessionError) {
    return (
      <div className={styles.panel}>
        <EmptyState
          description={
            model.sessionError.kind === 'not_found'
              ? 'Puede que el enlace sea incorrecto o la sesión ya no exista.'
              : model.sessionError.message
          }
          icon={Users}
          title={
            model.sessionError.kind === 'not_found'
              ? 'No encontramos esta sesión de asistencia.'
              : model.sessionError.kind === 'forbidden'
                ? 'Acceso restringido'
                : 'No se pudo cargar la sesión'
          }
        />
        <div className={styles.centeredAction}>
          <Link className={styles.linkButton} to={ATTENDANCE_HOME_PATH}>
            Volver a Asistencias
          </Link>
        </div>
      </div>
    );
  }

  if (!model.session) {
    return null;
  }

  const { summary, finalizeConfirm } = model;
  const showDirtyBanner =
    model.saveButton.visible &&
    (model.dirtyCount > 0 || model.saving || model.closing);

  return (
    <div className={styles.layout}>
      <SessionHeader session={model.session} />

      {showDirtyBanner ? (
        <p className={styles.dirtyBanner} role="status">
          {model.closing
            ? 'Finalizando clase…'
            : model.saving
              ? 'Guardando cambios…'
              : 'Hay cambios sin guardar.'}
        </p>
      ) : null}

      {model.saveError ? <Alert>{model.saveError}</Alert> : null}
      {model.closeError ? <Alert>{model.closeError}</Alert> : null}

      {model.refreshWarning ? (
        <div className={styles.refreshWarning}>
          <Alert>{model.refreshWarning}</Alert>
          <div className={styles.refreshActions}>
            <Button
              onClick={() => void model.reloadRoster()}
              type="button"
              variant="secondary"
            >
              Recargar lista
            </Button>
            <Button
              onClick={() => void model.reloadSessionMeta()}
              type="button"
              variant="secondary"
            >
              Recargar sesión
            </Button>
          </div>
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <label className={styles.searchField} htmlFor="attendance-roster-search">
          <span className={styles.srOnly}>Buscar estudiante</span>
          <Search aria-hidden="true" className={styles.searchIcon} size={16} />
          <Input
            id="attendance-roster-search"
            onChange={(event) => model.setSearchQuery(event.target.value)}
            placeholder="Buscar estudiante…"
            type="search"
            value={model.searchQuery}
          />
        </label>

        <div className={styles.toolbarActions}>
          <Button
            disabled={model.busy || model.rosterLoading}
            onClick={() => void onLoadRoster()}
            type="button"
            variant="secondary"
          >
            {model.rosterLoading ? (
              <Loader2
                aria-hidden="true"
                className={styles.spinner}
                size={16}
              />
            ) : (
              <Users aria-hidden="true" size={16} />
            )}
            {model.roster.length > 0
              ? 'Actualizar lista'
              : 'Cargar estudiantes'}
          </Button>

          {model.saveButton.visible ? (
            <Button
              disabled={!model.saveButton.enabled}
              onClick={() => void onSave()}
              type="button"
            >
              {model.saving ? (
                <Loader2
                  aria-hidden="true"
                  className={styles.spinner}
                  size={16}
                />
              ) : (
                <Save aria-hidden="true" size={16} />
              )}
              {model.saveButton.label}
            </Button>
          ) : null}

          {model.finalizeButton.visible ? (
            <Button
              disabled={!model.finalizeButton.enabled}
              onClick={model.openFinalizeDialog}
              type="button"
              variant="secondary"
            >
              {model.closing ? (
                <Loader2
                  aria-hidden="true"
                  className={styles.spinner}
                  size={16}
                />
              ) : (
                <CheckCircle2 aria-hidden="true" size={16} />
              )}
              {model.finalizeButton.label}
            </Button>
          ) : null}

          {model.canEdit && model.session.status === 'OPEN' ? (
            <Button
              disabled={model.busy || model.tokenBusy}
              onClick={() => void onGenerateToken()}
              type="button"
              variant="secondary"
            >
              {model.tokenBusy ? (
                <Loader2
                  aria-hidden="true"
                  className={styles.spinner}
                  size={16}
                />
              ) : (
                <KeyRound aria-hidden="true" size={16} />
              )}
              Generar código
            </Button>
          ) : null}

          <Button
            disabled={model.exportingFormat !== null || model.busy}
            onClick={() => void onExport('pdf')}
            type="button"
            variant="secondary"
          >
            {model.exportingFormat === 'pdf' ? (
              <Loader2 aria-hidden="true" className={styles.spinner} size={16} />
            ) : (
              <FileText aria-hidden="true" size={16} />
            )}
            Exportar PDF
          </Button>
          <Button
            disabled={model.exportingFormat !== null || model.busy}
            onClick={() => void onExport('excel')}
            type="button"
            variant="secondary"
          >
            {model.exportingFormat === 'excel' ? (
              <Loader2 aria-hidden="true" className={styles.spinner} size={16} />
            ) : (
              <FileSpreadsheet aria-hidden="true" size={16} />
            )}
            Exportar Excel
          </Button>
        </div>
      </div>

      {model.tokenError ? <Alert>{model.tokenError}</Alert> : null}

      {model.sessionToken ? (
        <div className={styles.tokenCard}>
          <div>
            <p className={styles.tokenLabel}>Código de asistencia</p>
            <p className={styles.tokenValue}>{model.sessionToken.token}</p>
            <p className={styles.tokenMeta}>
              Expira:{' '}
              {new Intl.DateTimeFormat('es-CR', {
                dateStyle: 'short',
                timeStyle: 'short',
              }).format(new Date(model.sessionToken.expiresAt))}
            </p>
            <p className={styles.tokenMeta}>
              Los estudiantes lo ingresan en el menú «Ingresar código». Tú puedes
              marcar estados de forma manual en la lista de abajo.
            </p>
          </div>
          <Button onClick={() => void onCopyToken()} type="button" variant="secondary">
            Copiar
          </Button>
        </div>
      ) : null}

      {model.rosterError ? (
        <div className={styles.rosterError}>
          <Alert>{model.rosterError}</Alert>
          <p className={styles.rosterErrorCopy}>
            No pudimos cargar los estudiantes.
          </p>
          <Button
            disabled={model.rosterLoading}
            onClick={() => void onLoadRoster()}
            type="button"
            variant="secondary"
          >
            {model.rosterLoading ? (
              <Loader2
                aria-hidden="true"
                className={styles.spinner}
                size={16}
              />
            ) : (
              <Users aria-hidden="true" size={16} />
            )}
            Reintentar
          </Button>
        </div>
      ) : model.roster.length === 0 ? (
        <EmptyState
          description="Carga la lista de estudiantes matriculados en este grupo para la fecha de la clase. Luego podrás marcar Presente, Ausente, Tardía o Justificada."
          icon={Users}
          title="Sin estudiantes cargados"
        >
          <Button
            disabled={model.rosterLoading || model.busy}
            onClick={() => void onLoadRoster()}
            type="button"
          >
            {model.rosterLoading ? (
              <Loader2
                aria-hidden="true"
                className={styles.spinner}
                size={16}
              />
            ) : (
              <Users aria-hidden="true" size={16} />
            )}
            Cargar estudiantes de la sección
          </Button>
        </EmptyState>
      ) : model.visibleRoster.length === 0 ? (
        <EmptyState
          description="Prueba con otro nombre o identificación."
          icon={Search}
          title="No encontramos estudiantes con esa búsqueda."
        />
      ) : (
        <>
          {!model.readOnly ? (
            <div className={styles.rosterBulkActions}>
              <Button
                disabled={model.controlsDisabled}
                onClick={onMarkAllPresent}
                type="button"
                variant="secondary"
              >
                <UserCheck aria-hidden="true" size={16} />
                Marcar todos como Presentes
              </Button>
            </div>
          ) : null}
          <div className={styles.rosterList}>
            {model.visibleRoster.map((student) => (
              <RosterRow
                dirty={model.isDirtyStudent(student.userId)}
                key={student.userId}
                onChange={(status) => model.setStatus(student.userId, status)}
                readOnly={model.controlsDisabled}
                status={model.draft[student.userId] ?? null}
                student={student}
              />
            ))}
          </div>
        </>
      )}

      {!model.rosterError && model.roster.length > 0 ? (
        <dl aria-label="Resumen de asistencia" className={styles.summary}>
          <div>
            <dt>Presentes</dt>
            <dd>{summary.present}</dd>
          </div>
          <div>
            <dt>Ausentes</dt>
            <dd>{summary.absent}</dd>
          </div>
          <div>
            <dt>Tardías</dt>
            <dd>{summary.late}</dd>
          </div>
          <div>
            <dt>Justificadas</dt>
            <dd>{summary.justified}</dd>
          </div>
          <div>
            <dt>Sin marcar</dt>
            <dd>{summary.unmarked}</dd>
          </div>
        </dl>
      ) : null}

      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel={finalizeConfirm.confirmLabel}
        icon={CheckCircle2}
        isOpen={model.finalizeOpen}
        isSubmitting={model.closing}
        message={
          <div className={styles.confirmBody}>
            <p className={styles.confirmMeta}>
              <strong>{model.session.offering.name}</strong>
              <span>
                Grupo {model.session.group.name} ·{' '}
                {gradeLevelLabel(model.session.group.gradeLevel)}
              </span>
              <span>{model.session.offering.labelKind}</span>
            </p>
            <ul className={styles.confirmSummary}>
              {formatFinalizeSummaryLines(summary).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p>{finalizeConfirm.primaryCopy}</p>
            {finalizeConfirm.dirtyWarning ? (
              <p className={styles.confirmWarn}>{finalizeConfirm.dirtyWarning}</p>
            ) : null}
            {finalizeConfirm.unmarkedWarning ? (
              <p className={styles.confirmWarn}>
                {finalizeConfirm.unmarkedWarning}
              </p>
            ) : null}
          </div>
        }
        onCancel={model.cancelFinalizeDialog}
        onConfirm={() => void onConfirmFinalize()}
        title="Finalizar clase"
        tone="warning"
      />
    </div>
  );
};
