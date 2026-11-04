import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { authApi } from '@/features/auth';
import { Alert, Button, Input } from '@/shared/ui';
import styles from '@/pages/verify-account/ui/VerifyAccountPage.module.css';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Indique el correo institucional.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await authApi.forgotPassword(email.trim());
      setInfo(result.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <span className={styles.iconWrap}>
          <KeyRound size={22} />
        </span>
        <h1 className={styles.title}>Recuperar contraseña</h1>
        <p className={styles.lead}>
          Enviaremos un enlace a su correo institucional si la cuenta existe y está activa.
        </p>
        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            Correo institucional
            <Input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@ctphojancha.ed.cr"
              type="email"
              value={email}
            />
          </label>
          {error ? <Alert>{error}</Alert> : null}
          {info ? <p className={styles.info}>{info}</p> : null}
          <div className={styles.actions}>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
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
