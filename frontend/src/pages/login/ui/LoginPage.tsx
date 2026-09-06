import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CircleHelp,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogIn,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { authApi } from '@/features/auth';
import { publicApi, type CampusSnapshot } from '@/features/public';
import { AuthLoginError, getAccessToken } from '@/shared/auth';
import { Button, Checkbox, Input } from '@/shared/ui';
import styles from './LoginPage.module.css';

function formatCount(value: number): string {
  return value.toLocaleString('es-CR');
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapshot, setSnapshot] = useState<CampusSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    publicApi
      .getCampusSnapshot()
      .then((data) => {
        if (active) setSnapshot(data);
      })
      .catch(() => {
        if (active) setSnapshot(null);
      })
      .finally(() => {
        if (active) setSnapshotLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (snapshotLoading) {
      setDisplayCount(null);
      return;
    }

    const target = snapshot?.totalUsers;
    if (target == null) {
      setDisplayCount(null);
      return;
    }

    if (prefersReducedMotion()) {
      setDisplayCount(target);
      return;
    }

    let frameId = 0;
    const durationMs = 800;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayCount(Math.round(target * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [snapshot, snapshotLoading]);

  if (getAccessToken()) {
    return <Navigate replace to="/admin" />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmailError = email.trim() ? null : 'Este campo es obligatorio.';
    const nextPasswordError = password ? null : 'La contraseña es obligatoria.';
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (nextEmailError || nextPasswordError) return;

    setIsSubmitting(true);
    try {
      await authApi.login(email, password, rememberMe);
      navigate('/admin', { replace: true });
    } catch (loginError) {
      if (loginError instanceof AuthLoginError) {
        setFormError(loginError.message);
      } else {
        setFormError('No se pudo conectar con el servidor. Verifique que el backend esté activo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`admin-shell ${styles.layout}`}>
      <aside className={styles.hero}>
        <div className={styles.heroAura} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGlowSecondary} aria-hidden="true" />
        <div className={styles.heroWatermark} aria-hidden="true">
          <GraduationCap size={180} strokeWidth={1} />
          <BookOpen size={120} strokeWidth={1} />
          <Shield size={160} strokeWidth={1} />
        </div>

        <div className={styles.heroTop}>
          <div className={styles.heroBrand}>
            <span className={styles.heroLogo}>
              <BookOpen aria-hidden="true" size={28} />
              <GraduationCap aria-hidden="true" size={34} />
            </span>
            <h1>EduSmart</h1>
            <p>Gestión Académica Integral</p>
          </div>
          <p className={styles.heroSchool}>CTP HOJANCHA</p>
          <p className={styles.heroCopy}>
            Accede al panel institucional para administrar usuarios, estructura académica y el día a día del colegio.
          </p>
        </div>

        <div className={styles.sellCard} aria-live="polite">
          <span className={styles.sellIcon}>
            <Users size={16} aria-hidden="true" />
          </span>
          <div className={styles.sellBody}>
            <strong className={styles.sellValue}>
              {displayCount === null ? '—' : formatCount(displayCount)}
            </strong>
            <span className={styles.sellLabel}>Usuarios en la plataforma</span>
            <p className={styles.sellHint}>Comunidad institucional en crecimiento</p>
          </div>
          <span className={styles.trendBadge} aria-hidden="true">
            <TrendingUp className={styles.trendArrow} size={14} strokeWidth={2.4} />
          </span>
        </div>
      </aside>

      <section className={styles.panel}>
        <header className={styles.welcome}>
          <p className={styles.welcomeEyebrow}>Portal administrativo</p>
          <h2>Bienvenido de nuevo</h2>
          <p>Inicia sesión con tu cuenta institucional para continuar</p>
        </header>

        <form className={styles.card} onSubmit={onSubmit} noValidate>
          <div className={styles.cardBrand}>
            <span className={styles.cardLogo}>
              <BookOpen aria-hidden="true" size={20} />
              <GraduationCap aria-hidden="true" size={24} />
            </span>
            <strong>EduSmart</strong>
            <small>CTP Hojancha</small>
          </div>

          <label className={styles.field}>
            Correo electrónico o identificación
            <span className={`${styles.inputWrap} ${emailError ? styles.inputInvalid : ''}`}>
              <User aria-hidden="true" className={styles.inputIcon} size={16} />
              <Input
                autoComplete="username"
                className={styles.input}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="usuario@ctphojancha.ac.cr"
                type="email"
                value={email}
              />
            </span>
            {emailError ? <span className={styles.fieldError}>{emailError}</span> : null}
          </label>

          <label className={styles.field}>
            Contraseña
            <span className={`${styles.inputWrap} ${passwordError ? styles.inputInvalid : ''}`}>
              <Lock aria-hidden="true" className={styles.inputIcon} size={16} />
              <Input
                autoComplete="current-password"
                className={`${styles.input} ${styles.passwordInput}`}
                minLength={8}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Ingresa tu contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                className={styles.togglePassword}
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
              </button>
            </span>
            {passwordError ? <span className={styles.fieldError}>{passwordError}</span> : null}
          </label>

          <div className={styles.row}>
            <label className={styles.remember}>
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Recordarme en este dispositivo
            </label>
            <button
              className={styles.forgot}
              onClick={() => setFormError('La recuperación de contraseña aún no está disponible. Contacta al administrador del sistema.')}
              type="button"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          {formError ? (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          ) : null}

          <Button className={styles.submit} disabled={isSubmitting} type="submit">
            <LogIn aria-hidden="true" size={16} />
            {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>

          <div className={styles.divider}><span>o continúa con</span></div>

          <div className={styles.sso}>
            <button disabled title="Próximamente" type="button">Microsoft 365</button>
            <button disabled title="Próximamente" type="button">Google</button>
          </div>
        </form>

        <p className={styles.help}>
          <CircleHelp aria-hidden="true" size={14} />
          ¿Necesitas ayuda? Contacta al administrador del sistema.
        </p>
        <p className={styles.copyright}>© 2026 EduSmart - CTP Hojancha. Todos los derechos reservados.</p>
      </section>
    </div>
  );
};
