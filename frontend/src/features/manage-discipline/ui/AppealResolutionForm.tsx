import { FormEvent, useState } from 'react';
import { Button, Select, Textarea } from '@/shared/ui';
import { validateLength } from '../model/caseStaffActions';
import { canOfferPartialAccept } from '../model/appealReview';
import { SEVERITY_LABELS, SEVERITY_ORDER } from '../model/severity';
import type { AppealKind, AppealOutcome, InfractionSeverity } from '../model/types';
import styles from './CaseDetailPanel.module.css';

type ResolutionAppeal = {
  id: number;
  kind?: AppealKind | string;
  outcome: AppealOutcome | string | null;
};

export function AppealResolutionForm({
  appeal,
  allowModify,
  currentSeverity,
  label,
  onSubmit,
  onChanged,
  onError,
}: {
  appeal: ResolutionAppeal;
  allowModify: boolean;
  currentSeverity: InfractionSeverity;
  label: string;
  onSubmit: (input: { outcome: string; reasoning: string; severity?: string }) => Promise<unknown>;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const kind = (appeal.kind === 'APPEAL' ? 'APPEAL' : 'REVOCATION') as AppealKind;
  const offerModify = allowModify && canOfferPartialAccept(kind);
  const [outcome, setOutcome] = useState(offerModify ? 'UPHOLD' : 'REVOKE');
  const [reasoning, setReasoning] = useState('');
  const [severity, setSeverity] = useState<InfractionSeverity>('MINOR');
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validateLength(reasoning, 20, 4000, 'La fundamentación');
    if (problem) {
      onError(problem);
      return;
    }
    if (!offerModify && outcome === 'MODIFY') {
      onError('La revocatoria se acoge o se rechaza');
      return;
    }
    setPending(true);
    onError(null);
    try {
      await onSubmit({
        outcome,
        reasoning: reasoning.trim(),
        severity: outcome === 'MODIFY' ? severity : undefined,
      });
      onChanged();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'No se pudo resolver el recurso.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <p className={styles.note}>{label}</p>
      <label>
        Resultado
        <Select value={outcome} onChange={(event) => setOutcome(event.target.value)}>
          <option value="REVOKE">Acoge</option>
          <option value="UPHOLD">Rechaza</option>
          {offerModify ? <option value="MODIFY">Acoge parcialmente</option> : null}
        </Select>
      </label>
      {offerModify && outcome === 'MODIFY' ? (
        <label>
          Nueva gravedad
          <Select value={severity} onChange={(event) => setSeverity(event.target.value as InfractionSeverity)}>
            {SEVERITY_ORDER.filter((code) => code !== currentSeverity).map((code) => (
              <option key={code} value={code}>
                {SEVERITY_LABELS[code]}
              </option>
            ))}
          </Select>
        </label>
      ) : null}
      <label>
        Fundamentación
        <Textarea rows={3} value={reasoning} onChange={(event) => setReasoning(event.target.value)} />
      </label>
      <Button type="submit" disabled={pending || appeal.outcome != null}>
        {label}
      </Button>
    </form>
  );
}
