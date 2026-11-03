import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, ChevronDown, Loader2, Plus, ScanLine } from 'lucide-react';
import { sessionHasPermission } from '@/shared/auth';
import { useToast } from '@/shared/ui';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD,
  DEPARTURE_PERMISSIONS,
  INPUT,
  LABEL,
  PermitBadge,
  securityBasePath,
  useCreatePermit,
  useScheduledPermits,
  type ScheduledPermit,
  type ScheduledPermitStatus,
} from '@/features/student-departures';
import { costaRicaToday, formatClock, sectionLabel } from '@/features/student-departures/model/format';
import '@/features/student-departures/ui/security.css';
import { SecurityPageHeader } from './SecurityPageHeader';

const STATUS_TABS: { value: ScheduledPermitStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'COMPLETED', label: 'Completados' },
  { value: 'EXPIRED', label: 'Vencidos' },
];

const STATUS_BADGE: Record<ScheduledPermitStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-brand-primary-light text-brand-primary border-brand-primary/25' },
  COMPLETED: { label: 'Completado', className: 'bg-brand-green-light text-brand-green border-brand-green/30' },
  EXPIRED: { label: 'Vencido', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function PermitStatus({ status }: { status: ScheduledPermitStatus }) {
  if (status === 'PENDING') return <PermitBadge />;
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_BADGE[status].className}`}>
      {STATUS_BADGE[status].label}
    </span>
  );
}

function ValidateButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${BTN_PRIMARY} !px-3 !py-1.5 !text-xs ml-auto`}>
      <ScanLine className="w-3.5 h-3.5" />
      Validar salida
    </button>
  );
}

function CreatePermitForm({ onCreated }: { onCreated: () => void }) {
  const toast = useToast();
  const create = useCreatePermit();
  const [student, setStudent] = useState('');
  const [date, setDate] = useState(costaRicaToday());
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!student.trim() || !time || reason.trim().length < 3) {
      setError('Complete la cédula del estudiante, la hora y el motivo.');
      return;
    }
    setError(null);
    create.mutate(
      { studentIdentifier: student.trim(), permitDate: date, departureTime: time, reason: reason.trim() },
      {
        onSuccess: (permit) => {
          toast.push(`Permiso programado para ${permit.student.fullName}.`, 'success');
          setStudent('');
          setTime('');
          setReason('');
          onCreated();
        },
        onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo programar el permiso.'),
      },
    );
  };

  return (
    <form onSubmit={submit} className="p-5 grid gap-4 md:grid-cols-[1.2fr_1fr_0.8fr] border-t border-slate-100">
      <div>
        <label htmlFor="permit-student" className={LABEL}>Cédula del estudiante *</label>
        <input id="permit-student" value={student} onChange={(e) => setStudent(e.target.value)} inputMode="numeric" className={INPUT} placeholder="Ej. 300000020" />
      </div>
      <div>
        <label htmlFor="permit-date" className={LABEL}>Fecha *</label>
        <input id="permit-date" type="date" min={costaRicaToday()} value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
      </div>
      <div>
        <label htmlFor="permit-time" className={LABEL}>Hora de salida *</label>
        <input id="permit-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={INPUT} />
      </div>
      <div className="md:col-span-3">
        <label htmlFor="permit-reason" className={LABEL}>Motivo *</label>
        <input id="permit-reason" value={reason} maxLength={255} onChange={(e) => setReason(e.target.value)} className={INPUT} placeholder="Ej. Cita médica en la CCSS" />
      </div>
      {error && <p className="md:col-span-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2" role="alert">{error}</p>}
      <div className="md:col-span-3 flex gap-2">
        <button type="submit" disabled={create.isPending} className={BTN_PRIMARY}>
          {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
          Programar permiso
        </button>
      </div>
    </form>
  );
}

