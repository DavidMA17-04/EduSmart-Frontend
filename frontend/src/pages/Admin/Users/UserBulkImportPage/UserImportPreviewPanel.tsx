import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  Trash2,
  RefreshCw,
  XCircle,
  Save,
  ShieldCheck,
  HelpCircle,
  Download,
  Loader2,
} from 'lucide-react';
import {
  downloadValidationReportXlsx,
  mapValidateResponseToRecords,
  userImportApi,
  ValidateBulkImportResponse,
} from '@/features/manage-user-import';
import {
  computeImportPreviewBreakdown,
  hasAnyDuplicateInconsistency,
  revalidateImportPreviewRecords,
} from '@/features/manage-user-import/lib/validateImportPreviewRow';
import { ImportedUserRecord } from '../mocks/importedUsersMock';
import styles from '../UserImportPreviewPage/UserImportPreview.module.css';

export interface UserImportPreviewPanelProps {
  importData: ValidateBulkImportResponse;
  fileName?: string;
  variant?: 'page' | 'modal';
  onBackToFileSelect: () => void;
  onCancel: () => void;
  onSuccess: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export const UserImportPreviewPanel: React.FC<UserImportPreviewPanelProps> = ({
  importData,
  fileName = 'Importacion_Usuarios_EduSmart.xlsx',
  variant = 'page',
  onBackToFileSelect,
  onCancel,
  onSuccess,
  onBusyChange,
}) => {
  const initialRecords = useMemo(
    () => mapValidateResponseToRecords(importData),
    [importData],
  );

  const [records, setRecords] = useState<ImportedUserRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'WARNING' | 'ERROR'>('ALL');
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  useEffect(() => {
    setRecords(mapValidateResponseToRecords(importData));
  }, [importData]);

  useEffect(() => {
    onBusyChange?.(isSaving);
  }, [isSaving, onBusyChange]);

  const currentBreakdown = useMemo(
    () => computeImportPreviewBreakdown(records),
    [records],
  );

  const currentKPIs = useMemo(() => {
    const totalRows = records.length;
    const validRows = records.filter((r) => r.status === 'VALID').length;
    const warningRows = records.filter((r) => r.status === 'WARNING').length;
    const errorRows = records.filter((r) => r.status === 'ERROR').length;

    return {
      totalRows,
      validRows,
      validPercentage: totalRows > 0 ? Number(((validRows / totalRows) * 100).toFixed(1)) : 0,
      warningRows,
      warningPercentage: totalRows > 0 ? Number(((warningRows / totalRows) * 100).toFixed(1)) : 0,
      errorRows,
      errorPercentage: totalRows > 0 ? Number(((errorRows / totalRows) * 100).toFixed(1)) : 0,
    };
  }, [records]);

  const filteredRecords = records.filter((row) => {
    const matchesSearch =
      searchTerm === '' ||
      row.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.names.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.firstLastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (showErrorsOnly && row.status !== 'ERROR') {
      return false;
    }

    if (statusFilter !== 'ALL' && row.status !== statusFilter) {
      return false;
    }

    return matchesSearch;
  });

  const handleDownloadReport = () => {
    downloadValidationReportXlsx(filteredRecords);
  };

  const handleCellChange = (id: string, field: keyof ImportedUserRecord, value: string) => {
    if (field === 'userStatus') {
      const normalized: ImportedUserRecord['userStatus'] =
        value === 'INACTIVE' ? 'INACTIVE' : value === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE';
      setRecords((prev) =>
        prev.map((row) => (row.id === id ? { ...row, userStatus: normalized } : row)),
      );
      return;
    }

    setRecords((prev) => {
      const updated = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      );
      return revalidateImportPreviewRecords(updated);
    });
  };

  const handleDeleteRow = (id: string) => {
    setRecords((prev) => revalidateImportPreviewRecords(prev.filter((row) => row.id !== id)));
  };

