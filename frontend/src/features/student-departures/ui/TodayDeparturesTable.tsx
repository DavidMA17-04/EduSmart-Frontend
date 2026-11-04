import { Link } from 'react-router-dom';
import { costaRicaToday } from '../model/format';
import { securityBasePath, useSecurityDeparturesHistory } from '../model/useDepartures';
import { DeparturesTable } from './DeparturesTable';
import { ExportButtons } from './ExportButtons';
import { CARD } from './styles';

export function TodayDeparturesTable() {
  const today = costaRicaToday();
  const filters = { startDate: today, endDate: today, page: 1, limit: 8 };
  const { data, isLoading } = useSecurityDeparturesHistory(filters, { refetchInterval: 30_000 });
  return (
    <section className={CARD} aria-labelledby="today-title">
      <div className="px-5 py-4 border-b border-slate-100 space-y-3">
        <div>
          <h2 data-preserve-case id="today-title" className="text-base font-bold text-slate-900">
            Bitácora del día
          </h2>
          <p className="text-xs text-slate-500">
            {data ? `${data.total} ${data.total === 1 ? 'registro' : 'registros'} hoy` : 'Cargando…'}
          </p>
        </div>
        <ExportButtons filters={{ startDate: today, endDate: today }} size="sm" />
      </div>
      <DeparturesTable items={data?.items ?? []} loading={isLoading} emptyText="Aún no hay salidas registradas hoy." hideGuard />
      {data && data.total > data.items.length && (
        <div className="px-5 py-3 border-t border-slate-100 text-right">
          <Link to={`${securityBasePath()}/history`} className="text-sm font-semibold text-brand-primary hover:underline">
            Ver bitácora completa ({data.total})
          </Link>
        </div>
      )}
    </section>
  );
}