/** /security/permits — permisos autorizados por Dirección / Coordinación. */
export function SecurityPermitsPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(costaRicaToday());
  const [status, setStatus] = useState<ScheduledPermitStatus | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const canManage = sessionHasPermission(DEPARTURE_PERMISSIONS.managePermits);
  const canValidate = sessionHasPermission(DEPARTURE_PERMISSIONS.validate);
  const { data, isLoading, isFetching } = useScheduledPermits({ date, status: status === 'ALL' ? undefined : status });
  const permits = data ?? [];
  const isToday = date === costaRicaToday();
  const canUse = (permit: ScheduledPermit) => canValidate && permit.status === 'PENDING' && isToday;
  const goValidate = (permit: ScheduledPermit) =>
    navigate(`${securityBasePath()}/check-out`, {
      state: { prefill: { studentIdentifier: permit.student.nationalId, scheduledPermitId: permit.id } },
    });

  return (
    <div className="edu-security bg-slate-50 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <SecurityPageHeader
          icon={CalendarCheck}
          title="Permisos programados"
          subtitle="Salidas anticipadas autorizadas previamente por Dirección o Coordinación."
          actions={
            canManage ? (
              <button type="button" onClick={() => setShowForm((v) => !v)} className={BTN_PRIMARY}>
                <Plus className="w-4 h-4" />
                Programar permiso
                <ChevronDown className={`w-4 h-4 transition-transform ${showForm ? 'rotate-180' : ''}`} />
              </button>
            ) : undefined
          }
        />

        {!canManage ? (
          <p className={`${CARD} px-4 py-3 text-sm text-slate-600`}>
            Para registrar un permiso programado se requiere el permiso «gestión de permisos de salida» (roles Administración / Dirección).
          </p>
        ) : null}

        <AnimatePresence initial={false}>
          {canManage && showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`${CARD} overflow-hidden`}>
              <div className="px-5 py-3.5">
                <h2 className="text-sm font-bold text-slate-900">Nuevo permiso de salida</h2>
                <p className="text-xs text-slate-500">El guarda lo verá en su panel el día indicado.</p>
              </div>
              <CreatePermitForm onCreated={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <section className={CARD}>
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatus(tab.value)}
                  className={`relative text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${status === tab.value ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {status === tab.value && <motion.span layoutId="permit-tab" className="absolute inset-0 bg-brand-primary rounded-md" />}
                  <span className="relative">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <div>
                <label htmlFor="permits-date" className={LABEL}>Fecha</label>
                <input id="permits-date" type="date" value={date} onChange={(e) => setDate(e.target.value || costaRicaToday())} className={`${INPUT} !py-2`} />
              </div>
              {!isToday && (
                <button type="button" onClick={() => setDate(costaRicaToday())} className={`${BTN_SECONDARY} !py-2`}>
                  Hoy
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />)}</div>
          ) : permits.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No hay permisos para esta fecha y estado.</p>
          ) : (
            <div className={`transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
              {/* Teléfono: tarjetas; estado y acción siempre visibles. */}
              <ul className="sm:hidden divide-y divide-slate-100">
                {permits.map((permit) => (
                  <motion.li key={permit.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p data-preserve-case className="font-semibold text-slate-900">{permit.student.fullName}</p>
                        <p className="text-xs text-slate-500 tabular">{permit.student.nationalId} · {sectionLabel(permit.student)}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-800 tabular whitespace-nowrap">{formatClock(permit.departureTime)}</span>
                    </div>
                    <p className="text-sm text-slate-700">{permit.reason}</p>
                    <p className="text-xs text-slate-500">Autorizado por {permit.authorizedBy.fullName}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <PermitStatus status={permit.status} />
                      {canUse(permit) && <ValidateButton onClick={() => goValidate(permit)} />}
                    </div>
                  </motion.li>
                ))}
              </ul>
              <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 tracking-normal border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-2.5">Hora</th>
                    <th className="px-3 py-2.5">Estudiante</th>
                    <th className="px-3 py-2.5">Motivo</th>
                    <th className="px-3 py-2.5">Autorizado por</th>
                    <th className="px-3 py-2.5">Estado</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permits.map((permit, index) => (
                    <motion.tr key={permit.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 10) * 0.03 }} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap tabular">{formatClock(permit.departureTime)}</td>
                      <td className="px-3 py-3">
                        <p data-preserve-case className="font-semibold text-slate-900">{permit.student.fullName}</p>
                        <p className="text-xs text-slate-500 tabular">{permit.student.nationalId} · {sectionLabel(permit.student)}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-700 max-w-xs">{permit.reason}</td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{permit.authorizedBy.fullName}</td>
                      <td className="px-3 py-3">
                        <PermitStatus status={permit.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canUse(permit) && <ValidateButton onClick={() => goValidate(permit)} />}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
