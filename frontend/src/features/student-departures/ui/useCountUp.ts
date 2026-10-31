import { useEffect, useRef, useState } from 'react';

/** Contador animado (ease-out) para los indicadores. */
export function useCountUp(target: number, duration = 650): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const initial = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(initial + (target - initial) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      from.current = target;
    };
  }, [target, duration]);

  return value;
}
