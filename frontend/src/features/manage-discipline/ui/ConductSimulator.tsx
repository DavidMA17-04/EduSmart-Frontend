import { Calculator, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Input } from '@/shared/ui';
import {
  CONDUCT_ALERT_THRESHOLD,
  CONDUCT_BASE_GRADE,
  computeConductGrade,
  type FirmCounts,
  totalDeduction,
} from '../model/conductGrade';
import type { InfractionSeverityRule } from '../model/types';
import styles from './InfractionCatalogPanel.module.css';

type Props = { rules: readonly InfractionSeverityRule[] };

export const ConductSimulator = ({ rules }: Props) => {
  const [counts, setCounts] = useState<FirmCounts>({});
  const deduction = useMemo(() => totalDeduction(counts, rules), [counts, rules]);
  const grade = useMemo(() => computeConductGrade(counts, rules), [counts, rules]);
  const alert = grade <= CONDUCT_ALERT_THRESHOLD && deduction > 0;

  if (rules.length === 0) return null;

  return (
    <section aria-labelledby="conduct-sim-title" className={styles.scale}>
      <header className={styles.simHeader}>
        <div className={styles.scaleHeader}>
          <h2 id="conduct-sim-title">
            <Calculator aria-hidden="true" size={16} /> Simulador de nota de conducta
          </h2>
          <p>
            Faltas firmes del estudiante en el período. Las faltas en trámite no descuentan
            (presunción de inocencia).
          </p>
        </div>
        <Button
          disabled={deduction === 0}
          onClick={() => setCounts({})}
          type="button"
          variant="secondary"
        >
          <RotateCcw aria-hidden="true" size={14} />
          Reiniciar
        </Button>
      </header>
      <div className={styles.simBody}>
        <div className={styles.simInputs}>
          {rules.map((rule) => (
            <label className={styles.field} htmlFor={`sim-${rule.severity}`} key={rule.severity}>
              <span className={styles.fieldLabel}>
                {rule.label} (−{rule.deduction})
              </span>
              <Input
                id={`sim-${rule.severity}`}
                min={0}
                onChange={(event) =>
                  setCounts({
                    ...counts,
                    [rule.severity]: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                type="number"
                value={counts[rule.severity] ?? 0}
              />
            </label>
          ))}
        </div>
        <div
          aria-live="polite"
          className={`${styles.simResult} ${alert ? styles.simResultAlert : ''}`}
        >
          <span className={styles.tileUnit}>Nota de conducta</span>
          <strong className={styles.simGrade}>{grade}</strong>
          <span className={styles.tileUnit}>
            {CONDUCT_BASE_GRADE} − {deduction} puntos
          </span>
          {alert ? (
            <span className={styles.simAlert}>
              Alerta: nota igual o menor a {CONDUCT_ALERT_THRESHOLD}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
};
