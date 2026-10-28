import React from 'react';
import { CommunicationStatus } from '@/types/communications';

interface Props {
  status: CommunicationStatus;
}

export const CommunicationStatusBadge: React.FC<Props> = ({ status }) => {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Publicado
        </span>
      );
    case 'DRAFT':
      return (
        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Borrador
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Archivado
        </span>
      );
    default:
      return null;
  }
};
