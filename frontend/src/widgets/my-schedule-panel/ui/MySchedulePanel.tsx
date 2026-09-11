import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, RefreshCw } from 'lucide-react';
import type { AttendanceScheduleOccurrence } from '@/entities/attendance';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import {
  ATTENDANCE_SESSION_PATH,
  attendanceApi,
  resolveSessionPathAfterCreate,
} from '@/features/manage-attendance';
import {
  formatSlotRange,
  nonClassSlotLabel,
  SCHEDULE_WEEKDAYS,
} from '@/features/manage-schedule';
import {
  buildFromSchedulePayload,
  humanizeFromScheduleError,
  MY_SCHEDULE_ATTENDANCE_COPY,
  MY_SCHEDULE_COPY,
  resolveMyScheduleAttendanceCta,
  resolveMyScheduleEntrySecondaryLabel,
  useMySchedulePanel,
  type MyScheduleAttendanceCta,
  type MyScheduleCardVariant,
} from '@/features/view-my-schedule';
import { useToast, Alert, Badge, EmptyState, SegmentedTabs, Select } from '@/shared/ui';
import styles from '@/widgets/schedule-panel/ui/SchedulePanel.module.css';

function slotHeaderLabel(slot: ScheduleTimeSlot): string {
  if (slot.slotType === 'BREAK' || slot.slotType === 'LUNCH') {
    return nonClassSlotLabel(slot.slotType, slot.name);
  }
  return formatSlotRange(slot.startTime, slot.endTime);
}

