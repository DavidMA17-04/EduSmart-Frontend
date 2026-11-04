import * as XLSX from 'xlsx';

const TEMPLATE_HEADERS = [
  'identificacion',
  'nombres',
  'apellidos',
  'correo',
  'rol',
  'seccion',
  'telefono',
  'estado',
] as const;

const TEMPLATE_SAMPLE = {
  identificacion: '504120893',
  nombres: 'Aaron Jose',
  apellidos: 'Solano Mendoza',
  correo: 'asolano@ctphojancha.ed.cr',
  rol: 'ESTUDIANTE',
  seccion: '11-B',
  telefono: '87441234',
  estado: 'Activo',
} as const;

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadOfficialTemplateCsv() {
  const headers = `${TEMPLATE_HEADERS.join(',')}\n`;
  const sampleRow = `${TEMPLATE_HEADERS.map((h) => TEMPLATE_SAMPLE[h]).join(',')}\n`;
  const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'Plantilla_Usuarios_EduSmart.csv');
}

export function downloadOfficialTemplateXlsx() {
  const worksheet = XLSX.utils.json_to_sheet([TEMPLATE_SAMPLE], {
    header: [...TEMPLATE_HEADERS],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
  const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([output], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, 'Plantilla_Usuarios_EduSmart.xlsx');
}
