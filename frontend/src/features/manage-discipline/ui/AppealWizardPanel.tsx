import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import {
  APPEAL_CENTER_COPY,
  APPEAL_KIND_LABELS,
  type AppealDraft,
  type AppealWizardStep,
  buildAppealPreview,
  canConfirmAppeal,
  canUseSubsidiary,
  createOnceGuard,
  draftFromEligible,
  submitAppealDraft,
  validateAppealDraft,
} from '../model/appealCenter';
import { DISCIPLINE_APPEALS_PATH, disciplineCasePath } from '../model/disciplineRouting';
import type { EligibleDisciplinaryCase } from '../model/types';
import styles from './AppealsCenter.module.css';

const STEPS: AppealWizardStep[] = ['select', 'draft', 'preview', 'done'];
const STEP_LABELS: Record<AppealWizardStep, string> = {
  select: 'Expediente',
  draft: 'Fundamento',
  preview: 'Vista previa',
  done: 'Confirmación',
};

export const AppealWizardPanel = () => {
  const [step, setStep] = useState<AppealWizardStep>('select');
  const [eligible, setEligible] = useState<EligibleDisciplinaryCase[]>([]);
  const [draft, setDraft] = useState<AppealDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const navigate = useNavigate();
  const once = useMemo(() => createOnceGuard(), []);

  useEffect(() => {
    let active = true;
    void disciplineApi
      .listEligibleAppeals()
      .then((next) => {
        if (!active) return;
        setEligible(next.data);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los expedientes elegibles.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const preview = draft ? buildAppealPreview(draft) : null;
  const confirmEnabled = canConfirmAppeal({
    step,
    draft,
    eligibleCount: eligible.length,
    pending,
  });

  const goDraft = () => {
    const problem = draft ? null : 'Seleccione un expediente elegible.';
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep('draft');
  };

  const goPreview = () => {
    const problem = validateAppealDraft(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep('preview');
  };

  const confirm = () => {
    if (!draft || !confirmEnabled) return;
    setError(null);
    setPending(true);
    void once(() => submitAppealDraft(draft, disciplineApi))
      .then((saved) => {
        if (!saved) return;
        setSubmittedId(saved.id);
        setStep('done');
      })
      .catch((reason: unknown) => {
        setError(reason instanceof DisciplineApiError || reason instanceof Error ? reason.message : 'No se pudo interponer el recurso.');
      })
      .finally(() => setPending(false));
  };

  return (
    <section className={styles.wizard}>
      <ol className={styles.steps}>
        {STEPS.map((id) => (
          <li key={id} className={id === step ? styles.current : undefined}>
            {STEP_LABELS[id]}
          </li>
        ))}
      </ol>
      {error ? <Alert>{error}</Alert> : null}
      {loading ? <p className={styles.muted}>Buscando expedientes elegibles…</p> : null}

      {step === 'select' ? (
        <div className={styles.card}>
          <h2>Seleccione el expediente</h2>
          <p className={styles.muted}>{APPEAL_CENTER_COPY.selectHint}</p>
          {!loading && eligible.length === 0 ? <Alert>{APPEAL_CENTER_COPY.noEligible}</Alert> : null}
          <ul className={styles.choices}>
            {eligible.map((row) => {
              const selected = draft?.caseId === row.caseId;
              return (
                <li key={row.caseId}>
                  <button
                    type="button"
                    className={`${styles.choice} ${selected ? styles.selected : ''}`}
                    onClick={() => setDraft(draftFromEligible(row, draft?.body ?? '', draft?.subsidiary ?? false))}
                  >
                    <span>
                      <strong>{row.caseNumber}</strong>
                      <span>{row.studentFullName}</span>
                    </span>
                    <span>
                      {APPEAL_KIND_LABELS[row.kind]}
                      {row.dueOn ? ` · vence ${formatShortDate(row.dueOn)}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className={styles.actions}>
            <Button type="button" disabled={!draft} onClick={goDraft}>
              Continuar
            </Button>
            <Link to={portalPathForSession(DISCIPLINE_APPEALS_PATH)}>Volver al Centro</Link>
          </div>
        </div>
      ) : null}

      {step === 'draft' && draft ? (
        <div className={styles.card}>
          <h2>Fundamento del recurso</h2>
          <p className={styles.muted}>
            {draft.caseNumber} · {APPEAL_KIND_LABELS[draft.kind]} · {draft.studentFullName}
          </p>
          <p className={styles.muted}>{APPEAL_CENTER_COPY.bodyHint}</p>
          <label className={styles.field}>
            Fundamento
            <Textarea
              value={draft.body}
              maxLength={4000}
              rows={8}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
            />
          </label>
          {canUseSubsidiary(draft.kind) ? (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={draft.subsidiary}
                onChange={(event) => setDraft({ ...draft, subsidiary: event.target.checked })}
              />
              <span>Interponer también la apelación en subsidio si se rechaza la revocatoria.</span>
            </label>
          ) : (
            <p className={styles.muted}>Este expediente admite apelación ante Dirección. El subsidio no aplica.</p>
          )}
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => setStep('select')}>
              Atrás
            </Button>
            <Button type="button" onClick={goPreview}>
              Ver previa
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'preview' && draft && preview ? (
        <div className={styles.preview}>
          <h2>Vista previa</h2>
          <p className={styles.muted}>{APPEAL_CENTER_COPY.previewHint}</p>
          <dl>
            <dt>Expediente</dt>
            <dd>{preview.caseNumber}</dd>
            <dt>Estudiante</dt>
            <dd>{preview.studentFullName}</dd>
            <dt>Recurso</dt>
            <dd>{preview.subsidiaryLabel ?? preview.kindLabel}</dd>
            <dt>Plazo</dt>
            <dd>{preview.dueOn ? formatShortDate(preview.dueOn) : 'Según el reloj del expediente'}</dd>
            <dt>Fundamento</dt>
            <dd>
              <pre>{preview.body}</pre>
            </dd>
          </dl>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => setStep('draft')}>
              Corregir
            </Button>
            <Button
              type="button"
              className={styles.confirmSubmit}
              data-testid="confirm-appeal-submit"
              disabled={!confirmEnabled}
              onClick={confirm}
            >
              {pending ? 'Enviando…' : 'Confirmar envío'}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'done' && draft ? (
        <div className={styles.confirm}>
          <h2>Recurso presentado</h2>
          <p>
            El recurso quedó registrado en el expediente <strong>{draft.caseNumber}</strong>
            {submittedId ? ` (recurso ${submittedId})` : ''}.
          </p>
          <p className={styles.muted}>
            Tipo: {preview?.subsidiaryLabel ?? APPEAL_KIND_LABELS[draft.kind]}.
            {draft.dueOn
              ? ` El plazo vigente del expediente vence el ${formatShortDate(draft.dueOn)}.`
              : ' El plazo sigue el reloj del expediente.'}
          </p>
          <div className={styles.actions}>
            <Button type="button" onClick={() => navigate(portalPathForSession(disciplineCasePath(draft.caseId)))}>
              Abrir expediente
            </Button>
            <Link to={portalPathForSession(DISCIPLINE_APPEALS_PATH)}>Volver al Centro</Link>
          </div>
        </div>
      ) : null}
    </section>
  );
};
