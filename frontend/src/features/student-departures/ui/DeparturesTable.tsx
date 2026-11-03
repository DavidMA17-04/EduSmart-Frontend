import { AnimatePresence, motion } from 'framer-motion';
import { formatDateTime, formatTime, sectionLabel } from '../model/format';
import type { DepartureHistoryItem } from '../model/types';
import { DepartureStatusBadge, DepartureTypeBadge } from './DepartureBadges';

function presentedBy(item: DepartureHistoryItem): { name: string; detail: string | null } {
  if (item.status === 'AUTHORIZED') {
    return { name: item.guardian?.fullName ?? '—', detail: item.relationship };
  }
  if (item.guardian && item.guardianLinked) return { name: item.guardian.fullName, detail: item.relationship };
  if (item.guardian) return { name: item.guardian.fullName, detail: 'No vinculado' };
  return { name: item.guardianIdentifierMasked ? `Cédula ${item.guardianIdentifierMasked}` : '—', detail: 'No vinculado' };
}

export function DeparturesTable({
  items,
  loading,
  emptyText,
  showDate = false,
  compact = false,
  hideGuard = false,
}: {
  items: DepartureHistoryItem[];
  loading?: boolean;
  emptyText: string;
  showDate?: boolean;
  compact?: boolean;
  /** Oculta la columna Guarda (panel de caseta: el guarda ya es quien opera). */
  hideGuard?: boolean;
}) {
  const showGuard = !compact && !hideGuard;
  if (loading) {
    return (
      <div className="divide-y divide-slate-100">
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-4">
            <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 flex-1 rounded bg-slate-100 animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="px-5 py-6 text-center text-sm text-slate-500">{emptyText}</p>;
  }
  return (
    <>
      {/* Teléfono: tarjetas apiladas, el estado siempre visible sin desplazar. */}
      <ul className="sm:hidden divide-y divide-slate-100">
        {items.map((item) => {
          const by = presentedBy(item);
          return (
            <motion.li key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p data-preserve-case className="font-semibold text-slate-900 truncate">{item.student.fullName}</p>
                  <p className="text-xs text-slate-500 tabular">
                    {item.student.nationalId} · {sectionLabel(item.student)}
                  </p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap tabular pt-0.5">
                  {showDate ? formatDateTime(item.departureTime) : formatTime(item.departureTime)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <DepartureStatusBadge status={item.status} manual={item.status === 'REJECTED' && item.guardianLinked} />
                <DepartureTypeBadge type={item.departureType} fromPermit={Boolean(item.scheduledPermitId) && item.status === 'AUTHORIZED'} />
              </div>
              {!compact && (
                <p className="text-xs text-slate-600">
                  <span data-preserve-case>{by.name}</span>
                  {by.detail && (
                    <span className={item.status === 'REJECTED' && !item.guardianLinked ? 'text-rose-600' : 'text-slate-500'}> · {by.detail}</span>
                  )}
                  {showGuard && <span className="text-slate-400"> · Guarda: {item.securityGuard.fullName}</span>}
                </p>
              )}
            </motion.li>
          );
        })}
      </ul>
    <div className="overflow-x-auto hidden sm:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 tracking-normal border-b border-slate-200">
          <tr>
            <th className="px-5 py-2.5">{showDate ? 'Fecha' : 'Hora'}</th>
            <th className="px-3 py-2.5">Estudiante</th>
            {!compact && <th className="px-3 py-2.5">Retirado por</th>}
            <th className="px-3 py-2.5">Tipo</th>
            <th className="px-3 py-2.5">Estado</th>
            {showGuard && <th className="px-5 py-2.5">Guarda</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const by = presentedBy(item);
              return (
                <motion.tr
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, backgroundColor: 'rgba(13,35,70,0.06)' }}
                  animate={{ opacity: 1, backgroundColor: 'rgba(255,255,255,0)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(index, 10) * 0.025 }}
                  className="hover:bg-slate-50/70"
                >
                  <td className="px-5 py-3 whitespace-nowrap text-slate-600 tabular">
                    {showDate ? formatDateTime(item.departureTime) : formatTime(item.departureTime)}
                  </td>
                  <td className="px-3 py-3 min-w-[10rem]">
                    <p data-preserve-case className="font-semibold text-slate-900">{item.student.fullName}</p>
                    <p className="text-xs text-slate-500 tabular">
                      {item.student.nationalId} · {sectionLabel(item.student)}
                    </p>
                  </td>
                  {!compact && (
                    <td className="px-3 py-3 min-w-[9rem]">
                      <p data-preserve-case className="text-slate-800">{by.name}</p>
                      {by.detail && (
                        <p className={`text-xs ${item.status === 'REJECTED' && !item.guardianLinked ? 'text-rose-600' : 'text-slate-500'}`}>{by.detail}</p>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <DepartureTypeBadge type={item.departureType} fromPermit={Boolean(item.scheduledPermitId) && item.status === 'AUTHORIZED'} />
                  </td>
                  <td className="px-3 py-3">
                    <DepartureStatusBadge status={item.status} manual={item.status === 'REJECTED' && item.guardianLinked} />
                  </td>
                  {showGuard && <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{item.securityGuard.fullName}</td>}
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
    </>
  );
}
