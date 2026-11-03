import { AlertOctagon, CalendarCheck, CheckCircle2, Clock, DoorOpen, XCircle } from 'lucide-react';
import type { DepartureStatus, DepartureType } from '../model/types';

const BASE = 'text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap';

/** manual: el guarda rechazó a un encargado vinculado (no es un intento sospechoso). */
export function DepartureStatusBadge({ status, manual = false }: { status: DepartureStatus; manual?: boolean }) {
  if (status === 'AUTHORIZED') {
    return (
      <span className={`bg-brand-green-light text-brand-green border border-brand-green/30 ${BASE}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        Autorizado
      </span>
    );
  }
  if (manual) {
    return (
      <span className={`bg-[#ffebeb] text-brand-danger border border-[#ffd7d7] ${BASE}`}>
        <XCircle className="w-3.5 h-3.5" />
        Denegado por el guarda
      </span>
    );
  }
  return (
    <span className={`bg-[#ffebeb] text-brand-danger border border-[#ffd7d7] ${BASE} animate-pulse`}>
      <XCircle className="w-3.5 h-3.5" />
      Denegado / No coincide
    </span>
  );
}

export function DepartureTypeBadge({ type, fromPermit = false }: { type: DepartureType; fromPermit?: boolean }) {
  if (fromPermit) {
    return (
      <span className={`bg-brand-primary-light text-brand-primary border border-brand-primary/25 ${BASE}`}>
        <CalendarCheck className="w-3.5 h-3.5" />
        Permiso programado
      </span>
    );
  }
  if (type === 'EARLY') {
    return (
      <span className={`bg-brand-primary-light text-brand-primary border border-brand-primary/25 ${BASE}`}>
        <Clock className="w-3.5 h-3.5" />
        Salida anticipada
      </span>
    );
  }
  if (type === 'EMERGENCY') {
    return (
      <span className={`bg-amber-50 text-amber-800 border border-amber-200 ${BASE}`}>
        <AlertOctagon className="w-3.5 h-3.5" />
        Emergencia
      </span>
    );
  }
  return (
    <span className={`bg-slate-100 text-slate-700 border border-slate-200 ${BASE}`}>
      <DoorOpen className="w-3.5 h-3.5" />
      Salida regular
    </span>
  );
}

export function PermitBadge() {
  return (
    <span className={`bg-brand-primary-light text-brand-primary border border-brand-primary/25 ${BASE}`}>
      <CalendarCheck className="w-3.5 h-3.5" />
      Permiso programado
    </span>
  );
}
