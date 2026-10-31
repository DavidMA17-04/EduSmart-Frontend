import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { sessionHasPermission } from '@/shared/auth';
import {
  DEPARTURE_PERMISSIONS,
  ScheduledPermitsList,
  SecurityKpiRow,
  SecurityLiveFeed,
  SecurityTerminalCard,
  TodayDeparturesTable,
  type TerminalPrefill,
} from '@/features/student-departures';
import '@/features/student-departures/ui/security.css';
import { SecurityPageHeader, todayLabel } from './SecurityPageHeader';

/** /security/dashboard — KPIs, terminal rápida, bitácora del día, permisos y feed. */
export function SecurityDashboardPage() {
  const [prefill, setPrefill] = useState<TerminalPrefill | null>(null);
  const canValidate = sessionHasPermission(DEPARTURE_PERMISSIONS.validate);
  const canView = sessionHasPermission(DEPARTURE_PERMISSIONS.viewHistory);

  if (!canValidate && !canView) {
    return (
      <div className="edu-security bg-slate-50 min-h-full p-8">
        <p className="text-sm text-slate-600">Su cuenta no tiene permisos del módulo de salidas. Contacte a la administración.</p>
      </div>
    );
  }

  return (
    <div className="edu-security bg-slate-50 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-5">
        <SecurityPageHeader
          icon={ShieldCheck}
          title="Control de salidas"
          subtitle={`${todayLabel()} · Turno de seguridad institucional`}
        />

        {canView && <SecurityKpiRow />}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-start">
          <div className="space-y-5 min-w-0">
            {canValidate && <SecurityTerminalCard prefill={prefill} />}
            {canView && <TodayDeparturesTable />}
          </div>
          {canView && (
            <aside className="space-y-5 min-w-0">
              <ScheduledPermitsList
                selectedId={prefill?.scheduledPermitId ?? null}
                onSelect={
                  canValidate
                    ? (permit) =>
                        setPrefill({
                          studentIdentifier: permit.student.nationalId,
                          scheduledPermitId: permit.id,
                          nonce: Date.now(),
                        })
                    : undefined
                }
              />
              <SecurityLiveFeed />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
