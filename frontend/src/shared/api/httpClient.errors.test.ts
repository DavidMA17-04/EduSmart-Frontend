import { describe, expect, it } from 'vitest';
import { errorMessageFrom } from './httpClient';

describe('errorMessageFrom', () => {
  it('500 muestra el mensaje del servidor con el código de referencia', () => {
    expect(
      errorMessageFrom(500, {
        message: 'Ocurrió un error inesperado en el servidor. Intente de nuevo en unos minutos.',
        data: { code: 'INTERNAL_ERROR', reference: 'A1B2C3D4' },
      }),
    ).toBe(
      'Ocurrió un error inesperado en el servidor. Intente de nuevo en unos minutos. Código de referencia: A1B2C3D4.',
    );
  });

  it('502/503 sin cuerpo (servidor caído detrás del proxy) da un mensaje claro', () => {
    expect(errorMessageFrom(503, null)).toBe(
      'El servidor no está disponible en este momento. Intente de nuevo en unos minutos.',
    );
  });

  it('403 sin mensaje habla de permisos', () => {
    expect(errorMessageFrom(403, null)).toBe('No tiene permiso para realizar esta acción.');
  });

  it('400 de validación une los mensajes en español', () => {
    expect(
      errorMessageFrom(400, {
        message: 'El campo «nombre» es obligatorio. El campo «cédula» no tiene el formato esperado.',
      }),
    ).toBe('El campo «nombre» es obligatorio. El campo «cédula» no tiene el formato esperado.');
  });

  it('respeta los mensajes de dominio', () => {
    expect(errorMessageFrom(404, { message: 'El expediente no existe' })).toBe(
      'El expediente no existe',
    );
  });
});
