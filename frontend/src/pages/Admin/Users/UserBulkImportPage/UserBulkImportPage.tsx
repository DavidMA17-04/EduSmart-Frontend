import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Loader2,
  Play,
  UploadCloud,
} from 'lucide-react';
import {
  downloadOfficialTemplateCsv,
  downloadOfficialTemplateXlsx,
  userImportApi,
  validateBulkImportFile,
  type ValidateBulkImportResponse,
} from '@/features/manage-user-import';
import { PageHeader } from '@/shared/ui';
import { BulkImportDictionaryModal } from './BulkImportDictionaryModal';
import { BulkImportWizardModal } from './BulkImportWizardModal';
import styles from './UserBulkImport.module.css';

type RecentImportItem = {
  id: string;
  name: string;
  date: string;
  status: string;
};

function readLastImport(): RecentImportItem | null {
  try {
    const stored = localStorage.getItem('edusmart_recent_imports');
    if (!stored) return null;
    const parsed = JSON.parse(stored) as RecentImportItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed[0];
  } catch {
    return null;
  }
}

export const UserBulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [importData, setImportData] = useState<ValidateBulkImportResponse | null>(null);
  const [fileName, setFileName] = useState('');

  const lastImport = useMemo(() => readLastImport(), [isPreviewOpen]);

  const acceptSelectedFile = (file: File) => {
    const validationError = validateBulkImportFile(file);
    if (validationError) {
      setSelectedFile(null);
      setErrorMessage(validationError);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (e.dataTransfer.files?.[0]) acceptSelectedFile(e.dataTransfer.files[0]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) acceptSelectedFile(e.target.files[0]);
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
      setIsPreviewOpen(true);
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

  const closePreview = () => {
    setIsPreviewOpen(false);
    setImportData(null);
  };

  const backToFileSelect = () => {
    setIsPreviewOpen(false);
    setImportData(null);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        back={{ label: 'Volver a selección de método', to: '/admin/users' }}
        icon={FileSpreadsheet}
        subtitle="Cargue y sincronice la nómina estudiantil mediante archivo Excel o CSV estructurado."
        title="Importación Masiva de Estudiantes"
        primaryAction={
          <span className={styles.cycleBadge}>
            <span className={styles.cycleDot} />
            Ciclo Lectivo Activo
          </span>
        }
      />

      <section className={styles.heroCard}>
        <div className={styles.templateBar}>
          <div className={styles.templateInfo}>
            <div className={styles.templateIcon}>
              <FileText size={16} />
            </div>
            <div>
              <div className={styles.templateTitleRow}>
                <h2 className={styles.templateTitle}>Plantillas Oficiales de Registro</h2>
                <span className={styles.formatBadge}>Formato oficial</span>
              </div>
              <p className={styles.templateSub}>
                Use estos archivos para asegurar compatibilidad sin errores de validación.
              </p>
            </div>
          </div>
          <div className={styles.templateActions}>
            <button
              type="button"
              className={styles.btnGreen}
              onClick={downloadOfficialTemplateXlsx}
              disabled={isLoading}
            >
              <Download size={14} />
              Descargar .xlsx
            </button>
            <button
              type="button"
              className={styles.btnOutline}
              onClick={downloadOfficialTemplateCsv}
              disabled={isLoading}
            >
              <Download size={14} />
              Descargar .csv
            </button>
          </div>
        </div>

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
            <UploadCloud size={20} />
          </div>
          <h3 className={styles.dropzoneMain}>Arrastre y suelte su archivo aquí</h3>
          <p className={styles.dropzoneSub}>
            Admite formatos <strong>.xlsx</strong> o <strong>.csv</strong> hasta 10 MB
          </p>
          <button type="button" className={styles.btnBlue} disabled={isLoading}>
            <UploadCloud size={14} />
            Seleccionar archivo desde el equipo
          </button>
        </div>

        {selectedFile && (
          <div className={styles.fileBadge}>
            <FileCheck size={20} color="var(--color-primary-green)" />
            <div>
              <div className={styles.fileName}>{selectedFile.name}</div>
              <div className={styles.fileSize}>
                {(selectedFile.size / 1024).toFixed(1)} KB · Listo para procesar
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

        <div className={styles.heroFooter}>
          <div className={styles.lastImport}>
            <CheckCircle2 size={14} className={styles.lastImportIcon} />
            {lastImport ? (
              <span>
                <strong>Última importación:</strong> {lastImport.name} · {lastImport.date}
              </span>
            ) : (
              <span>Aún no hay importaciones recientes registradas en este equipo.</span>
            )}
          </div>
          <span className={styles.heroHint}>Verificación automática al validar el archivo</span>
        </div>
      </section>

      <section className={styles.guideCard}>
        <div className={styles.guideInfo}>
          <div className={styles.guideIcon}>
            <FileText size={20} />
          </div>
          <div>
            <div className={styles.guideTitleRow}>
              <h2 className={styles.guideTitle}>Especificaciones y Guía de Columnas</h2>
              <span className={styles.fieldsBadge}>8 campos soportados</span>
            </div>
            <p className={styles.guideSub}>
              Consulte el diccionario de datos, formato de celdas y reglas para evitar
              inconsistencias de carga.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.btnNavy}
          onClick={() => setIsDictionaryOpen(true)}
        >
          <Eye size={16} />
          Ver requisitos y diccionario de campos
        </button>
      </section>

      <div className={styles.dashboardWrap}>
        <button
          type="button"
          className={styles.dashboardBtn}
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft size={16} />
          Regresar al Dashboard Administrativo
        </button>
      </div>

      <BulkImportDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      <BulkImportWizardModal
        isOpen={isPreviewOpen}
        importData={importData}
        fileName={fileName}
        onClose={closePreview}
        onBackToFileSelect={backToFileSelect}
        onImportSuccess={() => {
          closePreview();
          navigate('/admin/users');
        }}
      />
    </div>
  );
};

export default UserBulkImportPage;
