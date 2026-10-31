import { motion } from 'framer-motion';
import { Clock, FileCheck, LogOut, ShieldAlert, type LucideIcon } from 'lucide-react';
import { useSecurityKPIs } from '../model/useDepartures';
import { CARD } from './styles';
import { useCountUp } from './useCountUp';

interface KpiProps {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: string;
  badge?: string;
  pulse?: boolean;
  index: number;
  loading: boolean;
}

function Kpi({ label, value, hint, icon: Icon, tone, badge, pulse, index, loading }: KpiProps) {
  const shown = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`${CARD} p-4 flex items-start gap-3`}
    >
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          {loading ? (
            <span className="h-7 w-10 rounded bg-slate-100 animate-pulse" />
          ) : (
            <motion.span
              key={value}
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-slate-900 tabular"
            >
              {shown}
            </motion.span>
          )}
          {badge && value > 0 && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge} ${pulse ? 'animate-pulse' : ''}`}>
              {pulse ? 'Atención' : 'Hoy'}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
      </div>
    </motion.div>
  );
}

export function SecurityKpiRow() {
  const { data, isLoading } = useSecurityKPIs();
  const kpis = [
    {
      label: 'Salidas del día',
      value: data?.totalDepartures ?? 0,
      hint: 'Autorizadas en la jornada',
      icon: LogOut,
      tone: 'bg-[#0d2346]/[0.07] text-[#0d2346]',
    },
    {
      label: 'Salidas anticipadas',
      value: data?.earlyDepartures ?? 0,
      hint: data?.emergencyDepartures ? `${data.emergencyDepartures} por emergencia` : 'Antes del horario regular',
      icon: Clock,
      tone: 'bg-blue-50 text-blue-700',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Intentos denegados',
      value: data?.deniedAttempts ?? 0,
      hint: 'Bloqueadas en caseta',
      icon: ShieldAlert,
      tone: 'bg-rose-50 text-rose-700',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      pulse: true,
    },
    {
      label: 'Permisos programados',
      value: data?.pendingPermits ?? 0,
      hint: 'Pendientes para hoy',
      icon: FileCheck,
      tone: 'bg-purple-50 text-purple-700',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {kpis.map((kpi, index) => (
        <Kpi key={kpi.label} {...kpi} index={index} loading={isLoading} />
      ))}
    </div>
  );
}
