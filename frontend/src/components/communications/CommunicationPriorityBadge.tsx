import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { CommunicationPriority } from '@/types/communications';

interface Props {
  priority: CommunicationPriority;
}

export const CommunicationPriorityBadge: React.FC<Props> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Urgente
        </span>
      );
    case 'IMPORTANT':
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Importante
        </span>
      );
    case 'NORMAL':
    default:
      return (
        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Informativo
        </span>
      );
  }
};
