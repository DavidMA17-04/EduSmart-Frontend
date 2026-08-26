import { create } from 'zustand';
import { 
  ImportedUserRow, 
  ImportFilter, 
  ImportStep, 
  ImportSummary, 
  UserFieldKey 
} from '@/types/user';
import type { ImportResult } from '@/entities/user-import';
import { mapRowsToImportResult } from '@/entities/user-import/model/mapRowsToImportResult';
import { importResultApi } from '@/features/manage-user-import';
import { validateRow } from '@/utils/validateRows';
import { MOCK_IMPORTED_ROWS } from '@/utils/mockData';
import { parseFileToUserRows } from '@/utils/parseFile';

interface UserImportState {
  currentStep: ImportStep;
  isProcessingFile: boolean;
  importedRows: ImportedUserRow[];
  summary: ImportSummary;
  importResult: ImportResult | null;
  selectedFilter: ImportFilter;
  method: 'MANUAL' | 'BULK' | null;

  // Actions
  setMethod: (method: 'MANUAL' | 'BULK') => void;
  setStep: (step: ImportStep) => void;
  setFilter: (filter: ImportFilter) => void;
  loadMockData: () => void;
  handleFileUpload: (file: File) => Promise<void>;
  updateRowCell: (tempId: string, field: UserFieldKey, newValue: string) => void;
  deleteRow: (tempId: string) => void;
  resetStore: () => void;
  confirmAndSave: () => Promise<boolean>;
}

const initialSummary: ImportSummary = {
  totalRows: 0,
  validRowsCount: 0,
  invalidRowsCount: 0,
  fileName: null,
  fileSizeBytes: null,
};

const calculateSummary = (rows: ImportedUserRow[], fileName?: string | null, size?: number | null): ImportSummary => {
  const validRowsCount = rows.filter((r) => r.isValid).length;
  return {
    totalRows: rows.length,
    validRowsCount,
    invalidRowsCount: rows.length - validRowsCount,
    fileName: fileName ?? null,
    fileSizeBytes: size ?? null,
  };
};

export const useUserImport = create<UserImportState>((set, get) => ({
  currentStep: 'SELECT_METHOD',
  isProcessingFile: false,
  importedRows: [],
  summary: initialSummary,
  importResult: null,
  selectedFilter: 'ALL',
  method: null,

  setMethod: (method) => {
    set({ method });
    if (method === 'BULK') {
      set({ currentStep: 'UPLOAD_FILE' });
    }
  },

  setStep: (step) => set({ currentStep: step }),

  setFilter: (selectedFilter) => set({ selectedFilter }),

  loadMockData: () => {
    const summary = calculateSummary(MOCK_IMPORTED_ROWS, 'datos_simulados_ctp_hojancha.xlsx', 45000);
    set({
      importedRows: MOCK_IMPORTED_ROWS,
      summary,
      currentStep: 'PREVIEW_DATA',
      selectedFilter: 'ALL',
    });
  },

  handleFileUpload: async (file: File) => {
    set({ isProcessingFile: true });
    try {
      const rows = await parseFileToUserRows(file);
      const summary = calculateSummary(rows, file.name, file.size);

      set({
        importedRows: rows,
        summary,
        isProcessingFile: false,
        currentStep: 'PREVIEW_DATA',
        selectedFilter: 'ALL',
      });
    } catch (err: any) {
      set({ isProcessingFile: false });
      alert(err?.message || 'Error al procesar el archivo');
    }
  },

  updateRowCell: (tempId: string, field: UserFieldKey, newValue: string) => {
    const { importedRows, summary } = get();

    const updatedRows = importedRows.map((row) => {
      if (row.tempId !== tempId) return row;

      const updatedData = { ...row.data, [field]: newValue };
      const newErrors = validateRow(updatedData);

      return {
        ...row,
        data: updatedData,
        isValid: newErrors.length === 0,
        errors: newErrors,
      };
    });

    const newSummary = calculateSummary(updatedRows, summary.fileName, summary.fileSizeBytes);

    set({
      importedRows: updatedRows,
      summary: newSummary,
    });
  },

  deleteRow: (tempId: string) => {
    const { importedRows, summary } = get();
    const updatedRows = importedRows.filter((r) => r.tempId !== tempId);
    const newSummary = calculateSummary(updatedRows, summary.fileName, summary.fileSizeBytes);
    set({ importedRows: updatedRows, summary: newSummary });
  },

  resetStore: () => {
    set({
      currentStep: 'SELECT_METHOD',
      isProcessingFile: false,
      importedRows: [],
      summary: initialSummary,
      importResult: null,
      selectedFilter: 'ALL',
      method: null,
    });
  },

  confirmAndSave: async () => {
    const { importedRows } = get();
    set({ isProcessingFile: true });
    const localResult = mapRowsToImportResult(importedRows);

    try {
      const persisted = await importResultApi.register({
        type: 'users',
        successfulRecords: localResult.successfulRecords,
        errorRecords: localResult.errorRecords,
        summary: localResult.summary,
      });
      set({ isProcessingFile: false, currentStep: 'COMPLETE', importResult: persisted });
    } catch {
      // Si el backend aún no está disponible, PBI-06 igual puede representar el resultado local.
      set({ isProcessingFile: false, currentStep: 'COMPLETE', importResult: localResult });
    }
    return true;
  },
}));

/** Export alias for backward compatibility */
export const useImportUsersStore = useUserImport;
