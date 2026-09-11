import './appEnterTransition.css';

const COVER_MS = 450;
const REVEAL_MS = 550;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const OVERLAY_CLASS = 'edusmart-app-enter-curtain';
const IRIS_CLASS = 'edusmart-app-enter-curtain__iris';
const COVERED_CLASS = 'is-covered';
/** Absolute overscan so corners never peek through under zoom/rounding. */
const COVER_OVERSCAN_PX = 48;
/** Relative overscan for ultrawide / large viewports. */
const COVER_OVERSCAN_FACTOR = 1.25;

/** Normalized viewport origin (0–1). Default center. */
export type AppEnterOrigin = {
  x: number;
  y: number;
};

export type RunAppEnterTransitionOptions = {
  origin?: AppEnterOrigin;
  coverMs?: number;
  revealMs?: number;
  prefersReducedMotion?: () => boolean;
  doc?: Document;
  getViewportSize?: () => { width: number; height: number };
  waitForNextPaint?: () => Promise<void>;
};

type SizeSource = {
  getBoundingClientRect?: () => DOMRect;
};

type WindowMetrics = {
  innerWidth: number;
  innerHeight: number;
  visualViewport?: { width: number; height: number } | null;
};

/**
 * Largest layout size we can observe for the viewport / overlay box.
 * Prefer the painted overlay rect; include visualViewport when present.
 */
export function resolveCoverBoxSize(
  overlayEl?: SizeSource,
  win: WindowMetrics | null = typeof window !== 'undefined'
    ? (window as WindowMetrics)
    : null,
  rootEl: Pick<Element, 'clientWidth' | 'clientHeight'> | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
): { width: number; height: number } {
  const rect = overlayEl?.getBoundingClientRect?.();
  const rectW = rect && Number.isFinite(rect.width) ? rect.width : 0;
  const rectH = rect && Number.isFinite(rect.height) ? rect.height : 0;
  const innerW = win?.innerWidth ?? 0;
  const innerH = win?.innerHeight ?? 0;
  const visualW = win?.visualViewport?.width ?? 0;
  const visualH = win?.visualViewport?.height ?? 0;
  const clientW = rootEl?.clientWidth ?? 0;
  const clientH = rootEl?.clientHeight ?? 0;

  return {
    width: Math.max(rectW, innerW, visualW, clientW, 1),
    height: Math.max(rectH, innerH, visualH, clientH, 1),
  };
}

/**
 * Radius (px) from origin that covers all four box corners, plus overscan.
 */
export function coverRadiusPx(
  width: number,
  height: number,
  origin: AppEnterOrigin = { x: 0.5, y: 0.5 },
): number {
  const ox = origin.x * width;
  const oy = origin.y * height;
  const maxCorner = Math.max(
    Math.hypot(ox, oy),
    Math.hypot(width - ox, oy),
    Math.hypot(ox, height - oy),
    Math.hypot(width - ox, height - oy),
  );
  return Math.ceil(maxCorner * COVER_OVERSCAN_FACTOR) + COVER_OVERSCAN_PX;
}

function defaultPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function defaultWaitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'function') {
      resolve();
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function invokeUpdateOnce(
  update: () => void | Promise<void>,
  state: { ran: boolean },
): Promise<void> {
  if (state.ran) return;
  state.ran = true;
  await update();
}

function placeIrisDisk(
  iris: HTMLElement,
  box: { width: number; height: number },
  origin: AppEnterOrigin,
  radius: number,
): void {
  const diameter = radius * 2;
  const centerX = origin.x * box.width;
  const centerY = origin.y * box.height;
  iris.style.width = `${diameter}px`;
  iris.style.height = `${diameter}px`;
  iris.style.left = `${centerX - radius}px`;
  iris.style.top = `${centerY - radius}px`;
}

/**
 * Cover → update (e.g. navigate) → wait for paint → reveal.
 * Guarantees `update` runs exactly once. Animation failures fall back to update.
 *
 * Technique: scaled circular disk (border-radius 50% + transform scale).
 * After cover finishes, the host is forced to a solid full-viewport fill so no
 * corner can remain visible during navigation, regardless of disk math.
 */
export async function runAppEnterTransition(
  update: () => void | Promise<void>,
  options: RunAppEnterTransitionOptions = {},
): Promise<void> {
  const prefersReducedMotion = options.prefersReducedMotion ?? defaultPrefersReducedMotion;
  const doc = options.doc ?? (typeof document !== 'undefined' ? document : undefined);
  const waitForNextPaint = options.waitForNextPaint ?? defaultWaitForNextPaint;
  const origin = options.origin ?? { x: 0.5, y: 0.5 };
  const coverMs = options.coverMs ?? COVER_MS;
  const revealMs = options.revealMs ?? REVEAL_MS;

  const updateState = { ran: false };
  const ensureUpdate = () => invokeUpdateOnce(update, updateState);

  if (prefersReducedMotion()) {
    await ensureUpdate();
    return;
  }

  if (!doc?.body) {
    await ensureUpdate();
    return;
  }

  let overlay: HTMLDivElement | null = null;
  let iris: HTMLDivElement | null = null;
  let previousOverflow = '';

  const cleanup = () => {
    if (overlay?.isConnected) {
      overlay.remove();
    }
    overlay = null;
    iris = null;
    if (doc.body) {
      doc.body.style.overflow = previousOverflow;
    }
  };

  try {
    overlay = doc.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('aria-hidden', 'true');

    iris = doc.createElement('div');
    iris.className = IRIS_CLASS;
    overlay.appendChild(iris);

    previousOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';
    doc.body.appendChild(overlay);

    const measured = options.getViewportSize
      ? options.getViewportSize()
      : resolveCoverBoxSize(overlay);
    const radius = coverRadiusPx(measured.width, measured.height, origin);
    placeIrisDisk(iris, measured, origin, radius);

    if (typeof iris.animate !== 'function') {
      cleanup();
      await ensureUpdate();
      return;
    }

    const coverAnimation = iris.animate(
      [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
      {
        duration: coverMs,
        easing: EASING,
        fill: 'forwards',
      },
    );
    await coverAnimation.finished;

    // Hard guarantee: solid full-viewport fill while the destination mounts.
    overlay.classList.add(COVERED_CLASS);
    iris.style.visibility = 'hidden';

    await ensureUpdate();
    await waitForNextPaint();

    if (!overlay.isConnected || !iris.isConnected) {
      return;
    }

    coverAnimation.cancel?.();
    overlay.classList.remove(COVERED_CLASS);
    iris.style.visibility = 'visible';
    iris.style.transform = 'scale(1)';

    const revealAnimation = iris.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0)' }],
      {
        duration: revealMs,
        easing: EASING,
        fill: 'forwards',
      },
    );
    await revealAnimation.finished;
    cleanup();
  } catch {
    cleanup();
    await ensureUpdate();
  }
}
