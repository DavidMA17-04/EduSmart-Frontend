import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User,
} from 'lucide-react';
import { authApi } from '@/features/auth';
import {
  isValidEmail,
  useVerificationActions,
} from '@/features/auth/model/useVerificationActions';
import { VERIFICATION_UI } from '@/pages/verify-account/model/verificationUi.constants';
import { OtpCodeInput } from '@/pages/verify-account/ui/OtpCodeInput';
import {
  AUTH_LOGIN_REASON,
  AuthLoginError,
  getRememberedIdentifier,
  getRememberMePreference,
} from '@/shared/auth';
import { Button, Checkbox, Input } from '@/shared/ui';
import { runAppEnterTransition } from '@/shared/motion/runAppEnterTransition';
import { AnimatedStep } from './AnimatedStep';
import { RollingTextLabel } from './RollingTextLabel';
import loginStyles from './LoginPage.module.css';
import styles from './LoginFlow.module.css';

type FlowStep =
  | 'email'
  | 'password'
  | 'recoverPassword'
  | 'recoverSent'
  | 'verifyPrompt'
  | 'otp'
  | 'verified';

const RECOVER_SENT_COPY =
  'Si existe una cuenta asociada a ese correo, recibirás las instrucciones para restablecer tu contraseña.';

/** UX-only resend cooldown for recover; backend does not expose a rate-limit signal. */
const RECOVER_RESEND_COOLDOWN_MS = 60_000;

type LoginFlowProps = {
  resetDone?: boolean;
};

