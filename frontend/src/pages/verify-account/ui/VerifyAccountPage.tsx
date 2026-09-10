import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { authApi } from '@/features/auth';
import { Alert, Button, FeedbackCard, Input } from '@/shared/ui';
import { VERIFICATION_UI } from '../model/verificationUi.constants';
import { OtpCodeInput } from './OtpCodeInput';
import styles from './VerifyAccountPage.module.css';

type Step = 'email' | 'code' | 'completing' | 'success';

const SUCCESS_HOLD_MS = 4000;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function computeProgressPct(step: Step, codeLength: number): number {
  if (step === 'email') return 0;
  if (step === 'completing' || step === 'success') return 100;
  return 50 + (codeLength / VERIFICATION_UI.CODE_LENGTH) * 50;
}

export const VerifyAccountPage = () => {
  const navigate = useNavigate();
  const otpErrorId = useId();
  const infoId = useId();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [otpFocusReady, setOtpFocusReady] = useState(false);

  const onCodeStep = step === 'code' || step === 'completing';
  const locked = step === 'completing';

  useEffect(() => {
    if (resendAvailableAt <= Date.now()) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [resendAvailableAt]);

  useEffect(() => {
    if (step !== 'completing') return;
    const id = window.setTimeout(() => setStep('success'), SUCCESS_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step !== 'code') {
      setOtpFocusReady(false);
      return;
    }
    const id = window.setTimeout(() => setOtpFocusReady(true), 420);
    return () => window.clearTimeout(id);
  }, [step]);

  const resendSecondsLeft = Math.max(0, Math.ceil((resendAvailableAt - nowMs) / 1000));
  const canResend = resendSecondsLeft === 0 && !isResending && !isVerifying && !isSendingCode && step === 'code';
  const codeComplete = code.length === VERIFICATION_UI.CODE_LENGTH;
  const progressPct = computeProgressPct(step, code.length);
  const showVerifiedCheck = step === 'completing' || step === 'success';

  const canVerify = useMemo(
    () => step === 'code' && email.trim().length > 0 && codeComplete && !isVerifying,
    [step, email, codeComplete, isVerifying],
  );

  const startLocalCooldown = () => {
    setResendAvailableAt(Date.now() + VERIFICATION_UI.RESEND_COOLDOWN_MS);
    setNowMs(Date.now());
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 'email') {
      setFormError(null);
      setEmailError(null);
      setInfoMessage(null);

      const trimmed = email.trim().toLowerCase();
      if (!trimmed) {
        setEmailError('El correo es requerido.');
        return;
      }
      if (!isValidEmail(trimmed)) {
        setEmailError('El formato de correo no es válido.');
        return;
      }

      setIsSendingCode(true);
      try {
        const result = await authApi.resendVerification(trimmed);
        setEmail(trimmed);
        setInfoMessage(result.message);
        setCode('');
        setOtpError(null);
        startLocalCooldown();
        setStep('code');
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'No se pudo enviar el código.');
      } finally {
        setIsSendingCode(false);
      }
      return;
    }

    if (step !== 'code') return;

    setFormError(null);
    setOtpError(null);
    setInfoMessage(null);

    if (!codeComplete) {
      setOtpError('Ingrese el código de 6 dígitos.');
      return;
    }

    setIsVerifying(true);
    try {
      await authApi.verifyAccount(email.trim(), code);
      setStep('completing');
    } catch (error) {
      setOtpError(
        error instanceof Error
          ? error.message
          : 'No se pudo verificar la cuenta. Revise el código o solicite uno nuevo.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    if (!canResend) return;
    setFormError(null);
    setOtpError(null);
    setInfoMessage(null);
    setIsResending(true);
    try {
      const result = await authApi.resendVerification(email.trim());
      setInfoMessage(result.message);
      setCode('');
      startLocalCooldown();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo reenviar el código.');
    } finally {
      setIsResending(false);
    }
  };

  const onChangeEmail = () => {
    setStep('email');
    setCode('');
    setOtpError(null);
    setFormError(null);
    setInfoMessage(null);
  };

  if (step === 'success') {
    return (
      <section className={`${styles.page} ${styles.verifyPage}`}>
        <div className={styles.successEnter}>
          <FeedbackCard
            description="Tu correo fue verificado correctamente. Ya puedes iniciar sesión con tu correo y contraseña."
            primaryAction={{
              label: 'Ir a iniciar sesión',
              onClick: () => navigate('/login'),
            }}
            title="Cuenta verificada"
          />
        </div>
      </section>
    );
  }

  const leadText =
    step === 'email'
      ? `Te enviaremos un código de ${VERIFICATION_UI.CODE_LENGTH} dígitos a tu correo. Válido por ${VERIFICATION_UI.TTL_HINT_MINUTES} minutos.`
      : step === 'completing'
        ? 'Confirmando tu verificación…'
        : `Ingresa el código que enviamos a ${email}.`;

  return (
    <section className={`${styles.page} ${styles.verifyPage}`}>
      <div className={`${styles.card} ${styles.verifyCard}`}>
        <div
          aria-label={`Progreso de verificación: ${Math.round(progressPct)} por ciento`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progressPct)}
          className={styles.topProgress}
          role="progressbar"
        >
          <div className={styles.topProgressTrack}>
            <div
              className={`${styles.topProgressFill} ${showVerifiedCheck ? styles.topProgressFillDone : ''}`}
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>
          <span
            aria-hidden={!showVerifiedCheck}
            className={`${styles.topProgressCheck} ${showVerifiedCheck ? styles.topProgressCheckVisible : ''}`}
          >
            <CheckCircle2 size={20} strokeWidth={2.25} />
          </span>
        </div>

        <div className={styles.iconStage} aria-hidden="true">
          <span className={`${styles.iconLayer} ${!onCodeStep ? styles.iconLayerActive : ''}`}>
            <span className={styles.iconWrap}>
              <Mail size={28} />
            </span>
          </span>
          <span className={`${styles.iconLayer} ${onCodeStep ? styles.iconLayerActive : ''}`}>
            <span className={styles.iconWrap}>
              <ShieldCheck size={28} />
            </span>
          </span>
        </div>

        <h1 className={styles.title}>
          {step === 'completing' ? '¡Listo!' : 'Verifica tu cuenta'}
        </h1>
        <p className={styles.lead} key={leadText}>
          {leadText}
        </p>

        {formError ? <Alert>{formError}</Alert> : null}
        <div
          className={`${styles.infoSlot} ${infoMessage && step !== 'completing' ? styles.infoSlotOpen : ''}`}
        >
          <div className={styles.infoSlotInner}>
            {infoMessage && step !== 'completing' ? (
              <p className={styles.info} id={infoId} role="status" aria-live="polite">
                {infoMessage}
              </p>
            ) : null}
          </div>
        </div>

        <form className={`${styles.form} ${styles.verifyFlow}`} onSubmit={onSubmit} noValidate>
          {/* Email stage — collapses softly instead of unmounting the whole form */}
          <div
            aria-hidden={onCodeStep}
            className={`${styles.stage} ${!onCodeStep ? styles.stageOpen : ''}`}
          >
            <div className={styles.stageInner}>
              <div className={styles.emailField}>
                <label className={styles.emailFieldLabel} htmlFor="verify-account-email">
                  Correo institucional:
                </label>
                <Input
                  id="verify-account-email"
                  className={styles.emailFieldInput}
                  autoComplete="email"
                  autoFocus={!onCodeStep}
                  disabled={onCodeStep}
                  placeholder="usuario@ejemplo.com"
                  tabIndex={onCodeStep ? -1 : 0}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {emailError ? (
                  <span className={styles.errorBanner} role="alert">
                    <AlertCircle aria-hidden size={16} strokeWidth={2.25} />
                    <span>{emailError}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Code stage — expands in place */}
          <div
            aria-hidden={!onCodeStep}
            className={`${styles.stage} ${onCodeStep ? styles.stageOpen : ''}`}
          >
            <div className={styles.stageInner}>
              <div className={styles.emailChip}>
                <span className={styles.emailChipText}>{email}</span>
                {!locked ? (
                  <button className={styles.linkButton} onClick={onChangeEmail} type="button">
                    Cambiar correo
                  </button>
                ) : null}
              </div>

              <div className={styles.otpBlock}>
                <span className={styles.otpLabel} id={`${otpErrorId}-label`}>
                  Código de verificación
                </span>
                <OtpCodeInput
                  aria-describedby={otpError ? otpErrorId : undefined}
                  autoFocus={otpFocusReady && !locked}
                  disabled={locked || isVerifying || !onCodeStep}
                  hasError={Boolean(otpError)}
                  value={code}
                  onChange={(next) => {
                    setCode(next);
                    if (otpError) setOtpError(null);
                  }}
                />

                {!locked ? (
                  <p className={styles.progressHint} aria-live="polite">
                    {codeComplete
                      ? 'Código completo — pulsa verificar'
                      : `${code.length} de ${VERIFICATION_UI.CODE_LENGTH} dígitos`}
                  </p>
                ) : null}

                {otpError ? (
                  <span
                    className={styles.errorBanner}
                    id={otpErrorId}
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertCircle aria-hidden size={16} strokeWidth={2.25} />
                    <span>{otpError}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {!locked ? (
            <div
              className={`${styles.actions} ${styles.actionsMorph} ${
                onCodeStep ? styles.actionsSplit : styles.actionsCentered
              }`}
              style={{ transitionTimingFunction: EASE }}
            >
              <Button
                className={styles.primaryAction}
                disabled={onCodeStep ? !canVerify : isSendingCode}
                type="submit"
              >
                {onCodeStep ? (
                  isVerifying ? (
                    <>
                      <Loader2 className={styles.spin} size={16} aria-hidden="true" />
                      Verificando…
                    </>
                  ) : (
                    'Verificar cuenta'
                  )
                ) : isSendingCode ? (
                  <>
                    <Loader2 className={styles.spin} size={16} aria-hidden="true" />
                    Enviando…
                  </>
                ) : (
                  'Enviar código'
                )}
              </Button>

              <div
                aria-hidden={!onCodeStep}
                className={`${styles.resendSide} ${onCodeStep ? styles.resendSideVisible : ''}`}
              >
                <span className={styles.resendHint}>¿No recibiste el correo?</span>
                <button
                  className={styles.resendButton}
                  disabled={!canResend}
                  tabIndex={onCodeStep ? 0 : -1}
                  onClick={() => void onResend()}
                  type="button"
                >
                  {isResending
                    ? 'Reenviando…'
                    : resendSecondsLeft > 0
                      ? `Reenviar en ${resendSecondsLeft}s`
                      : 'Reenviar código'}
                </button>
              </div>
            </div>
          ) : null}
        </form>

        {step !== 'completing' ? (
          <p className={styles.footer}>
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
};
