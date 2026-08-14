import { UserRole, ImportedUserRow } from '@/types/user';
import { validateRow } from './validateRows';

const rawMockPayload = [
  {
    nationalId: '501230456',
    firstName: 'Valeria',
    lastName: 'Chavarría Matarrita',
    email: 'vchavarria@hojancha.ed.cr',
    role: UserRole.STUDENT,
  },
  {
    nationalId: '509870654',
    firstName: 'Carlos',
    lastName: 'Alvarado Ruiz',
    email: 'carlos.alvarado-sin-dominio', // Email con formato incorrecto
    role: UserRole.TEACHER,
  },
  {
    nationalId: '50444', // Cédula demasiado corta (inválida)
    firstName: 'Mariana',
    lastName: 'Gómez Fonseca',
    email: 'mgomez@hojancha.ed.cr',
    role: UserRole.STUDENT,
  },
  {
    nationalId: '503210987',
    firstName: 'Esteban',
    lastName: 'Solano Jiménez',
    email: 'esolano@hojancha.ed.cr',
    role: 'COORDINADOR_INEXISTENTE', // Rol no reconocido
  },
  {
    nationalId: '507890123',
    firstName: 'Lucía',
    lastName: 'Madrigal Pérez',
    email: 'lmadrigal@hojancha.ed.cr',
    role: UserRole.ADMINISTRATIVE,
  },
  {
    nationalId: '508880999',
    firstName: 'Jorge',
    lastName: 'Quirós Brenes',
    email: 'jquiros@hojancha.ed.cr',
    role: UserRole.DIRECTIVE,
  },
];

export const MOCK_IMPORTED_ROWS: ImportedUserRow[] = rawMockPayload.map((data, index) => {
  const errors = validateRow(data);
  return {
    tempId: `mock-row-${index + 1}`,
    rowNumber: index + 2, // Fila 1 reservada para encabezados en el Excel/CSV
    data,
    isValid: errors.length === 0,
    errors,
  };
});
