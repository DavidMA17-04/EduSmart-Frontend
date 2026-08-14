import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ImportedUserRow, RawRowData, UserRole } from '@/types/user';
import { validateRow } from './validateRows';

/**
 * Normaliza nombres de columnas comunes en archivos Excel/CSV costarricenses
 */
const normalizeHeader = (header: string): string => {
  const clean = header.trim().toLowerCase();
  if (clean.includes('cedula') || clean.includes('cédula') || clean.includes('id')) return 'nationalId';
  if (clean.includes('nombre')) return 'firstName';
  if (clean.includes('apellido')) return 'lastName';
  if (clean.includes('correo') || clean.includes('email')) return 'email';
  if (clean.includes('rol') || clean.includes('perfil')) return 'role';
  return clean;
};

const mapRoleValue = (val: string): string | UserRole => {
  const clean = String(val || '').trim().toUpperCase();
  if (clean.includes('ESTUDIANTE') || clean === 'STUDENT') return UserRole.STUDENT;
  if (clean.includes('DOCENTE') || clean.includes('PROFESOR') || clean === 'TEACHER') return UserRole.TEACHER;
  if (clean.includes('ADMINISTRATIVO') || clean === 'ADMINISTRATIVE') return UserRole.ADMINISTRATIVE;
  if (clean.includes('DIRECTIVO') || clean.includes('DIRECTOR') || clean === 'DIRECTIVE') return UserRole.DIRECTIVE;
  return val;
};

export const parseFileToUserRows = async (file: File): Promise<ImportedUserRow[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Formato de archivo no soportado. Por favor suba un archivo .csv o .xlsx');
  }
};

const parseCSV = (file: File): Promise<ImportedUserRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        const rows: ImportedUserRow[] = results.data.map((raw: any, index) => {
          const data: RawRowData = {
            nationalId: String(raw.nationalId || '').trim(),
            firstName: String(raw.firstName || '').trim(),
            lastName: String(raw.lastName || '').trim(),
            email: String(raw.email || '').trim(),
            role: mapRoleValue(raw.role),
          };
          const errors = validateRow(data);
          return {
            tempId: `row-csv-${index + 1}`,
            rowNumber: index + 2,
            data,
            isValid: errors.length === 0,
            errors,
          };
        });
        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });
};

const parseExcel = async (file: File): Promise<ImportedUserRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return rawJson.map((raw, index) => {
    const normalizedRaw: Record<string, any> = {};
    Object.keys(raw).forEach((key) => {
      normalizedRaw[normalizeHeader(key)] = raw[key];
    });

    const data: RawRowData = {
      nationalId: String(normalizedRaw.nationalId || '').trim(),
      firstName: String(normalizedRaw.firstName || '').trim(),
      lastName: String(normalizedRaw.lastName || '').trim(),
      email: String(normalizedRaw.email || '').trim(),
      role: mapRoleValue(normalizedRaw.role),
    };

    const errors = validateRow(data);

    return {
      tempId: `row-excel-${index + 1}`,
      rowNumber: index + 2,
      data,
      isValid: errors.length === 0,
      errors,
    };
  });
};
