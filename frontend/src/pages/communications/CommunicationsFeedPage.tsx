import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BellRing,
  CheckCheck,
  Inbox,
  Megaphone,
  PenSquare,
  RefreshCw,
  SearchX,
  Siren,
} from 'lucide-react';
import { useCommunicationsFeed, useCommunicationMutations } from '@/hooks/useCommunications';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { Communication, CommunicationFilter } from '@/types/communications';
import { CommunicationCard, CommunicationCardSkeleton } from '@/components/communications/CommunicationCard';
import { CommunicationDetailModal } from '@/components/communications/CommunicationDetailModal';
import {
  CommunicationSearch,
  CommunicationTabs,
  FetchingBar,
} from '@/components/communications/CommunicationControls';
import { sessionHasPermission } from '@/shared/auth';
import { useToast } from '@/shared/ui';
import '@/components/communications/communications.css';

type FeedTab = 'all' | 'unread' | 'urgent';
const PAGE_SIZE = 10;

export const CommunicationsFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<FeedTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Communication | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 350);
  const canManage = sessionHasPermission('communications.create') || sessionHasPermission('communications.manage');

  const filter = useMemo<CommunicationFilter>(
    () => ({
      search: debouncedSearch || undefined,
      unreadOnly: tab === 'unread' || undefined,
      urgentOnly: tab === 'urgent' || undefined,
      limit,
    }),
    [debouncedSearch, tab, limit],
  );

  const { data, isLoading, isError, refetch, isFetching } = useCommunicationsFeed(filter);
  const { markAsReadMutation, confirmAcknowledgmentMutation } = useCommunicationMutations();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unreadCount ?? 0;
  const animatedUnread = Math.round(useAnimatedNumber(unreadCount));
  const pendingAck = items.filter((i) => i.requiresAcknowledgment && !i.isAcknowledged).length;

  // El modal sigue al elemento en caché para reflejar lectura/acuse al instante.
  const current = selected ? (items.find((i) => i.id === selected.id) ?? selected) : null;

  const changeTab = (next: FeedTab) => {
    setTab(next);
    setLimit(PAGE_SIZE);
  };

  const handleOpenDetail = useCallback(
    (comm: Communication) => {
      setSelected(comm);
      if (!comm.isRead) markAsReadMutation.mutate(comm.id);
    },
    [markAsReadMutation],
  );

  const handleConfirmAcknowledgment = useCallback(
    (id: string) => {
      setConfirmingId(id);
      confirmAcknowledgmentMutation.mutate(id, {
        onSuccess: () => toast.push('Lectura confirmada. Gracias por su acuse.', 'success'),
        onError: (error) =>
          toast.push(error instanceof Error ? error.message : 'No se pudo confirmar la lectura.', 'error'),
        onSettled: () => setConfirmingId(null),
      });
    },
    [confirmAcknowledgmentMutation, toast],
  );

  const emptyState = (() => {
    if (debouncedSearch) {
      return {
        icon: <SearchX className="w-7 h-7" />,
        title: 'Sin resultados',
        text: `No encontramos avisos que coincidan con «${debouncedSearch}».`,
      };
    }
    if (tab === 'unread') {
      return {
        icon: <CheckCheck className="w-7 h-7" />,
        title: '¡Está al día!',
        text: 'No tiene comunicados pendientes de lectura.',
      };
    }
    if (tab === 'urgent') {
      return {
        icon: <Siren className="w-7 h-7" />,
        title: 'Sin avisos urgentes',
        text: 'No hay comunicados urgentes vigentes en este momento.',
      };
    }
    return {
      icon: <Inbox className="w-7 h-7" />,
      title: 'Aún no hay avisos',
      text: 'Cuando la institución publique un comunicado para usted, aparecerá aquí.',
    };
  })();

  return (
    <div className="edu-comms bg-slate-50 min-h-full p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Encabezado institucional */}
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="edu-comms-hero relative overflow-hidden rounded-2xl text-white shadow-md"
        >
          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-[#cfac65]/10" aria-hidden="true" />
          <div className="absolute right-24 -bottom-24 w-56 h-56 rounded-full bg-white/5" aria-hidden="true" />
          <div className="relative p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <motion.span
                initial={{ rotate: -12, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
                className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0"
              >
                <Megaphone className="w-6 h-6 text-[#cfac65]" />
              </motion.span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#cfac65]">
                  Comunidad CTP Hojancha
                </p>
                <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: 'var(--brand-font-serif)' }}>
                  Avisos y comunicados
                </h1>
                <p className="text-sm text-white/70 mt-1 max-w-md">
                  Canal oficial de avisos institucionales, circulares y convocatorias del colegio.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5">
                <BellRing className="w-5 h-5 text-[#cfac65]" />
                <div className="leading-tight">
                  <p className="text-xl font-bold tabular-nums">{animatedUnread}</p>
                  <p className="text-[11px] text-white/70">sin leer</p>
                </div>
                {pendingAck > 0 && (
                  <div className="pl-3 ml-1 border-l border-white/15 leading-tight">
                    <p className="text-xl font-bold tabular-nums">{pendingAck}</p>
                    <p className="text-[11px] text-white/70">por confirmar</p>
                  </div>
                )}
              </div>
              {canManage && (
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/admin/communications/manage')}
                  className="bg-[#cfac65] hover:bg-[#d9bb7d] text-[#0d2346] font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <PenSquare className="w-4 h-4" />
                  Gestor de comunicados
                </motion.button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Filtros */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CommunicationTabs<FeedTab>
              id="feed"
              value={tab}
              onChange={changeTab}
              options={[
                { value: 'all', label: 'Todos los avisos' },
                { value: 'unread', label: 'No leídos', count: unreadCount },
                { value: 'urgent', label: 'Urgentes' },
              ]}
            />
            <div className="flex items-center gap-2">
              <CommunicationSearch
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setLimit(PAGE_SIZE);
                }}
                placeholder="Buscar por asunto o contenido…"
                isSearching={isFetching && Boolean(debouncedSearch)}
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => refetch()}
                disabled={isFetching}
                title="Actualizar"
                aria-label="Actualizar avisos"
                className="p-2.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-[#0d2346] hover:bg-slate-50 transition-colors shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
          <div className="mt-2">
            <FetchingBar active={isFetching && !isLoading} />
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <CommunicationCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-rose-200 rounded-2xl p-10 text-center shadow-sm"
          >
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No se pudieron cargar los avisos</h3>
            <p className="text-sm text-slate-500 mt-1">Verifique su conexión e intente nuevamente.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Reintentar
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {items.length === 0 ? (
              <motion.div
                key={`empty-${tab}-${debouncedSearch}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm"
              >
                <motion.div
                  initial={{ y: 6 }}
                  animate={{ y: [6, -4, 6] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-2xl bg-[#0d2346]/[0.06] text-[#0d2346] flex items-center justify-center mx-auto mb-4"
                >
                  {emptyState.icon}
                </motion.div>
                <h3 className="text-base font-bold text-slate-900">{emptyState.title}</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">{emptyState.text}</p>
              </motion.div>
            ) : (
              <motion.div key="list" className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((comm, index) => (
                    <CommunicationCard
                      key={comm.id}
                      index={index}
                      communication={comm}
                      onConfirmAcknowledgment={handleConfirmAcknowledgment}
                      onOpenDetail={handleOpenDetail}
                      confirmingId={confirmingId}
                    />
                  ))}
                </AnimatePresence>

                <div className="flex flex-col items-center gap-2 pt-2">
                  <p className="text-xs text-slate-500">
                    Mostrando {items.length} de {total} {total === 1 ? 'aviso' : 'avisos'}
                  </p>
                  {items.length < total && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setLimit((l) => l + PAGE_SIZE)}
                      disabled={isFetching}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors disabled:opacity-60"
                    >
                      {isFetching ? 'Cargando…' : 'Cargar más avisos'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <CommunicationDetailModal
        communication={current}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        onConfirmAcknowledgment={handleConfirmAcknowledgment}
        isConfirming={Boolean(current && confirmingId === current.id)}
      />
    </div>
  );
};
