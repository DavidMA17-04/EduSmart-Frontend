import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { sessionHasPermission } from '@/shared/auth';
import { useToast } from '@/shared/ui';
import { DEPARTURE_PERMISSIONS } from '../model/permissions';
import type { DepartureHistoryFilters } from '../model/types';
import { useExportDepartures } from '../model/useDepartures';
import { BTN_PRIMARY, BTN_SECONDARY } from './styles';

/** [Exportar a Excel] [Exportar a PDF] — la acción principal a la izquierda. */
export function ExportButtons({ filters, size = 'md' }: { filters: DepartureHistoryFilters; size?: 'sm' | 'md' }) {
  const toast = useToast();
  const exporter = useExportDepartures();
  if (!sessionHasPermission(DEPARTURE_PERMISSIONS.export)) return null;
  const pending = exporter.isPending ? exporter.variables?.format : null;
  const run = (format: 'excel' | 'pdf') =>
    exporter.mutate(
      { format, filters },
      { onError: (error) => toast.push(error instanceof Error ? error.message : 'No se pudo exportar.', 'error') },
    );
  const pad = size === 'sm' ? '!px-3 !py-1.5 !text-xs' : '';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => run('excel')} disabled={exporter.isPending} className={`${BTN_PRIMARY} ${pad}`}>
        {pending === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
        Exportar a Excel
      </button>
      <button type="button" onClick={() => run('pdf')} disabled={exporter.isPending} className={`${BTN_SECONDARY} ${pad}`}>
        {pending === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        Exportar a PDF
      </button>
    </div>
  );
}
