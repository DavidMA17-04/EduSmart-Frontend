import React from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Save
} from 'lucide-react';
import { useUserImport } from '@/hooks/useUserImport';
import { UserRole, UserFieldKey } from '@/types/user';
import styles from './ImportPreviewTable.module.css';

export const ImportPreviewTable: React.FC = () => {
  const {
    importedRows,
    summary,
    selectedFilter,
    setFilter,
    updateRowCell,
    deleteRow,
    resetStore,
    confirmAndSave,
    isProcessingFile,
  } = useUserImport();

  const filteredRows = importedRows.filter((row) => {
    if (selectedFilter === 'VALID_ONLY') return row.isValid;
    if (selectedFilter === 'ERRORS_ONLY') return !row.isValid;
    return true;
  });

  const getFieldError = (errors: any[], field: UserFieldKey) => {
    return errors.find((e) => e.field === field);
  };

  return (
    <div className={styles.container}>
      {/* Header Metrics */}
      <div className={`glass-panel ${styles.headerBar}`}>
        <div className={styles.fileInfo}>
          <div className={styles.fileIcon}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <div className={styles.fileName}>
              {summary.fileName || 'Archivo de Importación'}
            </div>
            <div className={styles.fileMeta}>
              Total Registros Detectados: {summary.totalRows}
            </div>
          </div>
        </div>

        <div className={styles.metricsGroup}>
          <div className={`${styles.metricBadge} ${styles.badgeAll}`}>
            <span>Total: {summary.totalRows}</span>
          </div>
          <div className={`${styles.metricBadge} ${styles.badgeValid}`}>
            <CheckCircle2 size={16} /> <span>Válidos: {summary.validRowsCount}</span>
          </div>
          <div className={`${styles.metricBadge} ${styles.badgeInvalid}`}>
            <AlertCircle size={16} /> <span>Con Errores: {summary.invalidRowsCount}</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedFilter === 'ALL' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Todas ({summary.totalRows})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedFilter === 'VALID_ONLY' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('VALID_ONLY')}
          >
            Válidas ({summary.validRowsCount})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedFilter === 'ERRORS_ONLY' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('ERRORS_ONLY')}
          >
            <AlertCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
            Con Errores ({summary.invalidRowsCount})
          </button>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          💡 Puedes corregir cualquier celda directamente en la tabla
        </span>
      </div>

      {/* Interactive Grid Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}># Fila</th>
              <th style={{ width: '140px' }}>Cédula</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Correo Institucional</th>
              <th style={{ width: '160px' }}>Rol</th>
              <th style={{ width: '50px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.tempId} className={!row.isValid ? styles.rowInvalid : ''}>
                <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  #{row.rowNumber}
                </td>

                {/* Cédula Cell */}
                <td>
                  {(() => {
                    const err = getFieldError(row.errors, 'nationalId');
                    return (
                      <div>
                        <input
                          type="text"
                          className={`${styles.cellInput} ${err ? styles.cellInputError : ''}`}
                          value={row.data.nationalId}
                          onChange={(e) => updateRowCell(row.tempId, 'nationalId', e.target.value)}
                        />
                        {err && <div className={styles.errorTooltip}>⚠️ {err.message}</div>}
                      </div>
                    );
                  })()}
                </td>

                {/* Nombre Cell */}
                <td>
                  {(() => {
                    const err = getFieldError(row.errors, 'firstName');
                    return (
                      <div>
                        <input
                          type="text"
                          className={`${styles.cellInput} ${err ? styles.cellInputError : ''}`}
                          value={row.data.firstName}
                          onChange={(e) => updateRowCell(row.tempId, 'firstName', e.target.value)}
                        />
                        {err && <div className={styles.errorTooltip}>⚠️ {err.message}</div>}
                      </div>
                    );
                  })()}
                </td>

                {/* Apellidos Cell */}
                <td>
                  {(() => {
                    const err = getFieldError(row.errors, 'lastName');
                    return (
                      <div>
                        <input
                          type="text"
                          className={`${styles.cellInput} ${err ? styles.cellInputError : ''}`}
                          value={row.data.lastName}
                          onChange={(e) => updateRowCell(row.tempId, 'lastName', e.target.value)}
                        />
                        {err && <div className={styles.errorTooltip}>⚠️ {err.message}</div>}
                      </div>
                    );
                  })()}
                </td>

                {/* Email Cell */}
                <td>
                  {(() => {
                    const err = getFieldError(row.errors, 'email');
                    return (
                      <div>
                        <input
                          type="email"
                          className={`${styles.cellInput} ${err ? styles.cellInputError : ''}`}
                          value={row.data.email}
                          onChange={(e) => updateRowCell(row.tempId, 'email', e.target.value)}
                        />
                        {err && <div className={styles.errorTooltip}>⚠️ {err.message}</div>}
                      </div>
                    );
                  })()}
                </td>

                {/* Rol Selector Cell */}
                <td>
                  {(() => {
                    const err = getFieldError(row.errors, 'role');
                    return (
                      <div>
                        <select
                          className={`${styles.cellInput} ${err ? styles.cellInputError : ''}`}
                          value={row.data.role}
                          onChange={(e) => updateRowCell(row.tempId, 'role', e.target.value)}
                        >
                          <option value={UserRole.STUDENT}>ESTUDIANTE</option>
                          <option value={UserRole.TEACHER}>DOCENTE</option>
                          <option value={UserRole.ADMINISTRATIVE}>ADMINISTRATIVO</option>
                          <option value={UserRole.DIRECTIVE}>DIRECTIVO</option>
                          {!Object.values(UserRole).includes(row.data.role as any) && (
                            <option value={row.data.role}>{String(row.data.role)}</option>
                          )}
                        </select>
                        {err && <div className={styles.errorTooltip}>⚠️ {err.message}</div>}
                      </div>
                    );
                  })()}
                </td>

                {/* Delete Row Button */}
                <td>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteRow(row.tempId)}
                    title="Eliminar esta fila"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className={styles.actionBar}>
        <button
          type="button"
          className={styles.filterBtn}
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-primary)' }}
          onClick={resetStore}
        >
          <RefreshCw size={16} style={{ display: 'inline', marginRight: 6 }} /> Cargar otro archivo
        </button>

        <button
          type="button"
          className={styles.saveBtn}
          disabled={summary.invalidRowsCount > 0 || summary.validRowsCount === 0 || isProcessingFile}
          onClick={confirmAndSave}
        >
          <Save size={18} />
          {isProcessingFile ? 'Guardando...' : `Confirmar e Importar ${summary.validRowsCount} Usuario(s)`}
        </button>
      </div>
    </div>
  );
};
