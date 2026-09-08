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
  Download,
  Loader2,
  ChevronDown,
  IdCard,
  Mail,
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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  useEffect(() => {
    setRecords(mapValidateResponseToRecords(importData));
    setPage(1);
    setDrawerOpen(true);
  }, [importData]);

  useEffect(() => {
    onBusyChange?.(isSaving);
  }, [isSaving, onBusyChange]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, showErrorsOnly, pageSize]);

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

  const filteredRecords = useMemo(() => {
    return records.filter((row) => {
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
  }, [records, searchTerm, showErrorsOnly, statusFilter]);

  const totalFiltered = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = Math.min(safePage * pageSize, totalFiltered);
  const paginatedRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, totalPages, safePage, safePage - 1, safePage + 1]);
    return Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [safePage, totalPages]);

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

  const breakdownItems: Array<{
    key: string;
    title: string;
    desc: string;
    tag: string;
    icon: 'id' | 'mail' | 'alert';
  }> = [];

  if (currentBreakdown.duplicateNationalIdInFile > 0) {
    breakdownItems.push({
      key: 'dup-id-file',
      title: `Cédulas duplicadas en archivo (${currentBreakdown.duplicateNationalIdInFile})`,
      desc: 'El mismo número de cédula aparece más de una vez en el archivo.',
      tag: 'Duplicado',
      icon: 'id',
    });
  }
  if (currentBreakdown.duplicateNationalIdInDb > 0) {
    breakdownItems.push({
      key: 'dup-id-db',
      title: `Cédulas ya existentes en BD (${currentBreakdown.duplicateNationalIdInDb})`,
      desc: 'La cédula ya está registrada en el sistema escolar.',
      tag: 'Duplicado',
      icon: 'id',
    });
  }
  if (currentBreakdown.duplicateEmailInFile > 0) {
    breakdownItems.push({
      key: 'dup-email-file',
      title: `Correos duplicados en archivo (${currentBreakdown.duplicateEmailInFile})`,
      desc: 'El mismo correo aparece más de una vez en el archivo.',
      tag: 'Conflicto',
      icon: 'mail',
    });
  }
  if (currentBreakdown.duplicateEmailInDb > 0) {
    breakdownItems.push({
      key: 'dup-email-db',
      title: `Correos ya existentes en BD (${currentBreakdown.duplicateEmailInDb})`,
      desc: 'El correo institucional ya se encuentra registrado en el sistema.',
      tag: 'Conflicto',
      icon: 'mail',
    });
  }
  if (currentBreakdown.invalidEmail > 0) {
    breakdownItems.push({
      key: 'invalid-email',
      title: `Correos inválidos (${currentBreakdown.invalidEmail})`,
      desc: 'Estructura no cumple con el formato estándar de correo.',
      tag: 'Formato',
      icon: 'mail',
    });
  }
  if (currentBreakdown.invalidRole > 0) {
    breakdownItems.push({
      key: 'invalid-role',
      title: `Roles no permitidos (${currentBreakdown.invalidRole})`,
      desc: 'La importación masiva solo admite registros con rol ESTUDIANTE.',
      tag: 'Rol',
      icon: 'alert',
    });
  }
  if (currentBreakdown.requiredFieldsMissing > 0) {
    breakdownItems.push({
      key: 'required',
      title: `Campos vacíos (${currentBreakdown.requiredFieldsMissing})`,
      desc: 'Faltan datos obligatorios en identificación, nombres o apellidos.',
      tag: 'Obligatorio',
      icon: 'alert',
    });
  }

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
        {variant === 'page' && (
          <h2 className={styles.title}>Vista previa y validación</h2>
        )}
        <p className={styles.subtitle}>
          Revise los registros detectados antes de incorporarlos. Puede corregir inconsistencias
          directamente en la tabla.
        </p>
      </header>

      {saveError && (
        <div className={styles.inlineErrorBanner} role="alert">
          <AlertTriangle size={18} />
          <span>{saveError}</span>
        </div>
      )}

      <section className={styles.kpiGrid} aria-label="Resumen de validación">
        <div className={`${styles.kpiCard} ${styles.kpiTotal}`}>
          <span className={styles.kpiLabel}>Total Registros</span>
          <p className={styles.kpiValue}>{currentKPIs.totalRows}</p>
          <span className={styles.kpiSubText}>
            <span className={`${styles.kpiDot} ${styles.kpiDotNeutral}`} />
            100% procesados
          </span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiValid}`}>
          <span className={styles.kpiLabel}>Registros Válidos</span>
          <p className={styles.kpiValue}>{currentKPIs.validRows}</p>
          <span className={`${styles.kpiSubText} ${styles.textGreen}`}>
            <span className={`${styles.kpiDot} ${styles.kpiDotGreen}`} />
            {currentKPIs.validPercentage}% aptos para importar
          </span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiWarning}`}>
          <span className={styles.kpiLabel}>Advertencias</span>
          <p className={styles.kpiValue}>{currentKPIs.warningRows}</p>
          <span className={`${styles.kpiSubText} ${styles.textAmber}`}>
            <span className={`${styles.kpiDot} ${styles.kpiDotAmber}`} />
            {currentKPIs.warningPercentage}% requieren atención
          </span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiError}`}>
          <span className={styles.kpiLabel}>Con Errores</span>
          <p className={styles.kpiValue}>{currentKPIs.errorRows}</p>
          <span className={`${styles.kpiSubText} ${styles.textRed}`}>
            <span className={`${styles.kpiDot} ${styles.kpiDotRed}`} />
            {currentKPIs.errorPercentage}% bloquean importación
          </span>
        </div>
      </section>

      <details
        className={styles.inconsistenciesDrawer}
        open={drawerOpen}
        onToggle={(e) => setDrawerOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className={styles.inconsistenciesSummary}>
          <div className={styles.inconsistenciesHeading}>
            <span className={styles.inconsistenciesIcon} aria-hidden>
              !
            </span>
            <div>
              <h3 className={styles.inconsistenciesTitle}>
                Resumen de inconsistencias detectadas
                {currentKPIs.errorRows > 0 && (
                  <span className={styles.inconsistenciesBadge}>
                    {currentKPIs.errorRows} bloqueos
                  </span>
                )}
              </h3>
              <p className={styles.inconsistenciesHint}>
                Edite las celdas directamente en la tabla para resolver los errores antes de confirmar.
              </p>
            </div>
          </div>
          <span className={styles.inconsistenciesToggle}>
            <span className={styles.toggleShow}>Ver detalles</span>
            <span className={styles.toggleHide}>Ocultar detalles</span>
            <ChevronDown size={16} className={styles.toggleChevron} aria-hidden />
          </span>
        </summary>

        <div className={styles.inconsistenciesBody}>
          {breakdownItems.length === 0 && !hasAnyDuplicateInconsistency(currentBreakdown) ? (
            <div className={styles.inconsistencyCard}>
              <div className={styles.inconsistencyCardIcon}>
                <CheckCircle2 size={16} />
              </div>
              <div className={styles.inconsistencyCardContent}>
                <div className={styles.inconsistencyCardHeader}>
                  <h4 className={styles.inconsistencyCardTitle}>Sin inconsistencias críticas</h4>
                </div>
                <p className={styles.inconsistencyCardDesc}>
                  No hay cédulas ni correos duplicados, ni otros bloqueos catalogados en el lote actual.
                </p>
              </div>
            </div>
          ) : (
            breakdownItems.map((item) => (
              <div key={item.key} className={styles.inconsistencyCard}>
                <div className={styles.inconsistencyCardIcon}>
                  {item.icon === 'id' && <IdCard size={16} />}
                  {item.icon === 'mail' && <Mail size={16} />}
                  {item.icon === 'alert' && <AlertCircle size={16} />}
                </div>
                <div className={styles.inconsistencyCardContent}>
                  <div className={styles.inconsistencyCardHeader}>
                    <h4 className={styles.inconsistencyCardTitle}>{item.title}</h4>
                    <span className={styles.inconsistencyTag}>{item.tag}</span>
                  </div>
                  <p className={styles.inconsistencyCardDesc}>{item.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </details>

      <section className={styles.toolbarCard} aria-label="Filtros de vista previa">
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="search"
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
            aria-label="Filtrar por estado de validación"
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

      <section className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.previewTable}>
            <thead>
              <tr>
                <th className={styles.colRow}># Fila</th>
                <th className={styles.colId}>Identificación</th>
                <th>Nombres</th>
                <th>Primer Apellido</th>
                <th>Segundo Apellido</th>
                <th className={styles.colEmail}>Correo Institucional</th>
                <th className={styles.colRole}>Rol</th>
                <th className={styles.colSection}>Sección</th>
                <th className={styles.colStatus}>Estado cuenta</th>
                <th className={styles.colValidation}>Validación</th>
                <th className={styles.colAction}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className={styles.emptyTableCell}>
                    No hay registros que coincidan con los filtros actuales.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row) => (
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
                    <td className={styles.rowNumberCell}>#{row.rowNumber}</td>
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
                        className={`${styles.cellInput} ${styles.cellInputCenter} ${
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
                    <td className={styles.actionCell}>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.tablePagination}>
          <div className={styles.paginationMeta}>
            <span>
              Mostrando <strong>{pageStart}</strong> a <strong>{pageEnd}</strong> de{' '}
              <strong>{totalFiltered}</strong> registros
            </span>
            <span className={styles.paginationDivider} aria-hidden>
              |
            </span>
            <label className={styles.pageSizeLabel}>
              Mostrar:
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(e) =>
                  setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])
                }
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} por página
                  </option>
                ))}
              </select>
            </label>
          </div>

          <nav className={styles.paginationNav} aria-label="Paginación de registros">
            <button
              type="button"
              className={styles.pageBtn}
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            {pageNumbers.map((num, idx) => {
              const prev = pageNumbers[idx - 1];
              const showEllipsis = prev !== undefined && num - prev > 1;
              return (
                <React.Fragment key={num}>
                  {showEllipsis && <span className={styles.pageEllipsis}>…</span>}
                  <button
                    type="button"
                    className={`${styles.pageBtn} ${num === safePage ? styles.pageBtnActive : ''}`}
                    aria-current={num === safePage ? 'page' : undefined}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                </React.Fragment>
              );
            })}
            <button
              type="button"
              className={styles.pageBtn}
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </nav>
        </div>
      </section>

      <footer className={styles.actionBar}>
        <button
          type="button"
          className={styles.btnPrimaryGreen}
          onClick={handleConfirmImport}
          disabled={isSaving || currentKPIs.validRows === 0}
          title={
            currentKPIs.validRows === 0
              ? 'No se pueden importar registros con inconsistencias'
              : undefined
          }
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className={styles.spinIcon} />
              Guardando en base de datos...
            </>
          ) : (
            <>
              <Save size={16} />
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
          <button
            type="button"
            className={`${styles.btnOutline} ${styles.btnOutlineDanger}`}
            onClick={onCancel}
            disabled={isSaving}
          >
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
