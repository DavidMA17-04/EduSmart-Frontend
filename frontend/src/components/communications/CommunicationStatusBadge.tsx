import React from 'react';
import { CommunicationStatus } from '@/types/communications';

interface Props {
  status: CommunicationStatus;
}

export const CommunicationStatusBadge: React.FC<Props> = ({ status }) => {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="bg-brand-green-light text-brand-green border border-brand-green/30 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
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
