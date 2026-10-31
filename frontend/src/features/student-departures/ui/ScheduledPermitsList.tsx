import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, ChevronRight, Clock } from 'lucide-react';
import { formatClock, initials, sectionLabel } from '../model/format';
import type { ScheduledPermit } from '../model/types';
import { useScheduledPermitsToday } from '../model/useDepartures';
import { CARD } from './styles';

/** Permisos pendientes de hoy. Al elegir uno se precarga en la terminal. */
export function ScheduledPermitsList({ onSelect, selectedId }: { onSelect?: (permit: ScheduledPermit) => void; selectedId?: string | null }) {
  const { data, isLoading } = useScheduledPermitsToday();
  const permits = data ?? [];
  return (
    <section className={CARD} aria-labelledby="permits-title">
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <h2 data-preserve-case id="permits-title" className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-purple-700" />
          Permisos programados para hoy
        </h2>
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 tabular">
          {permits.length}
        </span>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : permits.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">No hay permisos pendientes para hoy.</p>
      ) : (
        <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto smooth-scroll">
          <AnimatePresence initial={false}>
            {permits.map((permit, index) => {
              const selected = permit.id === selectedId;
              return (
                <motion.li
                  key={permit.id}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect?.(permit)}
                    disabled={!onSelect}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      selected ? 'bg-purple-50' : 'hover:bg-slate-50'
                    } disabled:cursor-default`}
                  >
                    <span className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {initials(permit.student.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span data-preserve-case className="block text-sm font-semibold text-slate-900 truncate">
                        {permit.student.fullName}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">
                        {sectionLabel(permit.student)} · {permit.reason}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatClock(permit.departureTime)}
                    </span>
                    {onSelect && <ChevronRight className="w-4 h-4 text-slate-300" />}
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
