import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
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
import { userImportApi, ValidateBulkImportResponse } from '@/features/manage-user-import';
import {
  GENERATED_MOCK_USERS,
  ImportedUserRecord,
} from '../mocks/importedUsersMock';
import styles from './UserImportPreview.module.css';

export const UserImportPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos transferidos desde la carga o usar el mock sintético como fallback
  const importPayload = (location.state as { importData?: ValidateBulkImportResponse } | null)?.importData;

  const initialRecords = useMemo<ImportedUserRecord[]>(() => {
    if (importPayload && (importPayload.records || importPayload.rows)) {
      const sourceList = importPayload.records || importPayload.rows || [];
      return sourceList.map((r, idx) => ({
        id: r.tempId || `tmp-row-${idx + 1}`,
        rowNumber: r.row || r.rowNumber || idx + 1,
        identification: r.national_id || r.identification || '',
        names: r.name || r.names || '',
        firstLastname: r.first_lastname || r.firstLastname || '',
        secondLastname: r.second_lastname || r.secondLastname || '',
        email: r.email || '',
        role: (r.role as ImportedUserRecord['role']) || 'ESTUDIANTE',
        section: r.section || '',
        status: r.status || 'VALID',
        invalidFields: r.invalidFields || [],
        errorMessages: r.errorMessages || [],
        warningMessages: r.warningMessages || [],
      }));
    }
    return GENERATED_MOCK_USERS;
  }, [importPayload]);

  const [records, setRecords] = useState<ImportedUserRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'WARNING' | 'ERROR'>('ALL');
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number>(0);

  // Cálculo reactivo de KPIs basado en el estado actual de la tabla
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

  // Descarga de reporte de validación (CSV)
  const handleDownloadReport = () => {
    const headers = 'Fila,Identificacion,Nombres,Primer Apellido,Segundo Apellido,Correo,Rol,Seccion,Estado,Errores\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `${r.rowNumber},"${r.identification}","${r.names}","${r.firstLastname}","${r.secondLastname}","${r.email}","${r.role}","${r.section || ''}","${r.status}","${(r.errorMessages || []).join('; ')}"`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Reporte_Validacion_Usuarios_EduSmart.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtrado reactivo en tiempo real
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

  const handleCellChange = (id: string, field: keyof ImportedUserRecord, value: string) => {
    setRecords((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          // Si el usuario corrige la cédula o el correo, actualiza a Válido
          if (field === 'identification' && value.trim().length >= 7) {
            updated.status = 'VALID';
            updated.errorMessages = [];
            updated.invalidFields = (updated.invalidFields || []).filter((f) => f !== 'identification');
          }
          if (field === 'email' && value.includes('@')) {
            updated.status = 'VALID';
            updated.errorMessages = [];
            updated.invalidFields = (updated.invalidFields || []).filter((f) => f !== 'email');
          }
          return updated;
        }
        return row;
      }),
    );
  };

  const handleDeleteRow = (id: string) => {
    setRecords((prev) => prev.filter((row) => row.id !== id));
  };

  const handleConfirmImport = async () => {
    const validUsers = records.filter((r) => r.status === 'VALID');
    if (validUsers.length === 0) {
      setSaveError('No hay usuarios con estado Válido para importar.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const result = await userImportApi.confirmImport(validUsers as any);
      setImportedCount(result.importedCount);
      setIsSuccessModalOpen(true);

      // Registrar en el historial de importaciones recientes
      try {
        const fileName = (location.state as any)?.fileName || 'Importacion_Usuarios_EduSmart.csv';
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newEntry = {
          id: Date.now().toString(),
          name: fileName,
          date: `Hoy a las ${timeStr} • ${result.importedCount} registros`,
          status: 'Completado',
        };
        const existing = JSON.parse(localStorage.getItem('edusmart_recent_imports') || '[]');
        const updatedList = [newEntry, ...existing.filter((item: any) => item.id !== newEntry.id)].slice(0, 5);
        localStorage.setItem('edusmart_recent_imports', JSON.stringify(updatedList));
      } catch {
        // Ignorar fallos de localStorage en entornos restringidos
      }
    } catch (err: any) {
      setSaveError(
        err.message || 'Error al persistir los usuarios en la base de datos MySQL. Verifique la conexión con el servidor.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Botón de navegación superior */}
      <div className={styles.topNavigation}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/admin/users/import/bulk')}
          disabled={isSaving}
        >
          <ArrowLeft size={18} /> Volver a cargar archivo
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Vista Previa y Validación de Usuarios</h1>
        <p className={styles.subtitle}>
          Revise los registros detectados antes de incorporarlos a la base de datos oficial. Puede corregir inconsistencias directamente en la tabla.
        </p>
      </header>

      {saveError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            background: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            borderRadius: '12px',
            color: 'var(--status-error-text)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={20} />
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. 4 Tarjetas de KPIs Superiores (WF-15) */}
      <section className={styles.kpiGrid}>
        {/* Total */}
        <div className={`${styles.kpiCard} ${styles.kpiTotal}`}>
          <span className={styles.kpiLabel}>Total Registros</span>
          <h3 className={styles.kpiValue}>{currentKPIs.totalRows}</h3>
          <span className={styles.kpiSubText}>100% procesados</span>
        </div>

        {/* Válidos */}
        <div className={`${styles.kpiCard} ${styles.kpiValid}`}>
          <span className={styles.kpiLabel}>Registros Válidos</span>
          <h3 className={styles.kpiValue}>{currentKPIs.validRows}</h3>
          <span className={`${styles.kpiSubText} ${styles.textGreen}`}>
            {currentKPIs.validPercentage}% aptos para importar
          </span>
        </div>

        {/* Advertencias */}
        <div className={`${styles.kpiCard} ${styles.kpiWarning}`}>
          <span className={styles.kpiLabel}>Advertencias</span>
          <h3 className={styles.kpiValue}>{currentKPIs.warningRows}</h3>
          <span className={`${styles.kpiSubText} ${styles.textAmber}`}>
            {currentKPIs.warningPercentage}% requieren atención
          </span>
        </div>

        {/* Errores */}
        <div className={`${styles.kpiCard} ${styles.kpiError}`}>
          <span className={styles.kpiLabel}>Con Errores</span>
          <h3 className={styles.kpiValue}>{currentKPIs.errorRows}</h3>
          <span className={`${styles.kpiSubText} ${styles.textRed}`}>
            {currentKPIs.errorPercentage}% bloquean importación
          </span>
        </div>
      </section>

      {/* 2. Toolbar & Filtros Interactivos */}
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
            title="Descargar reporte de validación"
          >
            <Download size={16} />
            Descargar reporte
          </button>
        </div>
      </section>

      {/* 3. Layout Central: Tabla (Izq) y Panel de Errores (Der) */}
      <div className={styles.mainLayout}>
        {/* Tabla Interactiva de 10 Columnas */}
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
                  <th style={{ width: '120px' }}>Estado</th>
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
                        className={styles.cellInput}
                        value={row.names}
                        onChange={(e) => handleCellChange(row.id, 'names', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.cellInput}
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
                        className={styles.cellInput}
                        value={row.role}
                        onChange={(e) => handleCellChange(row.id, 'role', e.target.value)}
                      >
                        <option value="ESTUDIANTE">ESTUDIANTE</option>
                        <option value="DOCENTE">DOCENTE</option>
                        <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                        <option value="DIRECTIVO">DIRECTIVO</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={row.section || ''}
                        onChange={(e) => handleCellChange(row.id, 'section', e.target.value)}
                      />
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

        {/* Panel Lateral: Resumen de Validación */}
        <aside className={styles.summaryPanel}>
          <h3 className={styles.summaryTitle}>
            <AlertCircle size={18} color="var(--status-error-text)" />
            Resumen de inconsistencias
          </h3>

          <ul className={styles.errorBreakdownList}>
            <li className={styles.errorBreakdownItem}>
              <div className={styles.errorBreakdownName}>
                Cédulas Duplicadas ({importPayload?.breakdown?.duplicateNationalId ?? 4})
              </div>
              <div className={styles.errorBreakdownDesc}>
                Filas con números de cédula repetidos dentro del archivo o en base de datos.
              </div>
            </li>
            <li className={styles.errorBreakdownItem}>
              <div className={styles.errorBreakdownName}>
                Correos Inválidos ({importPayload?.breakdown?.invalidEmail ?? 5})
              </div>
              <div className={styles.errorBreakdownDesc}>
                Estructura no cumple con el formato estándar de correo institucional.
              </div>
            </li>
            <li className={styles.errorBreakdownItem}>
              <div className={styles.errorBreakdownName}>
                Campos Vacíos ({importPayload?.breakdown?.requiredFieldsMissing ?? 3})
              </div>
              <div className={styles.errorBreakdownDesc}>
                Faltan datos obligatorios en identificación, nombres o apellidos.
              </div>
            </li>
          </ul>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <HelpCircle size={15} />
            Edite las celdas directamente en la tabla para resolver los errores antes de confirmar.
          </div>
        </aside>
      </div>

      {/* 4. Barra Inferior de Acciones */}
      <footer className={styles.actionBar}>
        <div className={styles.actionSecondaryGroup}>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={() => navigate('/admin/users')}
            disabled={isSaving}
          >
            <XCircle size={16} /> Cancelar importación
          </button>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={() => navigate('/admin/users/import/bulk')}
            disabled={isSaving}
          >
            <RefreshCw size={16} /> Volver a cargar archivo
          </button>
        </div>

        <button
          type="button"
          className={styles.btnPrimaryGreen}
          onClick={handleConfirmImport}
          disabled={isSaving || currentKPIs.validRows === 0}
          style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          {isSaving ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Guardando en base de datos...
            </>
          ) : (
            <>
              <Save size={18} />
              Continuar e importar {currentKPIs.validRows} registros válidos
            </>
          )}
        </button>
      </footer>

      {/* Modal de Éxito al Completar */}
      {isSuccessModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              maxWidth: '460px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#e6f4ea',
                color: '#107c41',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <ShieldCheck size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#081e48', margin: '0 0 0.5rem 0' }}>
              ¡Importación Exitosa en MySQL!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Se han registrado correctamente los {importedCount || currentKPIs.validRows} usuarios en la base de datos oficial de EduSmart CTP Hojancha.
            </p>
            <button
              type="button"
              className={styles.btnPrimaryGreen}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/admin/users')}
            >
              Volver al Inicio Administrativo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserImportPreviewPage;
