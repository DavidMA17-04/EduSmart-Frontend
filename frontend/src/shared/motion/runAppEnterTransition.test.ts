import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import {
  coverRadiusPx,
  resolveCoverBoxSize,
  runAppEnterTransition,
} from './runAppEnterTransition';

vi.mock('./appEnterTransition.css', () => ({}));

type FakeOverlay = {
  className: string;
  style: { clipPath?: string; overflow?: string; transform?: string; visibility?: string };
  isConnected: boolean;
  parentNode: unknown;
  setAttribute: ReturnType<typeof vi.fn>;
  classList: { add: (value: string) => void; remove: (value: string) => void };
  appendChild: (child: FakeOverlay) => FakeOverlay;
  remove: () => void;
  getBoundingClientRect?: () => DOMRect;
  animate?: (
    keyframes: Array<{ transform?: string; clipPath?: string }>,
    options: KeyframeAnimationOptions,
  ) => { finished: Promise<void>; cancel: () => void };
};

function createDocHarness(options?: { animate?: boolean; rejectReveal?: boolean }) {
  const withAnimate = options?.animate !== false;
  const overlays: FakeOverlay[] = [];
  const body = {
    style: { overflow: '' },
    appendChild(node: FakeOverlay) {
      overlays.push(node);
      node.isConnected = true;
      node.parentNode = body;
      return node;
    },
  };

  const doc = {
    body,
    createElement(_tag: string): FakeOverlay {
      let animCount = 0;
      const children: FakeOverlay[] = [];
      const classSet = new Set<string>();
      const el: FakeOverlay = {
        className: '',
        style: {},
        isConnected: false,
        parentNode: null,
        setAttribute: vi.fn(),
        classList: {
          add: (value: string) => {
            classSet.add(value);
          },
          remove: (value: string) => {
            classSet.delete(value);
          },
        },
        appendChild(child: FakeOverlay) {
          children.push(child);
          child.isConnected = true;
          child.parentNode = el;
          return child;
        },
        getBoundingClientRect: () =>
          ({
            width: 1280,
            height: 720,
            top: 0,
            left: 0,
            right: 1280,
            bottom: 720,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          }) as DOMRect,
        remove() {
          el.isConnected = false;
          el.parentNode = null;
          for (const child of children) {
            child.isConnected = false;
            child.parentNode = null;
          }
          const index = overlays.indexOf(el);
          if (index >= 0) overlays.splice(index, 1);
        },
      };

      if (withAnimate) {
        el.animate = (keyframes) => {
          animCount += 1;
          const last = keyframes[keyframes.length - 1];
          if (last?.transform) el.style.transform = last.transform;
          if (options?.rejectReveal && animCount === 2) {
            return {
              finished: Promise.reject(new Error('reveal failed')),
              cancel: vi.fn(),
            };
          }
          return {
            finished: Promise.resolve(),
            cancel: vi.fn(),
          };
        };
      }

      return el;
    },
  };

  return { doc: doc as unknown as Document, overlays, body };
}

describe('coverRadiusPx', () => {
  const viewports = [
    [320, 568],
    [375, 667],
    [768, 1024],
    [1366, 768],
    [1920, 1080],
    [2560, 1080],
    [3440, 1440],
  ] as const;

  it.each(viewports)('covers all corners for %ix%i with overscan', (width, height) => {
    const radius = coverRadiusPx(width, height, { x: 0.5, y: 0.5 });
    const exact = Math.hypot(width / 2, height / 2);
    expect(radius).toBeGreaterThanOrEqual(Math.ceil(exact * 1.25) + 48);
    expect(radius).toBeGreaterThan(exact);
  });

  it('grows when origin is a corner', () => {
    const fromCenter = coverRadiusPx(1000, 800, { x: 0.5, y: 0.5 });
    const fromCorner = coverRadiusPx(1000, 800, { x: 0, y: 0 });
    expect(fromCorner).toBeGreaterThan(fromCenter);
  });
});

