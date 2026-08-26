export interface ImportedUserRecord {
  id: string;
  rowNumber: number;
  identification: string;
  names: string;
  firstLastname: string;
  secondLastname: string;
  email: string;
  role: 'ESTUDIANTE' | 'DOCENTE' | 'ADMINISTRATIVO' | 'DIRECTIVO';
  section?: string;
  phone?: string;
  status: 'VALID' | 'WARNING' | 'ERROR';
  errorMessages?: string[];
  warningMessages?: string[];
  invalidFields?: string[];
}

export interface ImportKPISummary {
  totalRows: number;
  validRows: number;
  validPercentage: number;
  warningRows: number;
  warningPercentage: number;
  errorRows: number;
  errorPercentage: number;
}

export const IMPORT_KPI_DATA: ImportKPISummary = {
  totalRows: 248,
  validRows: 218,
  validPercentage: 87.9,
  warningRows: 18,
  warningPercentage: 7.3,
  errorRows: 12,
  errorPercentage: 4.8,
};

// Generador de registros sintéticos con los casos exactos de WF-15
const baseValidUsers: ImportedUserRecord[] = [
  {
    id: 'usr-001',
    rowNumber: 1,
    identification: '504120893',
    names: 'Aaron José',
    firstLastname: 'Solano',
    secondLastname: 'Mendoza',
    email: 'asolano@ctphojancha.ed.cr',
    role: 'ESTUDIANTE',
    section: '11-B Informática',
    phone: '8744-1234',
    status: 'VALID',
  },
  {
    id: 'usr-002',
    rowNumber: 2,
    identification: '501230456',
    names: 'María Elena',
    firstLastname: 'Gómez',
    secondLastname: 'Vargas',
    email: 'mgomez@ctphojancha.ed.cr',
    role: 'DOCENTE',
    section: 'Depto. Ciencias',
    phone: '8811-2233',
    status: 'VALID',
  },
  {
    id: 'usr-003',
    rowNumber: 3,
    identification: '503340987',
    names: 'Carlos Andrés',
    firstLastname: 'Rojas',
    secondLastname: 'Chavarría',
    email: 'crojas@ctphojancha.ed.cr',
    role: 'ADMINISTRATIVO',
    section: 'Dirección',
    phone: '8922-3344',
    status: 'VALID',
  },
  {
    id: 'usr-004',
    rowNumber: 4,
    identification: '507890123',
    names: 'Sofía',
    firstLastname: 'Navarro',
    secondLastname: 'Campos',
    email: 'snavarro@ctphojancha.ed.cr',
    role: 'DIRECTIVO',
    section: 'Consejo Directivo',
    phone: '8344-5566',
    status: 'VALID',
  },
  {
    id: 'usr-005',
    rowNumber: 5,
    identification: '509870654',
    names: 'Diego',
    firstLastname: 'Castro',
    secondLastname: 'Jiménez',
    email: 'dcastro@ctphojancha.ed.cr',
    role: 'ESTUDIANTE',
    section: '10-A Agropecuaria',
    phone: '8566-7788',
    status: 'VALID',
  },
];

// Casos de Advertencia (18 en total en el dataset)
const baseWarningUsers: ImportedUserRecord[] = [
  {
    id: 'usr-w01',
    rowNumber: 6,
    identification: '502220333',
    names: 'Valeria',
    firstLastname: 'Salas',
    secondLastname: 'Madrigal',
    email: 'vsalas@ctphojancha.ed.cr',
    role: 'ESTUDIANTE',
    section: '', // Sin sección asignada
    phone: '',
    status: 'WARNING',
    warningMessages: ['Sin sección académica asignada'],
    invalidFields: ['section'],
  },
  {
    id: 'usr-w02',
    rowNumber: 7,
    identification: '506660777',
    names: 'Jorge Luis',
    firstLastname: 'Brenes',
    secondLastname: 'Quesada',
    email: 'jbrenes@ctphojancha.ed.cr',
    role: 'DOCENTE',
    section: 'Depto. Matemáticas',
    phone: '7000-0000', // Formato de teléfono a verificar
    status: 'WARNING',
    warningMessages: ['Teléfono sospechoso o temporal'],
    invalidFields: ['phone'],
  },
];

// Casos de Error (12 en total en el dataset)
const baseErrorUsers: ImportedUserRecord[] = [
  {
    id: 'usr-e01',
    rowNumber: 8,
    identification: '504120893', // Cédula duplicada
    names: 'Rodrigo',
    firstLastname: 'Solano',
    secondLastname: 'Mora',
    email: 'rsolano@ctphojancha.ed.cr',
    role: 'ESTUDIANTE',
    section: '12-C',
    phone: '8999-1122',
    status: 'ERROR',
    errorMessages: ['Cédula duplicada en el archivo (Fila 1)'],
    invalidFields: ['identification'],
  },
  {
    id: 'usr-e02',
    rowNumber: 9,
    identification: '508880999',
    names: 'Ana Lucía',
    firstLastname: 'Hernández',
    secondLastname: 'Gutiérrez',
    email: 'correo_invalido_sin_arroba', // Formato email inválido
    role: 'ESTUDIANTE',
    section: '10-B',
    phone: '8444-5555',
    status: 'ERROR',
    errorMessages: ['Formato de correo electrónico inválido'],
    invalidFields: ['email'],
  },
  {
    id: 'usr-e03',
    rowNumber: 10,
    identification: '', // Campo obligatorio vacío
    names: 'Felipe',
    firstLastname: 'Monge',
    secondLastname: 'Araya',
    email: 'fmonge@ctphojancha.ed.cr',
    role: 'DOCENTE',
    section: 'Depto. Inglés',
    phone: '8333-2211',
    status: 'ERROR',
    errorMessages: ['Identificación (Cédula) es obligatoria'],
    invalidFields: ['identification'],
  },
];

// Generar lista total representativa de 248 registros
export const GENERATED_MOCK_USERS: ImportedUserRecord[] = [
  ...baseValidUsers,
  ...baseWarningUsers,
  ...baseErrorUsers,
];
