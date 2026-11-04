import { lazy, type ComponentType } from 'react';

const RELOAD_KEY = 'edusmart.chunkReloadAt';
const RELOAD_WINDOW_MS = 60_000;

/** Un archivo de página que ya no existe en el servidor (típico tras un despliegue). */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed|error loading dynamically imported/i.test(
    message,
  );
}

function reloadedRecently(): boolean {
  try {
    const at = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    return Date.now() - at < RELOAD_WINDOW_MS;
  } catch {
    return true;
  }
}

/**
 * Descarga el módulo de una página. Si el archivo ya no existe porque se publicó
 * una versión nueva, recarga la aplicación una sola vez para traer la vigente;
 * si vuelve a fallar en el mismo minuto, deja pasar el error (lo muestra PageSuspense).
 */
export async function loadPage<M, K extends keyof M>(
  loader: () => Promise<M>,
  exportName: K,
): Promise<{ default: M[K] }> {
  try {
    const module = await loader();
    return { default: module[exportName] };
  } catch (error) {
    if (isChunkLoadError(error) && !reloadedRecently()) {
      try {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        // Sin almacenamiento: se recarga igual, una vez.
      }
      window.location.reload();
      return new Promise<never>(() => {});
    }
    throw error;
  }
}

/** Página cargada bajo demanda: su código se descarga la primera vez que se abre. */
export function lazyPage<M, K extends keyof M>(loader: () => Promise<M>, exportName: K) {
  type Page = M[K] extends ComponentType<infer P> ? ComponentType<P> : never;
  return lazy(() => loadPage(loader, exportName) as Promise<{ default: Page }>);
}
