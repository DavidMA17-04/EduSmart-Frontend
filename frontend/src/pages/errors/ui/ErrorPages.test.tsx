// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageSuspense } from '@/shared/ui/PageSuspense';
import { NotFoundPage } from './ErrorPages';

const auth = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock('@/features/auth/model/useAuthStore', () => ({
  useAuthStore: (select: (s: typeof auth) => unknown) => select(auth),
}));
vi.mock('@/shared/auth', () => ({ getSessionUser: () => ({ roles: ['Docente'] }) }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement;

async function render(element: JSX.Element, path = '/teacher/no-existe') {
  const router = createMemoryRouter(
    [
      { path: '*', element },
      { path: '/teacher', element: <div>home-page</div> },
      { path: '/login', element: <div>login-page</div> },
    ],
    { initialEntries: [path] },
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(<RouterProvider router={router} />));
  return router;
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  host?.remove();
  root = undefined;
  auth.isAuthenticated = true;
});

function button(label: string) {
  return [...host.querySelectorAll('button')].find((b) => b.textContent?.includes(label))!;
}

describe('pantallas de error', () => {
  it('404 muestra la dirección y vuelve al inicio del rol', async () => {
    const router = await render(<NotFoundPage />);
    expect(host.textContent).toContain('Página no encontrada');
    expect(host.textContent).toContain('/teacher/no-existe');
    await act(async () => button('Volver al inicio').click());
    expect(router.state.location.pathname).toBe('/teacher');
  });

  it('404 sin sesión ofrece ir al inicio de sesión', async () => {
    auth.isAuthenticated = false;
    const router = await render(<NotFoundPage standalone />, '/cualquier-cosa');
    expect(host.textContent).toContain('EduSmart');
    await act(async () => button('Ir al inicio de sesión').click());
    expect(router.state.location.pathname).toBe('/login');
  });

  it('un fallo al mostrar la página se ve como "Algo salió mal"', async () => {
    const Broken = () => {
      throw new Error('boom');
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(
      <PageSuspense>
        <Broken />
      </PageSuspense>,
    );
    expect(host.textContent).toContain('Algo salió mal');
    expect(host.querySelector('[role="alert"]')).not.toBeNull();
    spy.mockRestore();
  });

  it('si no se pudo descargar la página habla de conexión', async () => {
    const Broken = () => {
      throw new TypeError('Failed to fetch dynamically imported module: /assets/x.js');
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(
      <PageSuspense>
        <Broken />
      </PageSuspense>,
    );
    expect(host.textContent).toContain('No se pudo cargar esta página');
    spy.mockRestore();
  });
});
