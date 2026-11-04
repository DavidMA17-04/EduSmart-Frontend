import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './ui.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'md' | 'icon';

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  danger: styles.buttonDanger,
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: PropsWithChildren<ButtonProps>) => (
  <button
    className={`${styles.button} ${variantClass[variant]} ${size === 'icon' ? styles.buttonIcon : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const Card = ({
  children,
  className = '',
  padded = true,
}: PropsWithChildren<{ className?: string; padded?: boolean }>) => (
  <section className={`${styles.card} ${padded ? styles.cardPadding : ''} ${className}`}>{children}</section>
);
