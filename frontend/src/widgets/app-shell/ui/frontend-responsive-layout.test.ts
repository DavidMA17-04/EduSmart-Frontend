import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(rel: string) {
  return readFileSync(resolve(__dirname, rel), 'utf8');
}

describe('frontend-responsive-layout', () => {
  it('declara viewport device-width', () => {
    const html = read('../../../../index.html');
    expect(html).toContain('width=device-width');
  });

  it('define cortes y recorta overflow del documento', () => {
    const tokens = read('../../../../src/styles/brand-tokens.css');
    const global = read('../../../../src/shared/styles/index.css');
    expect(tokens).toContain('--bp-narrow: 640px');
    expect(tokens).toContain('--bp-medium: 1024px');
    expect(global).toContain('overflow-x: clip');
  });

  it('el shell usa drawer bajo 640 px', () => {
    const css = read('./AdminShell.module.css');
    const tsx = read('./AdminShell.tsx');
    expect(css).toContain('@media (max-width: 640px)');
    expect(css).toContain('drawerBackdrop');
    expect(css).toContain('sidebarOpen');
    expect(tsx).toContain('Abrir menú');
    expect(tsx).toContain('closeDrawer');
  });

  it('login se apila en viewport medio y el submit mide al menos 44 px', () => {
    const css = read('../../../../src/pages/login/ui/LoginPage.module.css');
    expect(css).toContain('@media (max-width: 1024px)');
    expect(css).toContain('grid-template-columns: 1fr');
    expect(css).toMatch(/min-height:\s*48px/);
  });

  it('horario oculta la matriz en viewport estrecho', () => {
    const css = read('../../../../src/widgets/schedule-panel/ui/SchedulePanel.module.css');
    expect(css).toContain('.desktopMatrixWrap');
    expect(css).toContain('display: none');
    expect(css).toContain('@media (min-width: 1100px)');
    expect(css).toContain('max-width: 100%');
  });
});
