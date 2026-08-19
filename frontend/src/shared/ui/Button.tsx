import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './ui.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };
export const Button = ({ children, className = '', variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) => <button className={`${styles.button} ${styles[variant]} ${className}`} {...props}>{children}</button>;
export const Card = ({ children, className = '', padded = true }: PropsWithChildren<{ className?: string; padded?: boolean }>) => <section className={`${styles.card} ${padded ? styles.cardPadding : ''} ${className}`}>{children}</section>;