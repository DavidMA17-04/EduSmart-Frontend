import type { ReactNode } from 'react';
import { Compass, Lock, ServerCrash, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react';
import styles from './ErrorScreen.module.css';

export type ErrorScreenVariant = 'not-found' | 'forbidden' | 'crash' | 'server' | 'offline';

const VARIANT_CLASS: Record<ErrorScreenVariant, string> = {
  'not-found': styles.notFound,
  forbidden: styles.forbidden,
  crash: styles.crash,
  server: styles.server,
  offline: styles.offline,
};

const ICONS: Record<ErrorScreenVariant, LucideIcon> = {
  'not-found': Compass,
  forbidden: Lock,
  crash: TriangleAlert,
  server: ServerCrash,
  offline: WifiOff,
};

export interface ErrorScreenProps {
  variant: ErrorScreenVariant;
  /** Código grande decorativo, p. ej. "404". */
  code?: string;
  /** Etiqueta pequeña sobre el título, p. ej. "Error 404". */
  eyebrow?: string;
  title: string;
  description: ReactNode;
  /** Dato técnico breve para soporte: ruta, código de referencia… */
  detail?: ReactNode;
  actions?: ReactNode;
  /** Pantalla completa con fondo institucional (fuera del menú). */
  standalone?: boolean;
}

/**
 * Pantalla de error institucional (404, 403, fallas). Animaciones en CSS para
 * no sumar peso a la carga inicial; respeta `prefers-reduced-motion`.
 */
export function ErrorScreen({
  variant,
  code,
  eyebrow,
  title,
  description,
  detail,
  actions,
  standalone = false,
}: ErrorScreenProps) {
  const Icon = ICONS[variant];
  const content = (
    <section
      aria-labelledby="error-screen-title"
      className={`${styles.card} ${VARIANT_CLASS[variant] ?? ''}`}
      data-variant={variant}
      role={variant === 'crash' || variant === 'server' ? 'alert' : undefined}
    >
      <div className={styles.emblem} aria-hidden="true">
        <span className={styles.ring} />
        <span className={`${styles.ring} ${styles.ringLate}`} />
        <span className={styles.orbit} />
        <span className={styles.iconDisc}>
          <Icon className={styles.icon} size={34} strokeWidth={1.75} />
        </span>
      </div>

      {code ? (
        <p className={styles.code} aria-hidden="true">
          {code.split('').map((digit, index) => (
            <span key={`${digit}-${index}`} style={{ ['--d' as string]: index }}>
              {digit}
            </span>
          ))}
        </p>
      ) : null}

      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h1 className={styles.title} id="error-screen-title">
        {title}
      </h1>
      <div className={styles.description}>{description}</div>
      {detail ? <div className={styles.detail}>{detail}</div> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );

  if (!standalone) {
    return <div className={styles.inline}>{content}</div>;
  }

  return (
    <main className={styles.standalone}>
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.glow} />
        <span className={styles.pattern} />
      </div>
      <header className={styles.brand}>
        <img alt="" className={styles.crest} src="/brand/ctp-hojancha-logo.jpeg" />
        <span>
          <strong>EduSmart</strong>
          <small>C.T.P. de Hojancha</small>
        </span>
      </header>
      {content}
      <p className={styles.footer}>© 2026 EduSmart · CTP Hojancha</p>
    </main>
  );
}

/** Botones con el estilo de la pantalla de error. */
export function ErrorScreenAction({
  children,
  onClick,
  variant = 'primary',
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
}) {
  return (
    <button
      className={`${styles.action} ${variant === 'primary' ? styles.primary : styles.secondary}`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
