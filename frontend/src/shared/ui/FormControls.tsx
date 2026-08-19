import { forwardRef, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './ui.module.css';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className = '', ...props }, ref) => <select ref={ref} className={`${styles.input} ${className}`} {...props} />);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className = '', ...props }, ref) => <textarea ref={ref} className={`${styles.textarea} ${className}`} {...props} />);
Textarea.displayName = 'Textarea';