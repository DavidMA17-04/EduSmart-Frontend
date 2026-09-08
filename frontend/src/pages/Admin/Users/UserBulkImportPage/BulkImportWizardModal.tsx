import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  FileCheck,
  FileSpreadsheet,
  Loader2,
  Play,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  userImportApi,
  validateBulkImportFile,
  ValidateBulkImportResponse,
} from '@/features/manage-user-import';
import { UserImportPreviewPanel } from './UserImportPreviewPanel';
import styles from './BulkImportWizard.module.css';

export type WizardStep = 'select' | 'preview';

interface BulkImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const BulkImportWizardModal: React.FC<BulkImportWizardModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<WizardStep>('select');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewBusy, setIsPreviewBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importData, setImportData] = useState<ValidateBulkImportResponse | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const isBusy = isLoading || isPreviewBusy;

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setSelectedFile(null);
      setIsDragOver(false);
      setIsLoading(false);
      setIsPreviewBusy(false);
      setErrorMessage(null);
      setImportData(null);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) {
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
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  const acceptSelectedFile = (file: File) => {
    const validationError = validateBulkImportFile(file);
    if (validationError) {
      setSelectedFile(null);
      setErrorMessage(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      acceptSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      acceptSelectedFile(e.target.files[0]);
    }
  };

  const handleValidateFile = async () => {
    if (!selectedFile) {
      setErrorMessage(
        'Por favor seleccione o arrastre un archivo Excel (.xlsx, .xls) o CSV antes de continuar.',
      );
      return;
    }

    const validationError = validateBulkImportFile(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await userImportApi.validateFile(selectedFile);
      setImportData(response);
      setFileName(selectedFile.name);
      setStep('preview');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo validar el archivo con el servidor. Verifique que el backend esté activo.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelect = () => {
    if (isBusy) return;
    setStep('select');
    setImportData(null);
    setErrorMessage(null);
  };

  const handleRequestClose = () => {
    if (isBusy) return;
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-import-wizard-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isBusy) {
          onClose();
        }
      }}
    >
      <div className={`${styles.dialog} ${step === 'preview' ? styles.dialogWide : ''}`}>
        <header className={styles.header}>
          <div>
            <p className={styles.stepLabel}>
              {step === 'select' ? 'Paso 1 de 2' : 'Paso 2 de 2'}
            </p>
            <h2 id="bulk-import-wizard-title" className={styles.title}>
              {step === 'select'
                ? 'Seleccionar archivo'
                : 'Vista previa y validación'}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleRequestClose}
            disabled={isBusy}
            aria-label="Cerrar asistente"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          {step === 'select' && (
            <>
              {errorMessage && (
                <div className={styles.errorBanner} role="alert">
                  <AlertTriangle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div
                className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isLoading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className={styles.hiddenInput}
                  onChange={onFileChange}
                  disabled={isLoading}
                />
                <div className={styles.dropzoneIcon}>
                  <FileSpreadsheet size={28} />
                </div>
                <div className={styles.dropzoneMain}>Arrastra y suelta tu archivo aquí</div>
                <div className={styles.dropzoneSub}>
                  Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv) hasta 10 MB
                </div>
                <button type="button" className={styles.browseBtn} disabled={isLoading}>
                  <UploadCloud size={16} />
                  Seleccionar desde mi equipo
                </button>
              </div>

              {selectedFile && (
                <div className={styles.fileBadge}>
                  <FileCheck size={20} color="var(--color-primary-green)" />
                  <div>
                    <div className={styles.fileName}>{selectedFile.name}</div>
                    <div className={styles.fileSize}>
                      {(selectedFile.size / 1024).toFixed(1)} KB • Listo para procesar
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                className={styles.validateBtn}
                onClick={handleValidateFile}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className={styles.spin} />
                    Validando con el servidor...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Validar y procesar archivo
                  </>
                )}
              </button>
            </>
          )}

          {step === 'preview' && importData && (
            <UserImportPreviewPanel
              importData={importData}
              fileName={fileName}
              variant="modal"
              onBackToFileSelect={handleBackToSelect}
              onCancel={handleRequestClose}
              onSuccess={onImportSuccess}
              onBusyChange={setIsPreviewBusy}
            />
          )}
        </div>
      </div>
    </div>
  );
};