describe('resolveCoverBoxSize', () => {
  it('takes the max of overlay rect, inner, visual, and client sizes', () => {
    const size = resolveCoverBoxSize(
      {
        getBoundingClientRect: () => ({ width: 390, height: 844 } as DOMRect),
      },
      {
        innerWidth: 400,
        innerHeight: 800,
        visualViewport: { width: 410, height: 790 },
      },
      { clientWidth: 390, clientHeight: 820 },
    );
    expect(size).toEqual({ width: 410, height: 844 });
  });
});

describe('runAppEnterTransition', () => {
  it('runs update exactly once on the happy path', async () => {
    const { doc, overlays } = createDocHarness();
    const update = vi.fn();
    const waitForNextPaint = vi.fn(async () => undefined);

    await runAppEnterTransition(update, {
      doc,
      prefersReducedMotion: () => false,
      getViewportSize: () => ({ width: 1280, height: 720 }),
      waitForNextPaint,
      coverMs: 1,
      revealMs: 1,
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(waitForNextPaint).toHaveBeenCalledTimes(1);
    expect(overlays).toHaveLength(0);
  });

  it('reduced motion skips animation and still runs update once', async () => {
    const { doc, overlays } = createDocHarness();
    const update = vi.fn();

    await runAppEnterTransition(update, {
      doc,
      prefersReducedMotion: () => true,
      waitForNextPaint: async () => undefined,
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(overlays).toHaveLength(0);
  });

  it('falls back to update when Web Animations API is missing', async () => {
    const { doc, overlays } = createDocHarness({ animate: false });
    const update = vi.fn();

    await runAppEnterTransition(update, {
      doc,
      prefersReducedMotion: () => false,
      getViewportSize: () => ({ width: 400, height: 800 }),
      waitForNextPaint: async () => undefined,
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(overlays).toHaveLength(0);
  });

  it('does not double-update if reveal fails after navigate', async () => {
    const { doc, overlays } = createDocHarness({ rejectReveal: true });
    const update = vi.fn();

    await runAppEnterTransition(update, {
      doc,
      prefersReducedMotion: () => false,
      getViewportSize: () => ({ width: 1024, height: 768 }),
      waitForNextPaint: async () => undefined,
      coverMs: 1,
      revealMs: 1,
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(overlays).toHaveLength(0);
  });

  it('cleans up overlay and restores body overflow', async () => {
    const { doc, overlays, body } = createDocHarness();
    body.style.overflow = 'auto';

    await runAppEnterTransition(vi.fn(), {
      doc,
      prefersReducedMotion: () => false,
      getViewportSize: () => ({ width: 390, height: 844 }),
      waitForNextPaint: async () => undefined,
      coverMs: 1,
      revealMs: 1,
    });

    expect(overlays).toHaveLength(0);
    expect(body.style.overflow).toBe('auto');
  });

  it('falls back to update when document body is missing', async () => {
    const update = vi.fn();
    await runAppEnterTransition(update, {
      doc: { body: null } as unknown as Document,
      prefersReducedMotion: () => false,
    });
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe('LoginFlow iris wiring contract', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const loginFlowPath = path.resolve(here, '../../pages/login/ui/LoginFlow.tsx');
  const source = readFileSync(loginFlowPath, 'utf8');

  it('calls Iris only after successful authApi.login', () => {
    const loginIdx = source.indexOf('await authApi.login');
    const irisCallIdx = source.indexOf('await runAppEnterTransition');
    expect(loginIdx).toBeGreaterThan(-1);
    expect(irisCallIdx).toBeGreaterThan(loginIdx);
  });

  it('does not call Iris in the login catch path (errors / ACCOUNT_PENDING)', () => {
    const catchIdx = source.indexOf('} catch (loginError)');
    expect(catchIdx).toBeGreaterThan(-1);
    const catchBlock = source.slice(catchIdx);
    expect(catchBlock.includes('runAppEnterTransition')).toBe(false);
  });
});
