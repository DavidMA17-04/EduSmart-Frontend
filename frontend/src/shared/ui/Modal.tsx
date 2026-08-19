import type { PropsWithChildren } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import styles from './ui.module.css';

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

export const Modal = ({ children, isOpen, title, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return <div aria-modal="true" className={styles.modalBackdrop} role="dialog"><section className={styles.modal}><header><h2>{title}</h2><Button aria-label="Cerrar" onClick={onClose} type="button" variant="secondary"><X size={16} /></Button></header><div className={styles.modalContent}>{children}</div></section></div>;
};