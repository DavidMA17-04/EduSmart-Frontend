import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './ui.module.css';
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => <input ref={ref} className={`${styles.input} ${className}`} {...props} />);
Input.displayName = 'Input';
export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className = '', type = 'checkbox', ...props }, ref) => <input ref={ref} type={type} className={`${styles.checkbox} ${className}`} {...props} />);
Checkbox.displayName = 'Checkbox';