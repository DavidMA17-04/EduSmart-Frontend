import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  CheckCircle2,
  IdCard,
  Loader2,
  RotateCcw,
  ScanLine,
  ShieldX,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { sessionHasPermission } from '@/shared/auth';
import { useToast } from '@/shared/ui';
import { formatClock, formatTime, initials, sectionLabel } from '../model/format';
import { DEPARTURE_PERMISSIONS } from '../model/permissions';
import type { DepartureType, GuardianValidationResult } from '../model/types';
import { useRegisterDeparture, useValidateGuardian } from '../model/useDepartures';
import { DepartureStatusBadge, PermitBadge } from './DepartureBadges';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, CARD, INPUT, LABEL } from './styles';

export interface TerminalPrefill {
  studentIdentifier: string;
  scheduledPermitId?: string;
  /** Cambia en cada selección para volver a aplicar la misma precarga. */
  nonce: number;
}

const TYPES: DepartureType[] = ['REGULAR', 'EARLY', 'EMERGENCY'];
const TYPE_SHORT_LABEL: Record<DepartureType, string> = {
  REGULAR: 'Regular',
  EARLY: 'Anticipada',
  EMERGENCY: 'Emergencia',
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export function SecurityTerminalCard({ prefill, large = false }: { prefill?: TerminalPrefill | null; large?: boolean }) {
  const toast = useToast();
  const validate = useValidateGuardian();
  const register = useRegisterDeparture();
  const canRegister = sessionHasPermission(DEPARTURE_PERMISSIONS.create);

  const [studentId, setStudentId] = useState('');
  const [guardianId, setGuardianId] = useState('');
  const [result, setResult] = useState<GuardianValidationResult | null>(null);
  const [departureType, setDepartureType] = useState<DepartureType>('REGULAR');
  const [reason, setReason] = useState('');
  const [usePermit, setUsePermit] = useState(true);
  const [permitId, setPermitId] = useState<string | undefined>();
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<null | 'AUTHORIZED' | 'REJECTED'>(null);

  const studentRef = useRef<HTMLInputElement>(null);
  const guardianRef = useRef<HTMLInputElement>(null);

  const reset = (focus = true) => {
    setStudentId('');
    setGuardianId('');
    setResult(null);
    setDepartureType('REGULAR');
    setReason('');
    setUsePermit(true);
    setPermitId(undefined);
    setRejecting(false);
    setRejectReason('');
    setFormError(null);
    validate.reset();
    if (focus) window.setTimeout(() => studentRef.current?.focus(), 50);
  };

  // Precarga desde la lista de permisos programados.
  useEffect(() => {
    if (!prefill) return;
    reset(false);
    setStudentId(prefill.studentIdentifier);
    setPermitId(prefill.scheduledPermitId);
    setDepartureType(prefill.scheduledPermitId ? 'EARLY' : 'REGULAR');
    window.setTimeout(() => guardianRef.current?.focus(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.nonce]);

  const onValidate = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!studentId.trim() || !guardianId.trim()) {
      setFormError('Ingrese la cédula del estudiante y la del encargado presente.');
      return;
    }
    validate.mutate(
      { studentIdentifier: studentId.trim(), guardianIdentifier: guardianId.trim() },
      {
        onSuccess: (data) => {
          setResult(data);
          setRejecting(false);
          setReason('');
          const permit = data.pendingPermit?.id ?? permitId;
          setPermitId(permit);
          setUsePermit(Boolean(permit));
          setDepartureType(permit ? 'EARLY' : 'REGULAR');
          if (!data.authorized) toast.push('Salida bloqueada: el encargado no coincide.', 'error');
        },
        onError: (error) => {
          setResult(null);
          setFormError(errorMessage(error));
        },
      },
    );
  };

  const finish = (status: 'AUTHORIZED' | 'REJECTED') => {
    setDone(status);
    window.setTimeout(() => {
      setDone(null);
      reset();
    }, 1600);
  };

  const onAuthorize = () => {
    if (!result) return;
    if (departureType === 'EMERGENCY' && reason.trim().length < 5) {
      setFormError('Las salidas de emergencia requieren un motivo (mínimo 5 caracteres).');
      return;
    }
    setFormError(null);
    register.mutate(
      {
        studentIdentifier: studentId.trim(),
        guardianIdentifier: guardianId.trim(),
        departureType,
        justificationReason: reason.trim() || undefined,
        scheduledPermitId: usePermit ? permitId : undefined,
      },
      {
        onSuccess: (res) => {
          toast.push(
            res.scheduledPermitCompleted
              ? `Salida registrada y permiso programado cumplido: ${result.student.fullName}.`
              : `Salida registrada: ${result.student.fullName}.`,
            'success',
          );
          finish('AUTHORIZED');
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  };

  const onReject = () => {
    if (rejectReason.trim().length < 5) {
      setFormError('Indique el motivo del rechazo (mínimo 5 caracteres).');
      return;
    }
    setFormError(null);
    register.mutate(
      {
        studentIdentifier: studentId.trim(),
        guardianIdentifier: guardianId.trim(),
        decision: 'REJECTED',
        departureType,
        justificationReason: rejectReason.trim(),
      },
      {
        onSuccess: () => {
          toast.push('Salida rechazada y registrada en la bitácora.', 'info');
          finish('REJECTED');
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  };

  const authorized = result?.authorized === true;
  const busy = validate.isPending || register.isPending;

  return (
    <section className={`${CARD} relative overflow-hidden`} aria-labelledby="terminal-title">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#0d2346] text-white flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </span>
          <div>
            <h2 data-preserve-case id="terminal-title" className="text-base font-bold text-slate-900">
              Terminal de caseta
            </h2>
            <p className="text-xs text-slate-500">Valide al encargado antes de autorizar cualquier salida.</p>
          </div>
        </div>
        {(result || studentId || guardianId) && !busy && (
          <button type="button" onClick={() => reset()} className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <form onSubmit={onValidate} className={`p-5 grid gap-4 ${large ? 'md:grid-cols-[1fr_1fr_auto]' : 'sm:grid-cols-[1fr_1fr_auto]'} items-end`}>
        <div>
          <label htmlFor="terminal-student" className={LABEL}>
            Cédula del estudiante
          </label>
          <div className="relative">
            <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="terminal-student"
              ref={studentRef}
              autoFocus
              inputMode="numeric"
              autoComplete="off"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !guardianId) {
                  e.preventDefault();
                  guardianRef.current?.focus();
                }
              }}
              placeholder="Escanee o digite la cédula"
              className={`${INPUT} pl-9 ${large ? 'py-3 text-base' : ''}`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="terminal-guardian" className={LABEL}>
            Cédula del encargado presente
          </label>
          <div className="relative">
            <UserRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="terminal-guardian"
              ref={guardianRef}
              inputMode="numeric"
              autoComplete="off"
              value={guardianId}
              onChange={(e) => {
                setGuardianId(e.target.value);
                setResult(null);
              }}
              placeholder="Identificación de quien retira"
              className={`${INPUT} pl-9 ${large ? 'py-3 text-base' : ''}`}
            />
          </div>
        </div>
        <button type="submit" disabled={busy} className={`${BTN_PRIMARY} ${large ? 'py-3' : 'py-2.5'}`}>
          {validate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
          Validar encargado
        </button>
        {permitId && !result && (
          <p className="sm:col-span-3 text-xs text-purple-700 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" />
            Estudiante precargado desde un permiso programado. Solicite la cédula de quien lo retira.
          </p>
        )}
      </form>

      <AnimatePresence initial={false}>
        {formError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 -mt-1 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 overflow-hidden"
            role="alert"
          >
            {formError}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${result.student.id}-${result.authorized}-${result.rejectionId ?? 'ok'}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`mx-5 mb-5 rounded-xl border-2 p-4 sm:p-5 ${
              authorized ? 'border-emerald-300 bg-emerald-50/40' : 'border-rose-300 bg-rose-50/40'
            }`}
          >
            {/* Estudiante */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${
                    authorized ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {initials(result.student.fullName)}
                </span>
                <div className="min-w-0">
                  <h3 data-preserve-case className="text-lg font-bold text-slate-900 leading-tight truncate">
                    {result.student.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2">
                    <span className="tabular">Cédula {result.student.nationalId}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#0d2346]/[0.07] text-[#0d2346] font-semibold">
                      {sectionLabel(result.student)}
                    </span>
                  </p>
                </div>
              </div>
              <DepartureStatusBadge status={authorized ? 'AUTHORIZED' : 'REJECTED'} />
            </div>

            {/* Comparativa */}
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <div className="rounded-lg bg-white border border-slate-200/80 p-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Encargado presente</p>
                {authorized && result.guardian ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p data-preserve-case className="text-sm font-semibold text-slate-900">{result.guardian.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {result.relationship ?? 'Parentesco no indicado'} · <span className="tabular">{result.guardian.nationalIdMasked}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <p className="text-sm text-slate-700">
                      Cédula presentada <span className="tabular font-semibold">{guardianId}</span> sin vínculo activo.
                    </p>
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-white border border-slate-200/80 p-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Tutores registrados
                </p>
                {result.registeredGuardians.length === 0 ? (
                  <p className="text-sm text-slate-500">El estudiante no tiene encargados registrados.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.registeredGuardians.map((g) => {
                      const isMatch = authorized && g.id === result.guardian?.id;
                      return (
                        <li key={g.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className={`flex items-center gap-1.5 min-w-0 ${isMatch ? 'text-emerald-800 font-semibold' : 'text-slate-700'}`}>
                            {isMatch && <Check className="w-3.5 h-3.5 shrink-0" />}
                            <span data-preserve-case className="truncate">{g.fullName}</span>
                            {!g.active && <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 rounded">Inactivo</span>}
                          </span>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {g.relationship ?? '—'} · <span className="tabular">{g.nationalIdMasked}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {result.lastAuthorizedToday && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Este estudiante ya tiene una salida autorizada hoy a las {formatTime(result.lastAuthorizedToday.departureTime)}.
              </p>
            )}

            {authorized ? (
              <div className="mt-4 space-y-3">
                {result.pendingPermit && (
                  <label className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50/60 p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePermit}
                      onChange={(e) => {
                        setUsePermit(e.target.checked);
                        setDepartureType(e.target.checked ? 'EARLY' : 'REGULAR');
                      }}
                      className="mt-0.5 w-4 h-4 accent-purple-700"
                    />
                    <span className="text-sm">
                      <span className="flex flex-wrap items-center gap-2">
                        <PermitBadge />
                        <span className="font-semibold text-slate-900">{formatClock(result.pendingPermit.departureTime)}</span>
                      </span>
                      <span className="block text-slate-600 mt-1">
                        {result.pendingPermit.reason} · Autorizado por {result.pendingPermit.authorizedBy.fullName}
                      </span>
                    </span>
                  </label>
                )}

                <div>
                  <p className={LABEL}>Tipo de salida</p>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-white border border-slate-200 rounded-lg">
                    {TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDepartureType(type)}
                        aria-pressed={departureType === type}
                        className={`relative text-xs sm:text-sm font-semibold py-2 rounded-md transition-colors ${
                          departureType === type ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {departureType === type && (
                          <motion.span layoutId="departure-type-pill" className="absolute inset-0 rounded-md bg-[#0d2346]" />
                        )}
                        <span className="relative">{TYPE_SHORT_LABEL[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="terminal-reason" className={LABEL}>
                    {departureType === 'EMERGENCY' ? 'Motivo de la emergencia *' : 'Observación (opcional)'}
                  </label>
                  <textarea
                    id="terminal-reason"
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={departureType === 'EMERGENCY' ? 'Describa la situación' : 'Ej. Retiro por cita médica'}
                    className={`${INPUT} resize-none`}
                  />
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {rejecting ? (
                    <motion.div key="reject" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                      <label htmlFor="terminal-reject" className={LABEL}>
                        Motivo del rechazo *
                      </label>
                      <textarea
                        id="terminal-reject"
                        rows={2}
                        autoFocus
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ej. Documento de identidad ilegible"
                        className={`${INPUT} resize-none`}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={onReject} disabled={busy} className={BTN_DANGER}>
                          {register.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
                          Confirmar rechazo
                        </button>
                        <button type="button" onClick={() => setRejecting(false)} className={BTN_SECONDARY}>
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="actions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
                      {canRegister ? (
                        <>
                          <button type="button" onClick={onAuthorize} disabled={busy} className={`${BTN_PRIMARY} py-2.5`}>
                            {register.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Autorizar y registrar salida
                          </button>
                          <button type="button" onClick={() => setRejecting(true)} disabled={busy} className={BTN_DANGER}>
                            <ShieldX className="w-4 h-4" />
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">Su rol puede validar, pero no registrar salidas.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-rose-100/60 border border-rose-200 px-3 py-2.5 text-sm text-rose-900 flex items-start gap-2">
                  <ShieldX className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>
                    <strong className="block">Salida bloqueada.</strong>
                    {result.message}. El intento quedó registrado en la bitácora y en la auditoría.
                  </span>
                </div>
                <button type="button" onClick={() => reset()} className={BTN_SECONDARY}>
                  <RotateCcw className="w-4 h-4" />
                  Nueva validación
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación animada */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-10"
            role="status"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${
                done === 'AUTHORIZED' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {done === 'AUTHORIZED' ? <Check className="w-8 h-8" strokeWidth={3} /> : <ShieldX className="w-8 h-8" />}
            </motion.span>
            <p className="text-base font-bold text-slate-900">
              {done === 'AUTHORIZED' ? 'Salida registrada' : 'Rechazo registrado'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
