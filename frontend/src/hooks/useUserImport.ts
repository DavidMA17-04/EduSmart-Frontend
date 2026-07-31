import { create } from 'zustand';
import { 
  ImportedUserRow, 
  ImportFilter, 
  ImportStep, 
  ImportSummary, 
  UserFieldKey 
} from '@/types/user';
import { validateRow } from '@/utils/validateRows';
import { MOCK_IMPORTED_ROWS } from '@/utils/mockData';
import { parseFileToUserRows } from '@/utils/parseFile';
import { userService } from '@/services/userService';

interface UserImportState {
  currentStep: ImportStep;
  isProcessingFile: boolean;
  importedRows: ImportedUserRow[];
  summary: ImportSummary;
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
      selectedFilter: 'ALL',
      method: null,
    });
  },

  confirmAndSave: async () => {
    const { importedRows, summary } = get();
    if (summary.invalidRowsCount > 0) {
      alert(`No se pueden guardar los datos. Existen ${summary.invalidRowsCount} fila(s) con errores por corregir.`);
      return false;
    }

    set({ isProcessingFile: true });
    await userService.bulkImportUsers(importedRows);
    set({ isProcessingFile: false, currentStep: 'COMPLETE' });
    return true;
  },
}));

/** Export alias for backward compatibility */
export const useImportUsersStore = useUserImport;
