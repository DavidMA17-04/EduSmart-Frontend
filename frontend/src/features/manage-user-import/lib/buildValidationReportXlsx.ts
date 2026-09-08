import * as XLSX from 'xlsx';

export interface ValidationReportRow {
  rowNumber: number;
  identification: string;
  names: string;
  firstLastname: string;
  secondLastname: string;
  email: string;
  role: string;
  section?: string;
  userStatus?: string;
  status: string;
  errorMessages?: string[];
}

export function buildValidationReportXlsx(records: ValidationReportRow[]): Blob {
  const rows = records.map((r) => ({
    Fila: r.rowNumber,
    Identificacion: r.identification,
    Nombres: r.names,
    'Primer Apellido': r.firstLastname,
    'Segundo Apellido': r.secondLastname,
    Correo: r.email,
    Rol: r.role,
    Seccion: r.section || '',
    EstadoCuenta: r.userStatus || 'ACTIVE',
    Validacion: r.status,
    Errores: (r.errorMessages || []).join('; '),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Validacion');
  const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([output], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadValidationReportXlsx(records: ValidationReportRow[]) {
  const blob = buildValidationReportXlsx(records);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Reporte_Validacion_Usuarios_EduSmart.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}
