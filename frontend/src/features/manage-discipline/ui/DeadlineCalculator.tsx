import { CalendarClock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/shared/ui';
import { formatShortDate, todayIso } from '../model/businessDays';
import { buildDeadlineSchedule } from '../model/deadlineSchedule';
import styles from './DueProcessFlowPanel.module.css';

export const DeadlineCalculator = () => {
  const [incidentDate, setIncidentDate] = useState(todayIso);
  const schedule = useMemo(
    () => (incidentDate ? buildDeadlineSchedule(incidentDate) : null),
    [incidentDate],
  );

  return (
    <section aria-labelledby="calculator-title" className={styles.card}>
      <h2 className={styles.cardTitle} id="calculator-title">
        <CalendarClock aria-hidden="true" size={18} /> Calculadora de plazos
      </h2>
      <div className={styles.calculatorHead}>
        <label className={styles.calculatorField} htmlFor="incident-date">
          <span>Fecha del hecho</span>
          <Input
            id="incident-date"
            onChange={(event) => setIncidentDate(event.target.value)}
            type="date"
            value={incidentDate}
          />
        </label>
        <p className={styles.detail}>
          Peor caso: cada paso agota su plazo. Excluye sábados y domingos; los feriados se
          sumarán cuando el calendario institucional esté cargado.
        </p>
      </div>
      {schedule ? (
        <>
          <ol className={styles.timeline}>
            {schedule.steps.map((step) => (
              <li className={styles.timelineItem} key={step.order}>
                <span className={styles.timelineStep}>
                  {step.order}. {step.title}
                </span>
                <strong className={styles.timelineDate}>{formatShortDate(step.dueOn)}</strong>
                <span className={styles.detail}>+{step.days} días hábiles</span>
              </li>
            ))}
          </ol>
          <p className={styles.firmBy}>
            Sin recursos, el acto queda firme a más tardar el{' '}
            <strong>{formatShortDate(schedule.firmBy)}</strong>.
          </p>
        </>
      ) : null}
    </section>
  );
};
