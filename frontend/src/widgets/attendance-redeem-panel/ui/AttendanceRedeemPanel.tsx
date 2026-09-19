import { KeyRound, Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';
import {
  formatRedeemSuccessMessage,
  useRedeemAttendanceToken,
} from '@/features/manage-attendance';
import { Alert, Badge, Button, Input, useToast } from '@/shared/ui';
import styles from './AttendanceRedeemPanel.module.css';

export const AttendanceRedeemPanel = () => {
  const model = useRedeemAttendanceToken();
  const toast = useToast();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const outcome = await model.submit();
    if (outcome.ok) {
      toast.push(
        outcome.result.alreadyRedeemed
          ? formatRedeemSuccessMessage(outcome.result)
          : `Presente — Registrado por Token. ${outcome.result.offeringName} · ${outcome.result.groupName}`,
        'success',
      );
      return;
    }
    toast.push(outcome.error, 'error');
  };

  return (
    <div className={styles.layout}>
      <article className={styles.card}>
        <p className={styles.lead}>
          Ingresa el código que muestra tu docente en clase. Se registrará tu
          asistencia automáticamente como Presente.
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            aria-label="Código de asistencia"
            autoComplete="off"
            className={styles.codeInput}
            disabled={model.submitting}
            maxLength={16}
            onChange={(event) => model.onCodeChange(event.target.value)}
            placeholder="Ej. 3X6SCQG2"
            spellCheck={false}
            value={model.code}
          />
          <div className={styles.actions}>
            <Button disabled={!model.canSubmit} type="submit">
              {model.submitting ? (
                <Loader2 aria-hidden="true" className="spin" size={16} />
              ) : (
                <KeyRound aria-hidden="true" size={16} />
              )}
              Registrar asistencia
            </Button>
          </div>
        </form>

        {model.error ? <Alert>{model.error}</Alert> : null}

        {model.lastSuccess ? (
          <div className={styles.successCard} role="status">
            <p className={styles.successTitle}>
              {model.lastSuccess.alreadyRedeemed
                ? 'Ya registrado'
                : 'Asistencia confirmada'}
            </p>
            <p className={styles.successMeta}>
              {model.lastSuccess.offeringName} · {model.lastSuccess.groupName}
              {model.lastSuccess.sessionDate
                ? ` · ${model.lastSuccess.sessionDate}`
                : ''}
            </p>
            <Badge tone="success">Presente — Registrado por Token</Badge>
          </div>
        ) : null}
      </article>

      {model.recent.length > 0 ? (
        <section className={styles.recent} aria-labelledby="redeem-recent-title">
          <h2 className={styles.recentTitle} id="redeem-recent-title">
            Registros recientes
          </h2>
          <ul className={styles.recentList}>
            {model.recent.map((item) => (
              <li
                className={styles.recentItem}
                key={`${item.sessionDate}-${item.offeringName}-${item.groupName}`}
              >
                <div className={styles.recentLabel}>
                  <strong>
                    {item.offeringName} · {item.groupName}
                  </strong>
                  <span>{item.sessionDate}</span>
                </div>
                <Badge tone="success">Presente · Token</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};
