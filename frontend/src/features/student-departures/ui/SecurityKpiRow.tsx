import { Clock, FileCheck, LogOut, ShieldAlert } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/shared/ui';
import { useSecurityKPIs } from '../model/useDepartures';
import { useCountUp } from './useCountUp';

function CountValue({ value, loading }: { value: number; loading: boolean }) {
  const shown = useCountUp(value);
  if (loading) {
    return <span className="inline-block h-7 w-10 rounded bg-slate-100 animate-pulse" />;
  }
  return <>{shown}</>;
}

export function SecurityKpiRow() {
  const { data, isLoading } = useSecurityKPIs();

  return (
    <KpiGrid columns={4}>
      <KpiCard
        icon={LogOut}
        label="Salidas del día"
        tone="navy"
        value={<CountValue loading={isLoading} value={data?.totalDepartures ?? 0} />}
        hint="Autorizadas en la jornada"
      />
      <KpiCard
        icon={Clock}
        label="Salidas anticipadas"
        tone="navy"
        value={<CountValue loading={isLoading} value={data?.earlyDepartures ?? 0} />}
        hint={
          data?.emergencyDepartures
            ? `${data.emergencyDepartures} por emergencia`
            : 'Antes del horario regular'
        }
        badge={(data?.earlyDepartures ?? 0) > 0 ? 'Hoy' : undefined}
      />
      <KpiCard
        icon={ShieldAlert}
        label="Intentos denegados"
        tone="danger"
        value={<CountValue loading={isLoading} value={data?.deniedAttempts ?? 0} />}
        hint="Bloqueadas en caseta"
        badge={(data?.deniedAttempts ?? 0) > 0 ? 'Atención' : undefined}
      />
      <KpiCard
        icon={FileCheck}
        label="Permisos programados"
        tone="gold"
        value={<CountValue loading={isLoading} value={data?.pendingPermits ?? 0} />}
        hint="Pendientes para hoy"
      />
    </KpiGrid>
  );
}
