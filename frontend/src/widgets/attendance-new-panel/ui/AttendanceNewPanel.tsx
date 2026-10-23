import { BookOpen, CalendarClock, ClipboardPlus, Layers, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AttendanceCalendarException } from '@/entities/attendance';
import { attendanceApi } from '@/features/manage-attendance';
import { formatCalendarExceptionBanner } from '@/features/manage-attendance/model/calendarExceptionBanner';
import { formatAttendanceGroupOptionLabel } from '@/features/manage-attendance/model/createAttendanceSessionFlow';
import { useCreateAttendanceSessionFlow } from '@/features/manage-attendance/model/useCreateAttendanceSessionFlow';
import { OfferingCard } from '@/features/manage-attendance/ui/OfferingCard';
import { ScheduleSlotCard } from '@/features/manage-attendance/ui/ScheduleSlotCard';
import { Alert, Button, EmptyState, Select, useToast } from '@/shared/ui';
import styles from './AttendanceNewPanel.module.css';

export const AttendanceNewPanel = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const flow = useCreateAttendanceSessionFlow();
  const [calendarException, setCalendarException] =
    useState<AttendanceCalendarException | null>(null);

  useEffect(() => {
    let cancelled = false;
    void attendanceApi
      .getScheduleContext()
      .then((ctx) => {
        if (!cancelled) {
          setCalendarException(ctx.calendarException ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setCalendarException(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onStart = async () => {
    const result = await flow.startClass();
    if (!result) return;
    if (result.ok) {
      toast.push(
        flow.primaryLabel.includes('Ver')
          ? 'Abriendo sesión.'
          : flow.primaryLabel.includes('Continuar')
            ? 'Continuando clase.'
            : 'Clase iniciada.',
        'success',
      );
      navigate(result.path);
      return;
    }
    toast.push(result.error, 'error');
  };

  if (flow.groupsLoading) {
    return (
      <div aria-busy="true" className={styles.panel}>
        <div className={styles.loadingRow}>
          <Loader2 aria-hidden="true" className={styles.spinner} size={20} />
          <span>Cargando grupos…</span>
        </div>
      </div>
    );
  }

  if (flow.groupsError) {
    return (
      <div className={styles.panel}>
        <Alert>{flow.groupsError}</Alert>
        <div className={styles.actions}>
          <Button
            onClick={() => void flow.reloadGroups()}
            type="button"
            variant="secondary"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (flow.groups.length === 0) {
    return (
      <div className={styles.panel}>
        <EmptyState
          description="No encontramos grupos con asignaciones disponibles para registrar asistencia."
          icon={Layers}
          title="No tienes grupos disponibles"
        />
      </div>
    );
  }

  const selectorsDisabled = flow.creating;
  const exceptionBanner = formatCalendarExceptionBanner(calendarException);
  const detailsLoading = flow.scheduleLoading || flow.offeringsLoading;

  return (
    <div className={styles.panel}>
      {exceptionBanner ? <Alert>{exceptionBanner}</Alert> : null}

      <section aria-labelledby="attendance-step-group" className={styles.step}>
        <header className={styles.stepHeader}>
          <span aria-hidden="true" className={styles.stepIndex}>
            1
          </span>
          <div>
            <h2 id="attendance-step-group">Sección</h2>
            <p>Selecciona la sección con la que vas a trabajar.</p>
          </div>
        </header>
        <label className={styles.field} htmlFor="attendance-group-select">
          <span className={styles.fieldLabel}>Seleccionar sección</span>
          <Select
            disabled={selectorsDisabled}
            id="attendance-group-select"
            onChange={(event) => {
              const value = event.target.value;
              flow.selectGroup(value ? Number(value) : null);
            }}
            value={flow.selectedGroupId ?? ''}
          >
            <option value="">Seleccionar sección</option>
            {flow.groups.map((group) => (
              <option key={group.groupId} value={group.groupId}>
                {formatAttendanceGroupOptionLabel(group)}
              </option>
            ))}
          </Select>
        </label>
      </section>

      <section
        aria-labelledby="attendance-step-schedule"
        className={styles.step}
      >
        <header className={styles.stepHeader}>
          <span aria-hidden="true" className={styles.stepIndex}>
            2
          </span>
          <div>
            <h2 id="attendance-step-schedule">Horario de hoy</h2>
            <p>
              {flow.scheduleDate
                ? `Clases programadas para ${flow.scheduleDate}. Elige la clase a la que tomarás asistencia.`
                : 'Al elegir la sección verás las clases de hoy.'}
            </p>
          </div>
        </header>

        {flow.selectedGroupId == null ? (
          <p className={styles.hint}>Primero selecciona una sección.</p>
        ) : detailsLoading ? (
          <div aria-busy="true" className={styles.loadingRow}>
            <Loader2 aria-hidden="true" className={styles.spinner} size={18} />
            <span>Cargando horario…</span>
          </div>
        ) : flow.scheduleError && flow.occurrences.length === 0 ? (
          <div className={styles.errorBlock}>
            <Alert>{flow.scheduleError}</Alert>
            <Button
              disabled={selectorsDisabled}
              onClick={() => flow.retryGroupDetails()}
              type="button"
              variant="secondary"
            >
              Reintentar
            </Button>
          </div>
        ) : flow.occurrences.length === 0 ? (
          <EmptyState
            description="Hoy no hay bloques CLASS en el horario de esta sección (fin de semana, feriado o sin programación)."
            icon={CalendarClock}
            title="Sin clases en el horario de hoy"
          />
        ) : (
          <div
            aria-label="Clases del horario de hoy"
            className={styles.slotsList}
            role="group"
          >
            {flow.occurrences.map((occurrence) => (
              <ScheduleSlotCard
                action={flow.resolveSlotAction(occurrence)}
                disabled={selectorsDisabled}
                key={occurrence.anchorEntryId}
                occurrence={occurrence}
                onSelect={flow.selectScheduleSlot}
                selected={
                  !flow.manualMode &&
                  flow.selectedAnchorEntryId === occurrence.anchorEntryId
                }
              />
            ))}
          </div>
        )}
      </section>

      {flow.selectedGroupId != null && !detailsLoading && (
        <section
          aria-labelledby="attendance-step-manual"
          className={styles.step}
        >
          <header className={styles.stepHeader}>
            <span aria-hidden="true" className={styles.stepIndex}>
              3
            </span>
            <div>
              <h2 id="attendance-step-manual">Clase extraordinaria</h2>
              <p>
                Si no hay horario aplicable, inicia asistencia manual eligiendo
                la materia o taller.
              </p>
            </div>
          </header>

          {flow.offeringsError && flow.offerings.length === 0 ? (
            <Alert>{flow.offeringsError}</Alert>
          ) : flow.offerings.length === 0 ? (
            <EmptyState
              description="No hay asignaciones impartibles para esta sección."
              icon={BookOpen}
              title="Sin asignaciones"
            />
          ) : (
            <div
              aria-label="Asignaciones manuales"
              className={styles.offeringsGrid}
              role="group"
            >
              {flow.offerings.map((offering) => (
                <OfferingCard
                  disabled={selectorsDisabled}
                  key={offering.teachingAssignmentId}
                  offering={offering}
                  onSelect={flow.selectOffering}
                  selected={
                    flow.manualMode &&
                    flow.selectedTeachingAssignmentId ===
                      offering.teachingAssignmentId
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}

      {flow.createError ? <Alert>{flow.createError}</Alert> : null}

      <div className={styles.footer}>
        <Button
          disabled={!flow.canStart}
          onClick={() => void onStart()}
          type="button"
        >
          {flow.creating ? (
            <>
              <Loader2 aria-hidden="true" className={styles.spinner} size={16} />
              {flow.primaryLabel}
            </>
          ) : (
            <>
              <ClipboardPlus aria-hidden="true" size={16} />
              {flow.primaryLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