function ReadonlyEntryCard({
  entry,
  variant,
  cta,
  starting,
  onCta,
}: {
  entry: ScheduleEntry;
  variant: MyScheduleCardVariant;
  cta: MyScheduleAttendanceCta | null;
  starting: boolean;
  onCta: (cta: MyScheduleAttendanceCta) => void;
}) {
  const ta = entry.teachingAssignment;
  const secondaryLabel = resolveMyScheduleEntrySecondaryLabel(entry, variant);
  return (
    <article
      className={styles.entryCard}
      data-card-variant={variant}
      data-testid="my-schedule-entry-card"
      data-entry-id={entry.entryId}
    >
      <div className={styles.entryMain}>
        <strong className={styles.offeringName}>{ta.offering.name}</strong>
        <Badge tone="neutral">{ta.offering.labelKind}</Badge>
        <span className={styles.meta}>{secondaryLabel}</span>
        {cta?.badgeLabel ? (
          <span className={styles.meta} data-testid="my-schedule-attendance-badge">
            {cta.badgeLabel}
          </span>
        ) : null}
        {cta ? (
          <button
            className={styles.linkBtn}
            data-testid={`my-schedule-attendance-cta-${cta.kind}`}
            disabled={starting}
            onClick={() => onCta(cta)}
            type="button"
          >
            {starting && cta.kind === 'take' ? 'Iniciando…' : cta.label}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function ReadonlyClassCell({
  entries,
  variant,
  occurrenceByEntryId,
  canViewAttendance,
  canCreateAttendance,
  startingEntryId,
  onCta,
}: {
  entries: ScheduleEntry[];
  variant: MyScheduleCardVariant;
  occurrenceByEntryId: Map<number, AttendanceScheduleOccurrence>;
  canViewAttendance: boolean;
  canCreateAttendance: boolean;
  startingEntryId: number | null;
  onCta: (cta: MyScheduleAttendanceCta) => void;
}) {
  if (entries.length === 0) {
    return <span className={styles.emptyCell}>—</span>;
  }
  return (
    <div className={styles.entryStack}>
      {entries.map((entry) => {
        const cta = resolveMyScheduleAttendanceCta({
          entryId: entry.entryId,
          variant,
          canViewAttendance,
          canCreateAttendance,
          occurrence: occurrenceByEntryId.get(entry.entryId),
        });
        return (
          <ReadonlyEntryCard
            cta={cta}
            entry={entry}
            key={entry.entryId}
            onCta={onCta}
            starting={startingEntryId === entry.entryId}
            variant={variant}
          />
        );
      })}
    </div>
  );
}

export const MySchedulePanel = () => {
  const model = useMySchedulePanel();
  const navigate = useNavigate();
  const toast = useToast();
  const [startingEntryId, setStartingEntryId] = useState<number | null>(null);

  const dayTabs = SCHEDULE_WEEKDAYS.map((d) => ({
    id: String(d.dayOfWeek),
    label: d.label,
  }));

  const blockingError = model.catalogError || model.scheduleError;

  const cellProps = useMemo(
    () => ({
      variant: model.cardVariant,
      occurrenceByEntryId: model.occurrenceByEntryId,
      canViewAttendance: model.canViewAttendance,
      canCreateAttendance: model.canCreateAttendance,
      startingEntryId,
    }),
    [
      model.cardVariant,
      model.occurrenceByEntryId,
      model.canViewAttendance,
      model.canCreateAttendance,
      startingEntryId,
    ],
  );

  const handleCta = async (cta: MyScheduleAttendanceCta) => {
    if (cta.kind === 'continue' || cta.kind === 'view') {
      if (cta.sessionId != null) {
        navigate(ATTENDANCE_SESSION_PATH(cta.sessionId));
      }
      return;
    }

    if (cta.kind !== 'take' || cta.scheduleEntryId == null) return;
    const entryId = cta.scheduleEntryId;
    setStartingEntryId(entryId);
    try {
      const result = await attendanceApi.createAttendanceSessionFromSchedule(
        buildFromSchedulePayload(entryId),
      );
      navigate(resolveSessionPathAfterCreate(result));
      void model.reloadAttendanceContext();
    } catch (error) {
      toast.push(humanizeFromScheduleError(error), 'error');
    } finally {
      setStartingEntryId(null);
    }
  };

  return (
    <section className={styles.layout} data-testid="my-schedule-panel">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Select
            aria-label="Período académico"
            onChange={(e) => model.setPeriodId(e.target.value)}
            value={model.periodId}
          >
            <option value="">Período: seleccionar…</option>
            {model.periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.status === 'ACTIVE' ? ' (activo)' : ''}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {blockingError ? (
        <Alert>
          <div className={styles.toolbar}>
            <span>{blockingError}</span>
            <button
              className={styles.linkBtn}
              onClick={() => model.retry()}
              type="button"
            >
              <RefreshCw aria-hidden size={14} /> {MY_SCHEDULE_COPY.retryLabel}
            </button>
          </div>
        </Alert>
      ) : null}

      {!blockingError && model.attendanceContextError ? (
        <p className={styles.status} data-testid="my-schedule-attendance-context-error">
          {MY_SCHEDULE_ATTENDANCE_COPY.contextFailed}
        </p>
      ) : null}

      {model.catalogLoading || model.scheduleLoading ? (
        <p className={styles.status}>Cargando tu horario…</p>
      ) : null}

      {!model.catalogLoading &&
      !model.scheduleLoading &&
      !blockingError &&
      model.matrixSlots.length === 0 ? (
        <EmptyState
          description="Aún no hay bloques horarios para mostrar."
          icon={CalendarClock}
          title="No hay bloques horarios"
        />
      ) : null}

      {!model.scheduleLoading &&
      !blockingError &&
      model.matrixSlots.length > 0 ? (
        <>
          <div className={styles.mobileDayBar}>
            <SegmentedTabs
              aria-label="Día de la semana"
              items={dayTabs}
              onChange={(id) => model.setMobileDay(Number(id))}
              value={String(model.mobileDay)}
            />
          </div>

          <div className={styles.desktopMatrixWrap}>
            <table className={styles.matrix}>
              <thead>
                <tr>
                  <th className={styles.dayCol}>Día</th>
                  {model.matrixSlots.map((slot) => (
                    <th
                      className={
                        slot.slotType === 'CLASS'
                          ? styles.slotHead
                          : styles.slotHeadNeutral
                      }
                      key={slot.id}
                    >
                      <span className={styles.slotHeadPrimary}>
                        {slotHeaderLabel(slot)}
                      </span>
                      {slot.slotType === 'CLASS' && slot.name ? (
                        <span className={styles.slotHeadSecondary}>
                          {slot.name}
                          {!slot.isActive ? ' (inactivo)' : ''}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCHEDULE_WEEKDAYS.map((day) => (
                  <tr key={day.dayOfWeek}>
                    <th className={styles.dayCol} scope="row">
                      {day.label}
                    </th>
                    {model.matrixSlots.map((slot) => {
                      if (slot.slotType !== 'CLASS') {
                        return (
                          <td className={styles.neutralCell} key={slot.id}>
                            {nonClassSlotLabel(slot.slotType, slot.name)}
                          </td>
                        );
                      }
                      const cellEntries =
                        model.entriesByCell.get(`${day.dayOfWeek}:${slot.id}`) ??
                        [];
                      return (
                        <td className={styles.classCell} key={slot.id}>
                          <ReadonlyClassCell
                            {...cellProps}
                            entries={cellEntries}
                            onCta={handleCta}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileDayList}>
            <ul className={styles.slotList}>
              {model.matrixSlots.map((slot) => {
                if (slot.slotType !== 'CLASS') {
                  return (
                    <li className={styles.slotListNeutral} key={slot.id}>
                      <span className={styles.slotListTime}>
                        {nonClassSlotLabel(slot.slotType, slot.name)}
                      </span>
                      <span className={styles.meta}>
                        {formatSlotRange(slot.startTime, slot.endTime)}
                      </span>
                    </li>
                  );
                }
                const cellEntries =
                  model.entriesByCell.get(
                    `${model.mobileDay}:${slot.id}`,
                  ) ?? [];
                return (
                  <li className={styles.slotListItem} key={slot.id}>
                    <div className={styles.slotListTime}>
                      {formatSlotRange(slot.startTime, slot.endTime)}
                      {slot.name ? (
                        <span className={styles.meta}> · {slot.name}</span>
                      ) : null}
                      {!slot.isActive ? (
                        <span className={styles.meta}> · inactivo</span>
                      ) : null}
                    </div>
                    <ReadonlyClassCell
                      {...cellProps}
                      entries={cellEntries}
                      onCta={handleCta}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {model.isEmptySuccess ? (
            <p className={styles.emptyHint}>{MY_SCHEDULE_COPY.emptyDescription}</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
};
