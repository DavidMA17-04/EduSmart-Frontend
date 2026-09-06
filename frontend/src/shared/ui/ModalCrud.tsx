import type { PropsWithChildren } from 'react';
import { Modal } from './Modal';

/** Standard create/edit dialog shell. Size reserved for future Modal API extension. */
export type ModalCrudProps = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}>;

export const ModalCrud = ({
  children,
  isOpen,
  title,
  onClose,
}: ModalCrudProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    {children}
  </Modal>
);
