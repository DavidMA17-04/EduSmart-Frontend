import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ScanLine } from 'lucide-react';
import { sessionHasPermission } from '@/shared/auth';
import {
  DEPARTURE_PERMISSIONS,
  ScheduledPermitsList,
  SecurityTerminalCard,
  type TerminalPrefill,
} from '@/features/student-departures';
import '@/features/student-departures/ui/security.css';
import { SecurityPageHeader } from './SecurityPageHeader';

/** /security/check-out — terminal de caseta a pantalla completa. */
export function SecurityCheckOutPage() {
  const location = useLocation();
  const initial = (location.state as { prefill?: Omit<TerminalPrefill, 'nonce'> } | null)?.prefill;
  // Precarga al llegar desde la lista de permisos ("Validar salida").
  const [prefill, setPrefill] = useState<TerminalPrefill | null>(initial ? { ...initial, nonce: Date.now() } : null);
  const canView = sessionHasPermission(DEPARTURE_PERMISSIONS.viewHistory);
  return (
    <div className="edu-security bg-slate-50 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <SecurityPageHeader
          icon={ScanLine}
          title="Terminal de salida"
          subtitle="Escanee o digite la cédula del estudiante y la de quien lo retira."
        />
        <div className={`grid gap-5 items-start ${canView ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : ''}`}>
          <SecurityTerminalCard prefill={prefill} large />
          {canView && (
            <ScheduledPermitsList
              selectedId={prefill?.scheduledPermitId ?? null}
              onSelect={(permit) =>
                setPrefill({ studentIdentifier: permit.student.nationalId, scheduledPermitId: permit.id, nonce: Date.now() })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
