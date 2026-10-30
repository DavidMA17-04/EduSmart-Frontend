// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMemoryRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { roleModuleRoutes } from './RoleModuleRoutes';
import { TerritoryGuard } from './TerritoryGuard';
import { portalPathForSession } from '@/shared/auth/portalPaths';

const session = vi.hoisted(() => ({ roles: ['Estudiante'], permissions: ['disciplinary.view_own', 'communications.view'] }));
vi.mock('@/shared/auth', () => ({
  getSessionUser: () => session,
  sessionHasPermission: (p: string) => session.permissions.includes(p),
}));
vi.mock('@/shared/auth/session', () => ({ getSessionUser: () => session }));
vi.mock('@/pages/discipline', () => ({
  DisciplineAppealsPage: () => <div>center-page</div>,
  DisciplineAppealNewPage: () => <div>new-page</div>,
  DisciplineAppealTrackingPage: () => <div>tracking-page</div>,
  DisciplineAppealReviewPage: () => <div>review-detail-page</div>,
  DisciplineAppealsReviewPage: () => <div>review-page</div>,
  DisciplineAppealsReportsPage: () => <div>report-page</div>,
  DisciplineCasePage: () => <div>case-page</div>,
}));
vi.mock('@/pages/communications/CommunicationsFeedPage', () => ({ CommunicationsFeedPage: () => <div>feed-page</div> }));
vi.mock('@/pages/communications/CommunicationsAdminPage', () => ({ CommunicationsAdminPage: () => <div>manager-page</div> }));

const houses = [
  ['Administrador','admin',true], ['Docente','teacher',true], ['Orientador','counselor',true],
  ['Director','director',true], ['Estudiante','student',false], ['Encargado','guardian',false],
] as const;
let root: Root | undefined;
let host: HTMLDivElement;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
async function render(path: string) {
  const router = createMemoryRouter(createRoutesFromElements(
    <>
      <Route element={<TerritoryGuard />}>
        {houses.map(([, house, staff]) => <Route key={house} path={`/${house}`} element={<Outlet />}>
          <Route index element={<div>home-page</div>} />
          {roleModuleRoutes(staff)}
        </Route>)}
      </Route>
      <Route path="/login" element={<div>login-page</div>} />
    </>,
  ), { initialEntries: [path] });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  await act(async () => { root!.render(<RouterProvider router={router} />); });
  return router;
}
afterEach(async () => { if (root) await act(async () => root!.unmount()); host?.remove(); root = undefined; });

describe('rutas de módulos integradas', () => {
  it.each(houses)('%s renderiza el centro en su propia casa', async (role, house) => {
    session.roles = [role]; session.permissions = ['disciplinary.view_own'];
    const router = await render(`/${house}/discipline/appeals`);
    expect(host.textContent).toContain('center-page');
    expect(router.state.location.pathname).toBe(`/${house}/discipline/appeals`);
  });
  it.each(houses)('%s renderiza el feed solo con permiso', async (role, house) => {
    session.roles = [role]; session.permissions = ['communications.view'];
    await render(`/${house}/communications`);
    expect(host.textContent).toContain('feed-page');
  });
  it('redirige legacy a un recurso de representado conservando id, consulta y fragmento', async () => {
    session.roles = ['Encargado']; session.permissions = ['disciplinary.view_own'];
    const router = await render('/admin/discipline/appeals/123?kind=APPEAL#timeline');
    expect(host.textContent).toContain('tracking-page');
    expect(router.state.location).toMatchObject({ pathname: '/guardian/discipline/appeals/123', search: '?kind=APPEAL', hash: '#timeline' });
  });
  it.each(['communications/manage','discipline/appeals/review','discipline/appeals/reports'])('no convierte %s en acceso administrativo del estudiante', async path => {
    session.roles = ['Estudiante']; session.permissions = ['disciplinary.view_own','communications.view'];
    const router = await render(`/admin/${path}`);
    expect(host.textContent).toContain('home-page');
    expect(router.state.location.pathname).toBe('/student');
  });
  it('review se reconoce como ruta estática y la revisión vuelve al portal docente', async () => {
    session.roles = ['Docente']; session.permissions = ['disciplinary.resolve'];
    const router = await render('/teacher/discipline/appeals/review');
    expect(host.textContent).toContain('review-page');
    expect(host.textContent).not.toContain('tracking-page');
    await act(async () => { await router.navigate(portalPathForSession('/admin/discipline/appeals/review/42')); });
    expect(host.textContent).toContain('review-detail-page');
    expect(router.state.location.pathname).toBe('/teacher/discipline/appeals/review/42');
  });
  it('Orientador sin permiso de comunicados o resolución vuelve a su home', async () => {
    session.roles = ['Orientador']; session.permissions = ['disciplinary.view'];
    const router = await render('/counselor/communications');
    expect(host.textContent).toContain('home-page');
    expect(router.state.location.pathname).toBe('/counselor');
  });
  it('un rol desconocido no renderiza el feed', async () => {
    session.roles = ['Desconocido']; session.permissions = ['communications.view'];
    const router = await render('/admin/communications');
    expect(router.state.location.pathname).toBe('/login');
    expect(host.textContent).toContain('login-page');
  });
});