  const handleConfirmImport = async () => {
    const validatedRecords = revalidateImportPreviewRecords(records);
    setRecords(validatedRecords);

    const validUsers = validatedRecords.filter((r) => r.status === 'VALID');
    if (validUsers.length === 0) {
      setSaveError('No hay usuarios con estado Válido para importar.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const result = await userImportApi.confirmImport(
        validUsers.map((r) => ({
          row: r.rowNumber,
          status: 'VALID' as const,
          national_id: r.identification,
          name: r.names,
          first_lastname: r.firstLastname,
          second_lastname: r.secondLastname || null,
          email: r.email,
          role: r.role,
          section: r.section || null,
          phone: r.phone || null,
          user_status: r.userStatus || 'ACTIVE',
          userStatus: r.userStatus || 'ACTIVE',
        })),
      );
      setImportedCount(result.importedCount);
      setIsSuccessModalOpen(true);

      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newEntry = {
          id: Date.now().toString(),
          name: fileName,
          date: `Hoy a las ${timeStr} • ${result.importedCount} registros`,
          status: 'Completado',
        };
        const existing = JSON.parse(localStorage.getItem('edusmart_recent_imports') || '[]');
        const updatedList = [newEntry, ...existing.filter((item: { id: string }) => item.id !== newEntry.id)].slice(0, 5);
        localStorage.setItem('edusmart_recent_imports', JSON.stringify(updatedList));
      } catch {
        // Ignorar fallos de localStorage
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al persistir los usuarios en la base de datos MySQL. Verifique la conexión con el servidor.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const rootClass =
    variant === 'modal' ? `${styles.container} ${styles.containerModal}` : styles.container;

  return (
    <div className={rootClass}>
      {variant === 'page' && (
        <div className={styles.topNavigation}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBackToFileSelect}
            disabled={isSaving}
          >
            Volver a cargar archivo
          </button>
        </div>
      )}

      <header className={styles.header}>
        <h2 className={variant === 'modal' ? styles.titleModal : styles.title}>
          Vista Previa y Validación de Usuarios
        </h2>
        <p className={styles.subtitle}>
          Revise los registros detectados antes de incorporarlos. Puede corregir inconsistencias
          directamente en la tabla.
        </p>
      </header>

      {saveError && (
        <div className={styles.inlineErrorBanner} role="alert">
          <AlertTriangle size={20} />
          <span>{saveError}</span>
        </div>
      )}

      <section className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiTotal}`}>
          <span className={styles.kpiLabel}>Total Registros</span>
          <h3 className={styles.kpiValue}>{currentKPIs.totalRows}</h3>
          <span className={styles.kpiSubText}>100% procesados</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiValid}`}>
          <span className={styles.kpiLabel}>Registros Válidos</span>
          <h3 className={styles.kpiValue}>{currentKPIs.validRows}</h3>
          <span className={`${styles.kpiSubText} ${styles.textGreen}`}>
            {currentKPIs.validPercentage}% aptos para importar
          </span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiWarning}`}>
          <span className={styles.kpiLabel}>Advertencias</span>
          <h3 className={styles.kpiValue}>{currentKPIs.warningRows}</h3>
          <span className={`${styles.kpiSubText} ${styles.textAmber}`}>
            {currentKPIs.warningPercentage}% requieren atención
          </span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiError}`}>
          <span className={styles.kpiLabel}>Con Errores</span>
          <h3 className={styles.kpiValue}>{currentKPIs.errorRows}</h3>
          <span className={`${styles.kpiSubText} ${styles.textRed}`}>
            {currentKPIs.errorPercentage}% bloquean importación
          </span>
        </div>
      </section>

      <section className={styles.toolbarCard}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por cédula, nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterControls}>
          <select
            className={styles.statusSelect}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'ALL' | 'VALID' | 'WARNING' | 'ERROR')
            }
          >
            <option value="ALL">Todos los Estados</option>
            <option value="VALID">Solo Válidos</option>
            <option value="WARNING">Solo Advertencias</option>
            <option value="ERROR">Solo Errores</option>
          </select>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showErrorsOnly}
              onChange={(e) => setShowErrorsOnly(e.target.checked)}
            />
            Mostrar solo con errores
          </label>

          <button
            type="button"
            className={styles.downloadReportBtn}
            onClick={handleDownloadReport}
            title="Descargar reporte de validación (.xlsx)"
          >
            <Download size={16} />
            Descargar reporte
          </button>
        </div>
      </section>

      <div className={styles.mainLayout}>
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}># Fila</th>
                  <th style={{ width: '130px' }}>Identificación</th>
                  <th>Nombres</th>
                  <th>Primer Apellido</th>
                  <th>Segundo Apellido</th>
                  <th>Correo Institucional</th>
                  <th style={{ width: '130px' }}>Rol</th>
                  <th>Sección</th>
                  <th style={{ width: '130px' }}>Estado cuenta</th>
                  <th style={{ width: '120px' }}>Validación</th>
                  <th style={{ width: '50px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.status === 'ERROR'
                        ? styles.rowError
                        : row.status === 'WARNING'
                          ? styles.rowWarning
                          : styles.rowValid
                    }
                  >
                    <td style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      #{row.rowNumber}
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`${styles.cellInput} ${
                          row.invalidFields?.includes('identification') ? styles.cellInputError : ''
                        }`}
                        value={row.identification}
                        onChange={(e) => handleCellChange(row.id, 'identification', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`${styles.cellInput} ${
                          row.invalidFields?.includes('names') ? styles.cellInputError : ''
                        }`}
                        value={row.names}
                        onChange={(e) => handleCellChange(row.id, 'names', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`${styles.cellInput} ${
                          row.invalidFields?.includes('firstLastname') ? styles.cellInputError : ''
                        }`}
                        value={row.firstLastname}
                        onChange={(e) => handleCellChange(row.id, 'firstLastname', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={row.secondLastname}
                        onChange={(e) => handleCellChange(row.id, 'secondLastname', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        className={`${styles.cellInput} ${
                          row.invalidFields?.includes('email') ? styles.cellInputError : ''
                        }`}
                        value={row.email}
                        onChange={(e) => handleCellChange(row.id, 'email', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className={`${styles.cellInput} ${
                          row.invalidFields?.includes('role') ? styles.cellInputError : ''
                        }`}
                        value={row.role || 'ESTUDIANTE'}
                        onChange={(e) => handleCellChange(row.id, 'role', e.target.value)}
                      >
                        <option value="ESTUDIANTE">ESTUDIANTE</option>
                        {row.role && row.role !== 'ESTUDIANTE' && (
                          <option value={row.role}>{row.role}</option>
                        )}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`${styles.cellInput} ${
                          row.invalidFields?.includes('section') ? styles.cellInputError : ''
                        }`}
                        value={row.section || ''}
                        onChange={(e) => handleCellChange(row.id, 'section', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className={styles.cellInput}
                        value={row.userStatus || 'ACTIVE'}
                        onChange={(e) => handleCellChange(row.id, 'userStatus', e.target.value)}
                        aria-label={`Estado de cuenta fila ${row.rowNumber}`}
                      >
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="BLOCKED">Bloqueado</option>
                      </select>
                    </td>
                    <td>
                      {row.status === 'VALID' && (
                        <span className={styles.badgeStatusValid}>
                          <CheckCircle2 size={12} /> Válido
                        </span>
                      )}
                      {row.status === 'WARNING' && (
                        <span className={styles.badgeStatusWarning}>
                          <AlertTriangle size={12} /> Advertencia
                        </span>
                      )}
                      {row.status === 'ERROR' && (
                        <span className={styles.badgeStatusError}>
                          <AlertCircle size={12} /> Error
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteRow(row.id)}
                        title="Eliminar fila"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className={styles.summaryPanel}>
          <h3 className={styles.summaryTitle}>
            <AlertCircle size={18} color="var(--status-error-text)" />
            Resumen de inconsistencias
          </h3>

          <ul className={styles.errorBreakdownList}>
            {hasAnyDuplicateInconsistency(currentBreakdown) ? (
              <>
                {currentBreakdown.duplicateNationalIdInFile > 0 && (
                  <li className={styles.errorBreakdownItem}>
                    <div className={styles.errorBreakdownName}>
                      Cédulas duplicadas en archivo ({currentBreakdown.duplicateNationalIdInFile})
                    </div>
                    <div className={styles.errorBreakdownDesc}>
                      El mismo número de cédula aparece más de una vez en el archivo.
                    </div>
                  </li>
                )}
                {currentBreakdown.duplicateNationalIdInDb > 0 && (
                  <li className={styles.errorBreakdownItem}>
                    <div className={styles.errorBreakdownName}>
                      Cédulas ya existentes en BD ({currentBreakdown.duplicateNationalIdInDb})
                    </div>
                    <div className={styles.errorBreakdownDesc}>
                      La cédula ya está registrada en el sistema.
                    </div>
                  </li>
                )}
                {currentBreakdown.duplicateEmailInFile > 0 && (
                  <li className={styles.errorBreakdownItem}>
                    <div className={styles.errorBreakdownName}>
                      Correos duplicados en archivo ({currentBreakdown.duplicateEmailInFile})
                    </div>
                    <div className={styles.errorBreakdownDesc}>
                      El mismo correo aparece más de una vez en el archivo.
                    </div>
                  </li>
                )}
                {currentBreakdown.duplicateEmailInDb > 0 && (
                  <li className={styles.errorBreakdownItem}>
                    <div className={styles.errorBreakdownName}>
                      Correos ya existentes en BD ({currentBreakdown.duplicateEmailInDb})
                    </div>
                    <div className={styles.errorBreakdownDesc}>
                      El correo ya se encuentra registrado en el sistema.
                    </div>
                  </li>
                )}
              </>
            ) : (
              <li className={styles.errorBreakdownItem}>
                <div className={styles.errorBreakdownName}>Sin duplicados detectados</div>
                <div className={styles.errorBreakdownDesc}>
                  No hay cédulas ni correos duplicados en archivo o BD en el lote actual.
                </div>
              </li>
            )}
            {currentBreakdown.invalidEmail > 0 && (
              <li className={styles.errorBreakdownItem}>
                <div className={styles.errorBreakdownName}>
                  Correos inválidos ({currentBreakdown.invalidEmail})
                </div>
                <div className={styles.errorBreakdownDesc}>
                  Estructura no cumple con el formato estándar de correo.
                </div>
              </li>
            )}
            {currentBreakdown.invalidRole > 0 && (
              <li className={styles.errorBreakdownItem}>
                <div className={styles.errorBreakdownName}>
                  Roles no permitidos ({currentBreakdown.invalidRole})
                </div>
                <div className={styles.errorBreakdownDesc}>
                  La importación masiva solo admite registros con rol ESTUDIANTE.
                </div>
              </li>
            )}
            {currentBreakdown.requiredFieldsMissing > 0 && (
              <li className={styles.errorBreakdownItem}>
                <div className={styles.errorBreakdownName}>
                  Campos vacíos ({currentBreakdown.requiredFieldsMissing})
                </div>
                <div className={styles.errorBreakdownDesc}>
                  Faltan datos obligatorios en identificación, nombres o apellidos.
                </div>
              </li>
            )}
          </ul>

          <div className={styles.helpHint}>
            <HelpCircle size={15} />
            Edite las celdas directamente en la tabla para resolver los errores antes de confirmar.
          </div>
        </aside>
      </div>

      <footer className={styles.actionBar}>
        <button
          type="button"
          className={styles.btnPrimaryGreen}
          onClick={handleConfirmImport}
          disabled={isSaving || currentKPIs.validRows === 0}
          style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className={styles.spinIcon} />
              Guardando en base de datos...
            </>
          ) : (
            <>
              <Save size={18} />
              Continuar e importar {currentKPIs.validRows} registros válidos
            </>
          )}
        </button>

        <div className={styles.actionSecondaryGroup}>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={onBackToFileSelect}
            disabled={isSaving}
          >
            <RefreshCw size={16} /> Volver a cargar archivo
          </button>
          <button type="button" className={styles.btnOutline} onClick={onCancel} disabled={isSaving}>
            <XCircle size={16} /> Cancelar importación
          </button>
        </div>
      </footer>

      {isSuccessModalOpen && (
        <div className={styles.successOverlay} role="dialog" aria-modal="true">
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <ShieldCheck size={36} />
            </div>
            <h2 className={styles.successTitle}>¡Importación Exitosa en MySQL!</h2>
            <p className={styles.successText}>
              Se han registrado correctamente los {importedCount || currentKPIs.validRows} usuarios
              en la base de datos oficial de EduSmart CTP Hojancha.
            </p>
            <button
              type="button"
              className={styles.btnPrimaryGreen}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onSuccess}
            >
              Volver al Inicio Administrativo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
