// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isChunkLoadError, loadPage } from './lazyPage';

const missing = () => Promise.reject(new TypeError('Failed to fetch dynamically imported module: /assets/X.js'));
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('carga de páginas bajo demanda', () => {
  const original = window.location;
  const reload = vi.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: { ...original, reload } });
  });
  afterEach(() => {
    sessionStorage.clear();
    reload.mockReset();
    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  it('reconoce los errores de archivo de página faltante de cada navegador', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/X.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  it('devuelve el componente exportado con ese nombre', async () => {
    const Page = () => null;
    await expect(loadPage(async () => ({ Page }), 'Page')).resolves.toEqual({ default: Page });
  });

  it('si falta el archivo recarga la aplicación una sola vez', async () => {
    void loadPage(missing, 'X' as never);
    await settle();
    expect(reload).toHaveBeenCalledTimes(1);

    // Otro fallo en el mismo minuto: no recarga en bucle, deja ver el error.
    await expect(loadPage(missing, 'X' as never)).rejects.toThrow(/dynamically imported/);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('un error que no es de carga no recarga y se propaga', async () => {
    await expect(loadPage(() => Promise.reject(new Error('fallo de la página')), 'X' as never)).rejects.toThrow(
      'fallo de la página',
    );
    expect(reload).not.toHaveBeenCalled();
  });
});
