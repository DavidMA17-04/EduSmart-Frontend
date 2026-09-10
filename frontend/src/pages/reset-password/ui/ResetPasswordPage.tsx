import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { authApi } from '@/features/auth';
import { isValidInitialPassword } from '@/features/manage-user/model/userFormRules';
import { Alert, Button, Input } from '@/shared/ui';
import styles from '@/pages/verify-account/ui/VerifyAccountPage.module.css';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasToken = useMemo(() => token.length > 16, [token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!hasToken) {
      setError('El enlace de restablecimiento no es válido.');
      return;
    }
    if (!isValidInitialPassword(password)) {
      setError('La contraseña debe tener entre 8 y 72 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('La confirmación no coincide.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      navigate('/login', { replace: true, state: { resetDone: true } });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo restablecer la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <span className={styles.iconWrap}>
          <ShieldCheck size={22} />
        </span>
        <h1 className={styles.title}>Nueva contraseña</h1>
        <p className={styles.lead}>Defina una contraseña nueva para volver a entrar a EduSmart.</p>
        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            Nueva contraseña
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <label>
            Confirmar contraseña
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirm(event.target.value)}
              type="password"
              value={confirm}
            />
          </label>
          {error ? <Alert>{error}</Alert> : null}
          <div className={styles.actions}>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Guardando…' : 'Restablecer'}
            </Button>
          </div>
        </form>
        <p className={styles.footer}>
          <Link to="/forgot-password">Solicitar un enlace nuevo</Link>
        </p>
      </div>
    </section>
  );
};