export const LoginFlow = ({ resetDone = false }: LoginFlowProps) => {
  const navigate = useNavigate();
  const otpErrorId = useId();
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailForVerifyRef = useRef<HTMLInputElement>(null);
  const recoverEmailRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<FlowStep>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyEmailError, setVerifyEmailError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [otpFocusReady, setOtpFocusReady] = useState(false);

  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverEmailError, setRecoverEmailError] = useState<string | null>(null);
  const [isSendingRecover, setIsSendingRecover] = useState(false);
  const [editingRecoverEmail, setEditingRecoverEmail] = useState(false);
  const [recoverResendAvailableAt, setRecoverResendAvailableAt] = useState(0);
  const [recoverNowMs, setRecoverNowMs] = useState(() => Date.now());

  const verification = useVerificationActions();

  useEffect(() => {
    if (recoverResendAvailableAt <= Date.now()) return;
    const id = window.setInterval(() => setRecoverNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [recoverResendAvailableAt]);

  const recoverResendSecondsLeft = Math.max(
    0,
    Math.ceil((recoverResendAvailableAt - recoverNowMs) / 1000),
  );
  const canResendRecover = recoverResendSecondsLeft === 0 && !isSendingRecover;

  useEffect(() => {
    const remembered = getRememberedIdentifier();
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(getRememberMePreference());
    }
  }, []);

  useEffect(() => {
    if (step === 'password') {
      const id = window.setTimeout(() => passwordRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    if (step === 'verifyPrompt' && !isValidEmail(identifier)) {
      const id = window.setTimeout(() => emailForVerifyRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    if (step === 'recoverPassword' && (!isValidEmail(identifier) || editingRecoverEmail)) {
      const id = window.setTimeout(() => recoverEmailRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [step, identifier, editingRecoverEmail]);

  useEffect(() => {
    if (step !== 'otp') {
      setOtpFocusReady(false);
      return;
    }
    const id = window.setTimeout(() => setOtpFocusReady(true), 320);
    return () => window.clearTimeout(id);
  }, [step]);

  const codeComplete = code.length === VERIFICATION_UI.CODE_LENGTH;
  const needsRecoverEmailField = !isValidEmail(identifier);

  const resolveVerifyEmail = (): string => {
    const trimmedId = identifier.trim();
    if (isValidEmail(trimmedId)) return trimmedId.toLowerCase();
    return verifyEmail.trim().toLowerCase();
  };

  const resolveRecoverEmail = (): string => recoverEmail.trim().toLowerCase();

  const goToPassword = () => {
    setStep('password');
    setPassword('');
    setPasswordError(null);
    setFormError(null);
  };

  const openRecover = () => {
    setFormError(null);
    setRecoverEmailError(null);
    setEditingRecoverEmail(false);
    setPassword('');
    const trimmedId = identifier.trim();
    setRecoverEmail(isValidEmail(trimmedId) ? trimmedId.toLowerCase() : '');
    setStep('recoverPassword');
  };

  const startRecoverResendCooldown = () => {
    setRecoverResendAvailableAt(Date.now() + RECOVER_RESEND_COOLDOWN_MS);
    setRecoverNowMs(Date.now());
  };

  const backToPasswordFromRecover = () => {
    setRecoverEmailError(null);
    setFormError(null);
    setIsSendingRecover(false);
    setEditingRecoverEmail(false);
    setRecoverResendAvailableAt(0);
    goToPassword();
  };

  const onContinueFromEmail = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const trimmed = identifier.trim();
    if (!trimmed) {
      setIdentifierError('Este campo es obligatorio.');
      return;
    }
    setIdentifierError(null);
    goToPassword();
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    const nextPasswordError = password ? null : 'La contraseña es obligatoria.';
    setPasswordError(nextPasswordError);
    if (nextPasswordError) return;

    setIsSubmitting(true);
    try {
      const result = await authApi.login(identifier, password, rememberMe);
      setPassword('');
      const destination = result.user.mustChangePassword ? '/admin/settings' : '/admin';
      await runAppEnterTransition(() => {
        navigate(destination, { replace: true });
      });
    } catch (loginError) {
      if (loginError instanceof AuthLoginError) {
        if (
          loginError.status === 401 &&
          loginError.reason === AUTH_LOGIN_REASON.ACCOUNT_PENDING
        ) {
          setPassword('');
          const emailGuess = isValidEmail(identifier) ? identifier.trim().toLowerCase() : '';
          setVerifyEmail(emailGuess);
          setVerifyEmailError(null);
          setCode('');
          setOtpError(null);
          setInfoMessage(null);
          setStep('verifyPrompt');
        } else {
          setFormError(loginError.message);
        }
      } else {
        setFormError('No se pudo conectar con el servidor. Verifique que el backend esté activo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSendCode = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setVerifyEmailError(null);
    setOtpError(null);

    const email = resolveVerifyEmail();
    if (!email) {
      setVerifyEmailError('Indique el correo institucional de la cuenta.');
      return;
    }
    if (!isValidEmail(email)) {
      setVerifyEmailError('El formato de correo no es válido.');
      return;
    }

    try {
      const message = await verification.sendCode(email);
      setVerifyEmail(email);
      setInfoMessage(message);
      setCode('');
      setStep('otp');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo enviar el código.');
    }
  };

  const onVerify = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setOtpError(null);
    if (!codeComplete) {
      setOtpError('Ingrese el código de 6 dígitos.');
      return;
    }
    try {
      await verification.verifyCode(resolveVerifyEmail(), code);
      setPassword('');
      setCode('');
      setStep('verified');
    } catch (error) {
      setOtpError(
        error instanceof Error
          ? error.message
          : 'No se pudo verificar la cuenta. Revise el código o solicite uno nuevo.',
      );
    }
  };

  const onResend = async () => {
    if (!verification.canResend) return;
    setFormError(null);
    setOtpError(null);
    try {
      const message = await verification.resendCode(resolveVerifyEmail());
      setInfoMessage(message);
      setCode('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo reenviar el código.');
    }
  };

  const onSendRecover = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isSendingRecover) return;
    if (step === 'recoverSent' && !canResendRecover) return;

    setFormError(null);
    setRecoverEmailError(null);

    const email = resolveRecoverEmail();
    if (!email) {
      setEditingRecoverEmail(true);
      setRecoverEmailError('Indique el correo institucional.');
      return;
    }
    if (!isValidEmail(email)) {
      setEditingRecoverEmail(true);
      setRecoverEmailError('El formato de correo no es válido.');
      return;
    }

    setIsSendingRecover(true);
    try {
      await authApi.forgotPassword(email);
      setRecoverEmail(email);
      startRecoverResendCooldown();
      setStep('recoverSent');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo enviar la solicitud.',
      );
    } finally {
      setIsSendingRecover(false);
    }
  };

  const needsVerifyEmailField = !isValidEmail(identifier);

  const showProgress = step === 'verifyPrompt' || step === 'otp' || step === 'verified';
  const progressPct =
    step === 'verified'
      ? 100
      : step === 'otp'
        ? 50 + (code.length / VERIFICATION_UI.CODE_LENGTH) * 50
        : step === 'verifyPrompt'
          ? 25
          : 0;
  const showVerifiedCheck = step === 'verified';

  return (
    <div className={`${styles.flow} ${showProgress ? styles.flowVerify : ''}`}>
      {showProgress ? (
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
      ) : null}

      <div className={loginStyles.cardBrand}>
        <h2>
          {step === 'recoverPassword' || step === 'recoverSent'
            ? 'Recuperar contraseña'
            : 'Iniciar sesión'}
        </h2>
        <p>Cuenta institucional CTP Hojancha</p>
      </div>

      <AnimatedStep stepKey={step}>
        {step === 'email' ? (
          <form className={styles.stepForm} onSubmit={onContinueFromEmail} noValidate>
            <label className={loginStyles.field}>
              Correo o identificación
              <span className={`${loginStyles.inputWrap} ${identifierError ? loginStyles.inputInvalid : ''}`}>
                <User aria-hidden="true" className={loginStyles.inputIcon} size={16} />
                <Input
                  autoComplete="username"
                  autoFocus
                  className={loginStyles.input}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    if (identifierError) setIdentifierError(null);
                  }}
                  placeholder="usuario@ctphojancha.ed.cr o cédula"
                  type="text"
                  value={identifier}
                />
              </span>
              {identifierError ? <span className={loginStyles.fieldError}>{identifierError}</span> : null}
            </label>

            {resetDone ? (
              <p className={loginStyles.formError} role="status">
                Contraseña restablecida. Continúe e inicie sesión con la nueva clave.
              </p>
            ) : null}

            <Button className={loginStyles.submit} type="submit">
              Continuar
            </Button>
          </form>
        ) : null}

        {step === 'password' ? (
          <form className={styles.stepForm} onSubmit={onLogin} noValidate>
            <div className={styles.chipRow}>
              <span className={styles.chipText}>{identifier.trim()}</span>
              <button
                className={styles.chipAction}
                onClick={() => {
                  setStep('email');
                  setPassword('');
                  setFormError(null);
                  setPasswordError(null);
                }}
                type="button"
              >
                Cambiar
              </button>
            </div>

            <label className={loginStyles.field}>
              Contraseña
              <span className={`${loginStyles.inputWrap} ${passwordError ? loginStyles.inputInvalid : ''}`}>
                <Lock aria-hidden="true" className={loginStyles.inputIcon} size={16} />
                <Input
                  ref={passwordRef}
                  autoComplete="current-password"
                  className={`${loginStyles.input} ${loginStyles.passwordInput}`}
                  minLength={8}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className={loginStyles.togglePassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
                </button>
              </span>
              {passwordError ? <span className={loginStyles.fieldError}>{passwordError}</span> : null}
            </label>

            <div className={loginStyles.row}>
              <label className={loginStyles.remember}>
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Recordarme
              </label>
              <button className={styles.forgotButton} onClick={openRecover} type="button">
                ¿Olvidó su contraseña?
              </button>
            </div>

            {formError ? (
              <p className={loginStyles.formError} role="alert">
                {formError}
              </p>
            ) : null}

            <Button
              aria-label={isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
              className={loginStyles.submit}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className={loginStyles.spinner} size={16} />
                  Ingresando…
                </>
              ) : (
                <>
                  <LogIn aria-hidden="true" size={16} />
                  <RollingTextLabel text="Iniciar sesión" />
                </>
              )}
            </Button>
          </form>
        ) : null}

        {step === 'recoverPassword' ? (
          <form className={styles.stepForm} onSubmit={onSendRecover} noValidate>
            <div className={styles.verifyIntro} role="status">
              <p className={styles.verifyLead}>
                {needsRecoverEmailField
                  ? 'Indique el correo institucional asociado a su cuenta. Si existe y está activa, recibirá un enlace para restablecer la contraseña.'
                  : 'Enviaremos un enlace a su correo institucional si la cuenta existe y está activa.'}
              </p>
            </div>

            {needsRecoverEmailField ? (
              <>
                <div className={styles.chipRow}>
                  <span className={styles.chipText}>{identifier.trim()}</span>
                  <button
                    className={styles.chipAction}
                    onClick={() => {
                      setStep('email');
                      setFormError(null);
                      setRecoverEmailError(null);
                    }}
                    type="button"
                  >
                    Cambiar
                  </button>
                </div>
                <label className={loginStyles.field}>
                  Correo institucional
                  <span
                    className={`${loginStyles.inputWrap} ${recoverEmailError ? loginStyles.inputInvalid : ''}`}
                  >
                    <Mail aria-hidden="true" className={loginStyles.inputIcon} size={16} />
                    <Input
                      ref={recoverEmailRef}
                      autoComplete="email"
                      className={loginStyles.input}
                      onChange={(event) => {
                        setRecoverEmail(event.target.value);
                        if (recoverEmailError) setRecoverEmailError(null);
                      }}
                      placeholder="usuario@ctphojancha.ed.cr"
                      type="email"
                      value={recoverEmail}
                    />
                  </span>
                  {recoverEmailError ? (
                    <span className={loginStyles.fieldError}>{recoverEmailError}</span>
                  ) : (
                    <span className={styles.hint}>
                      Ingresó una cédula; indique el correo de la cuenta para recuperar la contraseña.
                    </span>
                  )}
                </label>
              </>
            ) : editingRecoverEmail ? (
              <label className={loginStyles.field}>
                Correo institucional
                <span
                  className={`${loginStyles.inputWrap} ${recoverEmailError ? loginStyles.inputInvalid : ''}`}
                >
                  <Mail aria-hidden="true" className={loginStyles.inputIcon} size={16} />
                  <Input
                    ref={recoverEmailRef}
                    autoComplete="email"
                    className={loginStyles.input}
                    onChange={(event) => {
                      setRecoverEmail(event.target.value);
                      if (recoverEmailError) setRecoverEmailError(null);
                    }}
                    placeholder="usuario@ctphojancha.ed.cr"
                    type="email"
                    value={recoverEmail}
                  />
                </span>
                {recoverEmailError ? (
                  <span className={loginStyles.fieldError}>{recoverEmailError}</span>
                ) : null}
              </label>
            ) : (
              <div className={styles.chipRow}>
                <span className={styles.chipText}>{recoverEmail || identifier.trim()}</span>
                <button
                  className={styles.chipAction}
                  onClick={() => {
                    setRecoverEmailError(null);
                    setEditingRecoverEmail(true);
                  }}
                  type="button"
                >
                  Cambiar
                </button>
              </div>
            )}

            {formError ? (
              <p className={loginStyles.formError} role="alert">
                {formError}
              </p>
            ) : null}

            <Button className={loginStyles.submit} disabled={isSendingRecover} type="submit">
              {isSendingRecover ? (
                <Loader2 aria-hidden="true" className={loginStyles.spinner} size={16} />
              ) : null}
              {isSendingRecover ? 'Enviando…' : 'Enviar enlace'}
            </Button>

            <button className={styles.backLink} onClick={backToPasswordFromRecover} type="button">
              Volver
            </button>
          </form>
        ) : null}

        {step === 'recoverSent' ? (
          <div className={styles.stepForm}>
            <div className={styles.verifyIntro} role="status">
              <p className={styles.verifyTitle}>Revise su correo</p>
              <p className={styles.verifyLead}>{RECOVER_SENT_COPY}</p>
            </div>

            {formError ? (
              <p className={loginStyles.formError} role="alert">
                {formError}
              </p>
            ) : null}

            <Button
              className={loginStyles.submit}
              disabled={!canResendRecover}
              onClick={() => void onSendRecover()}
              type="button"
            >
              {isSendingRecover ? (
                <Loader2 aria-hidden="true" className={loginStyles.spinner} size={16} />
              ) : null}
              {isSendingRecover
                ? 'Enviando…'
                : recoverResendSecondsLeft > 0
                  ? `Enviar nuevamente en ${recoverResendSecondsLeft}s`
                  : 'Enviar nuevamente'}
            </Button>

            <button className={styles.backLink} onClick={backToPasswordFromRecover} type="button">
              Volver a iniciar sesión
            </button>
          </div>
        ) : null}

        {step === 'verifyPrompt' ? (
          <form className={styles.stepForm} onSubmit={onSendCode} noValidate>
            <div className={styles.chipRow}>
              <span className={styles.chipText}>{identifier.trim()}</span>
              <button
                className={styles.chipAction}
                onClick={() => {
                  setStep('email');
                  setFormError(null);
                }}
                type="button"
              >
                Cambiar
              </button>
            </div>

            <div className={styles.verifyIntro} role="status">
              <p className={styles.verifyTitle}>Tu cuenta requiere verificación</p>
              <p className={styles.verifyLead}>
                Enviaremos un código de {VERIFICATION_UI.CODE_LENGTH} dígitos a tu correo
                institucional. Válido por {VERIFICATION_UI.TTL_HINT_MINUTES} minutos.
              </p>
            </div>

            {needsVerifyEmailField ? (
              <label className={loginStyles.field}>
                Correo institucional
                <span
                  className={`${loginStyles.inputWrap} ${verifyEmailError ? loginStyles.inputInvalid : ''}`}
                >
                  <User aria-hidden="true" className={loginStyles.inputIcon} size={16} />
                  <Input
                    ref={emailForVerifyRef}
                    autoComplete="email"
                    className={loginStyles.input}
                    onChange={(event) => {
                      setVerifyEmail(event.target.value);
                      if (verifyEmailError) setVerifyEmailError(null);
                    }}
                    placeholder="usuario@ctphojancha.ed.cr"
                    type="email"
                    value={verifyEmail}
                  />
                </span>
                {verifyEmailError ? (
                  <span className={loginStyles.fieldError}>{verifyEmailError}</span>
                ) : (
                  <span className={styles.hint}>
                    Ingresó una cédula; indique el correo de la cuenta para recibir el código.
                  </span>
                )}
              </label>
            ) : (
              <p className={styles.hint}>
                El código se enviará a <strong>{identifier.trim()}</strong>.
              </p>
            )}

            {formError ? (
              <p className={loginStyles.formError} role="alert">
                {formError}
              </p>
            ) : null}

            <Button className={loginStyles.submit} disabled={verification.isSending} type="submit">
              {verification.isSending ? (
                <>
                  <Loader2 aria-hidden="true" className={loginStyles.spinner} size={16} />
                  Enviando…
                </>
              ) : (
                'Enviar código'
              )}
            </Button>

            <button
              className={styles.backLink}
              onClick={() => {
                setStep('password');
                setFormError(null);
              }}
              type="button"
            >
              Volver a contraseña
            </button>
          </form>
        ) : null}

        {step === 'otp' ? (
          <form className={styles.stepForm} onSubmit={onVerify} noValidate>
            <div className={styles.chipRow}>
              <span className={styles.chipText}>{resolveVerifyEmail()}</span>
              <button
                className={styles.chipAction}
                onClick={() => {
                  setStep('verifyPrompt');
                  setCode('');
                  setOtpError(null);
                }}
                type="button"
              >
                Cambiar
              </button>
            </div>

            <p className={styles.verifyLead}>
              Ingresa el código de {VERIFICATION_UI.CODE_LENGTH} dígitos.
            </p>

            {infoMessage ? (
              <p className={styles.info} role="status" aria-live="polite">
                {infoMessage}
              </p>
            ) : null}

            <div className={styles.otpBlock}>
              <span className={styles.otpLabel} id={`${otpErrorId}-label`}>
                Código de verificación
              </span>
              <OtpCodeInput
                aria-describedby={otpError ? otpErrorId : undefined}
                autoFocus={otpFocusReady}
                disabled={verification.isVerifying}
                hasError={Boolean(otpError)}
                value={code}
                onChange={(next) => {
                  setCode(next);
                  if (otpError) setOtpError(null);
                }}
              />
              <p className={styles.progressHint} aria-live="polite">
                {codeComplete
                  ? 'Código completo — pulsa verificar'
                  : `${code.length} de ${VERIFICATION_UI.CODE_LENGTH} dígitos`}
              </p>
              {otpError ? (
                <span className={styles.errorBanner} id={otpErrorId} role="alert" aria-live="assertive">
                  <AlertCircle aria-hidden size={16} strokeWidth={2.25} />
                  <span>{otpError}</span>
                </span>
              ) : null}
            </div>

            {formError ? (
              <p className={loginStyles.formError} role="alert">
                {formError}
              </p>
            ) : null}

            <div className={styles.otpActions}>
              <Button
                className={loginStyles.submit}
                disabled={!codeComplete || verification.isVerifying}
                type="submit"
              >
                {verification.isVerifying ? (
                  <>
                    <Loader2 aria-hidden="true" className={loginStyles.spinner} size={16} />
                    Verificando…
                  </>
                ) : (
                  'Verificar cuenta'
                )}
              </Button>
              <button
                className={styles.resendButton}
                disabled={!verification.canResend}
                onClick={() => void onResend()}
                type="button"
              >
                {verification.isResending
                  ? 'Reenviando…'
                  : verification.resendSecondsLeft > 0
                    ? `Reenviar en ${verification.resendSecondsLeft}s`
                    : 'Reenviar código'}
              </button>
            </div>
          </form>
        ) : null}

        {step === 'verified' ? (
          <div className={styles.verified}>
            <span className={styles.verifiedIcon} aria-hidden="true">
              <CheckCircle2 size={36} strokeWidth={2} />
            </span>
            <h3 className={styles.verifiedTitle}>Cuenta verificada</h3>
            <p className={styles.verifyLead}>
              Tu cuenta fue verificada correctamente. Continúa e inicia sesión con tu contraseña.
            </p>
            <Button
              className={loginStyles.submit}
              onClick={() => {
                setPassword('');
                setFormError(null);
                setStep('password');
              }}
              type="button"
            >
              Continuar
            </Button>
          </div>
        ) : null}
      </AnimatedStep>

      {step === 'email' || step === 'password' ? (
        <>
          <div className={loginStyles.divider}>
            <span>o continúa con</span>
          </div>

          <div className={loginStyles.sso}>
            <button disabled title="Próximamente" type="button">
              Microsoft 365
            </button>
            <button disabled title="Próximamente" type="button">
              Google
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};
