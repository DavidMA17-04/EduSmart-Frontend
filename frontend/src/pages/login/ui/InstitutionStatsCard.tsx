import { useEffect, useId, useRef, useState } from 'react';
import { GraduationCap, Layers, TrendingUp, Users, Wrench } from 'lucide-react';
import { publicApi, type CampusSnapshot } from '@/features/public';
import {
  buildInstitutionMetrics,
  formatInstitutionCount,
  INSTITUTION_STATS_SLIDE_MS,
  INSTITUTION_STATS_TRANSITION_MS,
  prefersReducedMotion,
} from './institutionStats';
import styles from './InstitutionStatsCard.module.css';

type Phase = 'idle' | 'exiting' | 'entering';

function metricIcon(key: string) {
  switch (key) {
    case 'specialties':
      return GraduationCap;
    case 'workshops':
      return Wrench;
    case 'sections':
      return Layers;
    default:
      return Users;
  }
}

function useCountUp(target: number | null, enabled: boolean): number | null {
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    if (target == null) {
      setDisplay(null);
      return;
    }
    if (!enabled) {
      setDisplay(target);
      return;
    }

    let frameId = 0;
    const durationMs = 700;
    const start = performance.now();
    setDisplay(0);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, enabled]);

  return display;
}

export const InstitutionStatsCard = () => {
  const labelId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const timerRemaining = useRef(INSTITUTION_STATS_SLIDE_MS);

  const [snapshot, setSnapshot] = useState<CampusSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(
    () => typeof document !== 'undefined' && document.visibilityState !== 'visible',
  );
  const [cycle, setCycle] = useState(0);
  const [initialCountDone, setInitialCountDone] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    let active = true;
    publicApi
      .getCampusSnapshot()
      .then((data) => {
        if (active) setSnapshot(data);
      })
      .catch(() => {
        if (active) setSnapshot(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      setPageHidden(document.visibilityState !== 'visible');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const metrics = buildInstitutionMetrics(snapshot);
  const canRotate = metrics.length > 1;
  const current = metrics.length > 0 ? metrics[Math.min(index, metrics.length - 1)] : null;
  const paused =
    interactionPaused || pageHidden || !canRotate || phase !== 'idle' || loading;

  const countUpEnabled = Boolean(current) && !initialCountDone && !reduceMotion && index === 0;
  const displayed = useCountUp(current?.value ?? null, countUpEnabled);

  useEffect(() => {
    if (
      countUpEnabled &&
      current &&
      displayed != null &&
      displayed === current.value
    ) {
      setInitialCountDone(true);
    }
    if (!countUpEnabled && current && !initialCountDone) {
      setInitialCountDone(true);
    }
  }, [countUpEnabled, current, displayed, initialCountDone]);

  const goNext = () => {
    if (!canRotate || transitioning.current) return;

    if (reduceMotion) {
      setIndex((prev) => (prev + 1) % metrics.length);
      timerRemaining.current = INSTITUTION_STATS_SLIDE_MS;
      setCycle((value) => value + 1);
      return;
    }

    transitioning.current = true;
    setPhase('exiting');
    window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % metrics.length);
      setPhase('entering');
      window.setTimeout(() => {
        setPhase('idle');
        timerRemaining.current = INSTITUTION_STATS_SLIDE_MS;
        setCycle((value) => value + 1);
        transitioning.current = false;
      }, INSTITUTION_STATS_TRANSITION_MS);
    }, INSTITUTION_STATS_TRANSITION_MS);
  };

  // Hold dwell time with real pause/resume (no progress bar).
  useEffect(() => {
    if (!canRotate) return;
    if (paused) return;

    const startedAt = performance.now();
    const budget = timerRemaining.current;
    const timerId = window.setTimeout(() => {
      timerRemaining.current = INSTITUTION_STATS_SLIDE_MS;
      goNext();
    }, budget);

    return () => {
      window.clearTimeout(timerId);
      const elapsed = performance.now() - startedAt;
      timerRemaining.current = Math.max(0, budget - elapsed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRotate, paused, cycle, index, reduceMotion, metrics.length]);

  if (loading || !current) {
    return null;
  }

  const Icon = metricIcon(current.key);
  const valueText =
    displayed == null ? formatInstitutionCount(current.value) : formatInstitutionCount(displayed);
  const fadeClass =
    phase === 'exiting'
      ? styles.isExiting
      : phase === 'entering'
        ? styles.isEntering
        : reduceMotion
          ? styles.isInstant
          : '';

  return (
    <div
      ref={cardRef}
      aria-labelledby={labelId}
      className={styles.card}
      onBlur={(event) => {
        if (!cardRef.current?.contains(event.relatedTarget as Node | null)) {
          setInteractionPaused(false);
        }
      }}
      onFocus={() => setInteractionPaused(true)}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => {
        const focused = cardRef.current?.contains(document.activeElement) ?? false;
        setInteractionPaused(focused);
      }}
      role="group"
      tabIndex={0}
    >
      <div className={`${styles.fadeSurface} ${fadeClass}`.trim()}>
        <span aria-hidden="true" className={styles.icon}>
          <Icon size={16} />
        </span>
        <div className={styles.body}>
          <strong className={styles.value}>{valueText}</strong>
          <span className={styles.label} id={labelId}>
            {current.label}
          </span>
        </div>
      </div>
      <span aria-hidden="true" className={styles.badge}>
        <TrendingUp className={styles.trend} size={14} strokeWidth={2.4} />
      </span>
    </div>
  );
};
