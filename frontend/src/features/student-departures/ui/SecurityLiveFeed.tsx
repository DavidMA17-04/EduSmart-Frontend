import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, CheckCircle2, ShieldX } from 'lucide-react';
import { formatRelative, formatTime } from '../model/format';
import { useSecurityDeparturesHistory } from '../model/useDepartures';
import { CARD } from './styles';

const WINDOW_MINUTES = 30;

/** Línea de tiempo de los últimos 30 minutos: salidas y alertas. */
export function SecurityLiveFeed() {
  // El inicio de la ventana se recalcula cada minuto para que la consulta avance.
  const [since, setSince] = useState(() => windowStart());
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setSince(windowStart());
      tick((n) => n + 1);
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const filters = useMemo(() => ({ since, page: 1, limit: 25 }), [since]);
  const { data, isLoading } = useSecurityDeparturesHistory(filters, { refetchInterval: 15_000 });
  const events = data?.items ?? [];

  return (
    <section className={CARD} aria-labelledby="feed-title">
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <h2 data-preserve-case id="feed-title" className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0d2346]" />
          Eventos en vivo
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
          </span>
          Últimos {WINDOW_MINUTES} min
        </span>
      </div>
      <div className="max-h-96 overflow-y-auto smooth-scroll px-4 py-3" aria-live="polite">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Sin actividad en los últimos {WINDOW_MINUTES} minutos.</p>
        ) : (
          <ol className="relative border-l border-slate-200 ml-2 space-y-4">
            <AnimatePresence initial={false}>
              {events.map((event) => {
                const ok = event.status === 'AUTHORIZED';
                return (
                  <motion.li
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -8, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="pl-5 relative"
                  >
                    <span
                      className={`absolute -left-[9px] top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center ring-4 ring-white ${
                        ok ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    >
                      {ok ? <CheckCircle2 className="w-3 h-3 text-white" /> : <ShieldX className="w-3 h-3 text-white" />}
                    </span>
                    <p className="text-sm text-slate-800 leading-snug">
                      {ok
                        ? 'Salida autorizada de '
                        : event.guardianLinked
                          ? 'Salida denegada por el guarda: '
                          : 'Alerta: encargado no coincide para '}
                      <span data-preserve-case className="font-semibold">{event.student.fullName}</span>
                    </p>
                    <p className="text-xs text-slate-500" title={formatTime(event.departureTime)}>
                      {formatRelative(event.departureTime)} · {event.securityGuard.fullName}
                    </p>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </section>
  );
}

function windowStart(): string {
  return new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
}
