import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ValidateBulkImportResponse } from '@/features/manage-user-import';
import { UserImportPreviewPanel } from './UserImportPreviewPanel';
import styles from './BulkImportWizard.module.css';

interface BulkImportWizardModalProps {
  isOpen: boolean;
  importData: ValidateBulkImportResponse | null;
  fileName?: string;
  onClose: () => void;
  onBackToFileSelect: () => void;
  onImportSuccess: () => void;
}

export const BulkImportWizardModal: React.FC<BulkImportWizardModalProps> = ({
  isOpen,
  importData,
  fileName,
  onClose,
  onBackToFileSelect,
  onImportSuccess,
}) => {
  const [isPreviewBusy, setIsPreviewBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPreviewBusy(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPreviewBusy) {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isPreviewBusy, onClose]);

  if (!isOpen || !importData) return null;

  const handleRequestClose = () => {
    if (isPreviewBusy) return;
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-import-wizard-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPreviewBusy) {
          onClose();
        }
      }}
    >
      <div className={`${styles.dialog} ${styles.dialogWide}`}>
        <header className={styles.header}>
          <div>
            <p className={styles.stepLabel}>Vista previa</p>
            <h2 id="bulk-import-wizard-title" className={styles.title}>
              Vista previa y validación
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleRequestClose}
            disabled={isPreviewBusy}
            aria-label="Cerrar asistente"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <UserImportPreviewPanel
            importData={importData}
            fileName={fileName}
            variant="modal"
            onBackToFileSelect={onBackToFileSelect}
            onCancel={handleRequestClose}
            onSuccess={onImportSuccess}
            onBusyChange={setIsPreviewBusy}
          />
        </div>
      </div>
    </div>
  );
};
