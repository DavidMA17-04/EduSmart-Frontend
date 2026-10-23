import { Gavel, Scale, ShieldCheck } from 'lucide-react';
import {
  DUE_PROCESS_GUARANTEES,
  DUE_PROCESS_STEPS,
  PROCESS_REMEDIES,
  totalDueProcessBusinessDays,
} from '../model/dueProcess';
import { DeadlineCalculator } from './DeadlineCalculator';
import { FormalCommunicationPreview } from './FormalCommunicationPreview';
import styles from './DueProcessFlowPanel.module.css';

export const DueProcessFlowPanel = () => (
  <div className={styles.panel}>
    <section aria-labelledby="tracks-title" className={styles.card}>
      <h2 className={styles.cardTitle} id="tracks-title">
        <Scale aria-hidden="true" size={18} /> Vía según la gravedad
      </h2>
      <div className={styles.tracks}>
        <article className={`${styles.track} ${styles.trackDirect}`}>
          <strong>Muy leve (−5) · Leve (−10)</strong>
          <span>
            Amonestación directa del docente con quien ocurrió la falta, con copia al encargado
            y al expediente.
          </span>
        </article>
        <article className={`${styles.track} ${styles.trackDue}`}>
          <strong>Grave (−20) · Muy grave (−35) · Gravísima (−50)</strong>
          <span>Debido proceso completo de seis pasos, conducido por el docente guía.</span>
        </article>
      </div>
    </section>

    <section aria-labelledby="steps-title" className={styles.card}>
      <h2 className={styles.cardTitle} id="steps-title">
        <Gavel aria-hidden="true" size={18} /> Debido proceso · Art. 150
        <span className={styles.total}>
          {totalDueProcessBusinessDays()} días hábiles hasta la resolución
        </span>
      </h2>
      <ol className={styles.steps}>
        {DUE_PROCESS_STEPS.map((step) => (
          <li className={styles.step} key={step.order}>
            <span aria-hidden="true" className={styles.stepNumber}>
              {step.order}
            </span>
            <div className={styles.stepBody}>
              <strong>{step.title}</strong>
              <span className={styles.owner}>{step.owner}</span>
              <span className={styles.detail}>{step.detail}</span>
            </div>
            <span className={styles.deadline}>
              {step.days > 0 ? `≤ ${step.days} días ${step.dayKind}` : 'Al resolver'}
            </span>
          </li>
        ))}
      </ol>
    </section>

    <DeadlineCalculator />

    <FormalCommunicationPreview />

    <div className={styles.columns}>
      <section aria-labelledby="remedies-title" className={styles.card}>
        <h2 className={styles.cardTitle} id="remedies-title">
          Recursos y medidas
        </h2>
        <ul className={styles.remedies}>
          {PROCESS_REMEDIES.map((remedy) => (
            <li className={styles.remedy} key={remedy.title}>
              <div className={styles.remedyHead}>
                <strong>{remedy.title}</strong>
                <span className={styles.deadline}>
                  {remedy.resolveDays == null
                    ? `≤ ${remedy.fileDays} días ${remedy.dayKind}`
                    : `${remedy.fileDays} + ${remedy.resolveDays} días ${remedy.dayKind}`}
                </span>
              </div>
              <span className={styles.owner}>{remedy.filedWith}</span>
              <span className={styles.detail}>{remedy.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guarantees-title" className={styles.card}>
        <h2 className={styles.cardTitle} id="guarantees-title">
          <ShieldCheck aria-hidden="true" size={18} /> Garantías obligatorias
        </h2>
        <ul className={styles.guarantees}>
          {DUE_PROCESS_GUARANTEES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={styles.warning}>
          Omitir la comunicación formal o sus cláusulas hace nulo el proceso.
        </p>
      </section>
    </div>
  </div>
);
