import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Clock3, Download, Eye, Loader2, Users } from 'lucide-react';
import { useCommunicationStats } from '@/hooks/useCommunications';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatDateTime, initials } from './communicationFormat';
import { AnimatedModal } from './AnimatedModal';

interface Props {
  communicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

const StatTile: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  hint: string;
  tone: string;
  icon: React.ReactNode;
  delay: number;
}> = ({ label, value, suffix = '', hint, tone, icon, delay }) => {
  const animated = useAnimatedNumber(value);
  const display = suffix === '%' ? animated.toFixed(animated % 1 === 0 ? 0 : 1) : Math.round(animated);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <span className={`text-2xl font-bold mt-1.5 block tabular-nums ${tone}`}>
        {display}
        {suffix}
      </span>
      <span className="text-[11px] text-slate-400">{hint}</span>
    </motion.div>
  );
};

const ProgressRow: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
      <span>{label}</span>
      <span className="tabular-nums">{value}%</span>
    </div>
    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </div>
  </div>
);

export const CommunicationStatsModal: React.FC<Props> = ({ communicationId, isOpen, onClose }) => {
  const { data: stats, isLoading, isError } = useCommunicationStats(isOpen ? communicationId : null);

  const handleExportCSV = () => {
    if (!stats) return;
    const headers = ['Usuario', 'Correo', 'Fecha de lectura', 'Acuse de recibo'];
    const rows = stats.readers.map((r) => [
      csvCell(r.fullName),
      csvCell(r.email),
      csvCell(formatDateTime(r.readAt)),
      csvCell(r.acknowledgedAt ? formatDateTime(r.acknowledgedAt) : stats.requiresAcknowledgment ? 'Pendiente' : 'No requerido'),
    ]);
    const csv = '﻿' + [headers.map(csvCell).join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lecturas_${stats.title.replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatedModal
      isOpen={isOpen && Boolean(communicationId)}
      onClose={onClose}
      size="xl"
      icon={<BarChart3 className="w-5 h-5" />}
      title="Seguimiento de lectura"
      subtitle={stats?.title ?? 'Cargando indicadores…'}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            {stats && stats.readers.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar nómina (CSV)
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="p-5 sm:p-6 space-y-5 bg-slate-50/60 min-h-[280px]">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-sm text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#0d2346]" />
            Calculando indicadores de lectura…
          </div>
        ) : isError || !stats ? (
          <div className="py-16 text-center text-sm text-slate-500">No se pudieron cargar las estadísticas.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Audiencia" value={stats.totalAudience} hint="usuarios alcanzados" tone="text-slate-900" icon={<Users className="w-4 h-4" />} delay={0} />
              <StatTile label="Lecturas" value={stats.totalReads} hint="lectores únicos" tone="text-[#0d2346]" icon={<Eye className="w-4 h-4" />} delay={0.05} />
              <StatTile label="Tasa de lectura" value={stats.readRate} suffix="%" hint="de la audiencia" tone="text-emerald-600" icon={<BarChart3 className="w-4 h-4" />} delay={0.1} />
              <StatTile
                label="Acuses"
                value={stats.totalAcknowledged}
                hint={stats.requiresAcknowledgment ? `${stats.ackRate}% de los lectores` : 'No obligatorio'}
                tone="text-amber-600"
                icon={<CheckCircle2 className="w-4 h-4" />}
                delay={0.15}
              />
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 shadow-sm">
              <ProgressRow label="Alcance de lectura" value={stats.readRate} color="bg-[#0d2346]" />
              {stats.requiresAcknowledgment && (
                <ProgressRow label="Confirmaciones sobre lectores" value={stats.ackRate} color="bg-emerald-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Registro nominal de lecturas ({stats.readers.length})
                </h3>
              </div>

              {stats.readers.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                  Aún nadie ha abierto este comunicado.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  <ul className="divide-y divide-slate-100">
                    {stats.readers.map((reader, index) => (
                      <motion.li
                        key={reader.userId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index, 12) * 0.03 }}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50/70"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {initials(reader.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{reader.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{reader.email}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                            <Clock3 className="w-3 h-3" />
                            {formatDateTime(reader.readAt)}
                          </p>
                          {reader.acknowledgedAt ? (
                            <span className="mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Confirmado
                            </span>
                          ) : stats.requiresAcknowledgment ? (
                            <span className="mt-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex">
                              Acuse pendiente
                            </span>
                          ) : null}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AnimatedModal>
  );
};
