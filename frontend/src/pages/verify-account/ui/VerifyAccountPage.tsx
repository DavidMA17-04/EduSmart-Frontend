import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { authApi } from '@/features/auth';
import { Alert, Button, FeedbackCard, Input } from '@/shared/ui';
import styles from './VerifyAccountPage.module.css';

export const VerifyAccountPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && /^\d{6}$/.test(code.trim()),
    [email, code],
  );

  const onVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setInfoMessage(null);
    setEmailError(null);
    setCodeError(null);

    if (!email.trim()) {
      setEmailError('El correo es requerido.');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setCodeError('Ingrese el código de 6 dígitos.');
      return;
    }

    setIsVerifying(true);
    try {
      await authApi.verifyAccount(email.trim(), code.trim());
      setVerified(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo verificar la cuenta.');
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    setFormError(null);
    setInfoMessage(null);
    setEmailError(null);
    if (!email.trim()) {
      setEmailError('Indique el correo para reenviar el código.');
      return;
    }
    setIsResending(true);
    try {
      const result = await authApi.resendVerification(email.trim());
      setInfoMessage(result.message);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo reenviar el código.');
    } finally {
      setIsResending(false);
    }
  };

  if (verified) {
    return (
      <section className={styles.page}>
        <FeedbackCard
          description="Su cuenta quedó activa. Ya puede iniciar sesión con su correo y contraseña."
          links={[{ label: 'Ir al inicio de sesión', to: '/login' }]}
          primaryAction={{
            label: 'Iniciar sesión',
            onClick: () => navigate('/login'),
          }}
          title="¡Cuenta verificada!"
        />
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap} aria-hidden="true">
          <ShieldCheck size={28} />
        </div>
        <h1 className={styles.title}>Verificación de cuenta</h1>
        <p className={styles.lead}>
          Ingrese el correo institucional y el código de 6 dígitos enviado por correo. El código
          vence en 15 minutos.
        </p>

        <form className={styles.form} onSubmit={onVerify} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}
          {infoMessage ? <p className={styles.info}>{infoMessage}</p> : null}

          <label>
            Correo institucional
            <Input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError ? <span className={styles.error}>{emailError}</span> : null}
          </label>

          <label>
            Código de verificación
            <Input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            {codeError ? <span className={styles.error}>{codeError}</span> : null}
          </label>

          <div className={styles.actions}>
            <Button disabled={isVerifying || !canSubmit} type="submit">
              {isVerifying ? 'Verificando…' : 'Verificar cuenta'}
            </Button>
            <Button
              disabled={isResending || isVerifying}
              onClick={() => void onResend()}
              type="button"
              variant="secondary"
            >
              {isResending ? 'Enviando…' : 'Reenviar código'}
            </Button>
          </div>
        </form>

        <p className={styles.footer}>
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </div>
    </section>
  );
};
