import { portalPathForSession } from '@/shared/auth/portalPaths';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  BarChart3,
  Eye,
  FileText,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  SearchX,
  Trash2,
  Users,
} from 'lucide-react';
import { useAdminCommunications, useCommunicationMutations } from '@/hooks/useCommunications';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import {
  Communication,
  CommunicationFilter,
  CommunicationStatus,
  CreateCommunicationPayload,
} from '@/types/communications';
import { CommunicationPriorityBadge } from '@/components/communications/CommunicationPriorityBadge';
import { CommunicationStatusBadge } from '@/components/communications/CommunicationStatusBadge';
import { CommunicationEditorModal } from '@/components/communications/CommunicationEditorModal';
import { CommunicationStatsModal } from '@/components/communications/CommunicationStatsModal';
import { CommunicationDetailModal } from '@/components/communications/CommunicationDetailModal';
import { CommunicationConfirmDialog } from '@/components/communications/CommunicationConfirmDialog';
import {
  CommunicationSearch,
  CommunicationTabs,
  FetchingBar,
} from '@/components/communications/CommunicationControls';
import {
  PRIORITY_THEME,
  audienceSummary,
  formatRelative,
  formatShortDate,
} from '@/components/communications/communicationFormat';
import { getStoredSessionUser, sessionHasPermission } from '@/shared/auth';
import { useToast } from '@/shared/ui';
import '@/components/communications/communications.css';

type StatusTab = CommunicationStatus | 'ALL';
type PendingAction = { kind: 'publish' | 'archive' | 'restore' | 'delete'; communication: Communication };

const ACTION_COPY: Record<PendingAction['kind'], { title: string; confirm: string; tone: 'primary' | 'danger' | 'warning'; success: string }> = {
  publish: { title: 'Publicar comunicado', confirm: 'Publicar ahora', tone: 'primary', success: 'Comunicado publicado. Ya es visible para sus destinatarios.' },
  restore: { title: 'Volver a publicar', confirm: 'Publicar de nuevo', tone: 'primary', success: 'El comunicado vuelve a estar publicado.' },
  archive: { title: 'Archivar comunicado', confirm: 'Archivar', tone: 'warning', success: 'Comunicado archivado. Ya no aparece en el muro de avisos.' },
  delete: { title: 'Eliminar comunicado', confirm: 'Eliminar definitivamente', tone: 'danger', success: 'Comunicado eliminado.' },
};

const SummaryTile: React.FC<{ label: string; value: number; suffix?: string; icon: React.ReactNode; tone: string; delay: number }> = ({
  label,
  value,
  suffix = '',
  icon,
  tone,
  delay,
}) => {
  const animated = useAnimatedNumber(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3"
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>{icon}</span>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
          {Math.round(animated)}
          {suffix}
        </p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
};

const IconAction: React.FC<{
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}> = ({ label, onClick, className, children }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.88 }}
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`p-2 rounded-lg transition-colors ${className}`}
  >
    {children}
  </motion.button>
);

export const CommunicationsAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<Communication | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [statsId, setStatsId] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<Communication | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 350);
  const filter = useMemo<CommunicationFilter>(
    () => ({
      status: statusTab === 'ALL' ? undefined : statusTab,
      search: debouncedSearch || undefined,
      limit: 50,
    }),
    [statusTab, debouncedSearch],
  );

  const { data, isLoading, isError, refetch, isFetching } = useAdminCommunications(filter);
  const { createMutation, updateMutation, publishMutation, archiveMutation, removeMutation } =
    useCommunicationMutations();

  const items = data?.items ?? [];
  const counts = data?.countsByStatus ?? { DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 };
  const totalAll = counts.DRAFT + counts.PUBLISHED + counts.ARCHIVED;

  const publishedItems = items.filter((i) => i.status === 'PUBLISHED');
  const averageReadRate = publishedItems.length
    ? publishedItems.reduce((sum, i) => sum + (i.readRate ?? 0), 0) / publishedItems.length
    : 0;

  const sessionUser = getStoredSessionUser();
  const authorName = sessionUser ? `${sessionUser.name} ${sessionUser.first_lastname}`.trim() : undefined;

  const openCreate = () => {
    setEditing(null);
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const openEdit = (comm: Communication) => {
    setEditing(comm);
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const handleSave = (payload: CreateCommunicationPayload) => {
    setEditorError(null);
    const onError = (error: unknown) =>
      setEditorError(error instanceof Error ? error.message : 'No se pudo guardar el comunicado.');

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => {
            setIsEditorOpen(false);
            toast.push('Cambios guardados correctamente.', 'success');
          },
          onError,
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          setIsEditorOpen(false);
          setStatusTab(created.status === 'PUBLISHED' ? 'PUBLISHED' : created.status === 'DRAFT' ? 'DRAFT' : 'ALL');
          toast.push(
            created.status === 'PUBLISHED'
              ? 'Comunicado publicado. Ya es visible para sus destinatarios.'
              : 'Borrador guardado.',
            'success',
          );
        },
        onError,
      });
    }
  };

  const runPendingAction = () => {
    if (!pendingAction) return;
    const { kind, communication } = pendingAction;
    const copy = ACTION_COPY[kind];
    const callbacks = {
      onSuccess: () => {
        toast.push(copy.success, 'success');
        setPendingAction(null);
      },
      onError: (error: unknown) => {
        toast.push(error instanceof Error ? error.message : 'No se pudo completar la acción.', 'error');
        setPendingAction(null);
      },
    };
    if (kind === 'publish' || kind === 'restore') publishMutation.mutate(communication.id, callbacks);
    else if (kind === 'archive') archiveMutation.mutate(communication.id, callbacks);
    else removeMutation.mutate(communication.id, callbacks);
  };

  const actionPending =
    publishMutation.isPending || archiveMutation.isPending || removeMutation.isPending;

  const emptyText = debouncedSearch
    ? `No hay comunicados que coincidan con «${debouncedSearch}».`
    : statusTab === 'DRAFT'
      ? 'No tiene borradores guardados.'
      : statusTab === 'ARCHIVED'
        ? 'No hay comunicados archivados.'
        : statusTab === 'PUBLISHED'
          ? 'Aún no se ha publicado ningún comunicado.'
          : 'Todavía no hay comunicados. Redacte el primero para la comunidad.';

  return (
    <div className="edu-comms bg-slate-50 min-h-full p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <button
              type="button"
              onClick={() => navigate(portalPathForSession('/admin/communications'))}
              className="text-xs font-semibold text-slate-500 hover:text-[#0d2346] flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ir al muro de avisos
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#0d2346]/10 text-[#0d2346]">
                <Megaphone className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-semibold text-[#0d2346] uppercase tracking-[0.16em]">
                Gestión administrativa
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--brand-font-serif)' }}>
              Gestor de comunicados
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Redacte, segmente y dé seguimiento a la lectura de los avisos institucionales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={openCreate}
              className="bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Redactar comunicado
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Actualizar"
              title="Actualizar"
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-[#0d2346] hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryTile label="Publicados" value={counts.PUBLISHED} icon={<Send className="w-5 h-5" />} tone="bg-emerald-50 text-emerald-700" delay={0} />
          <SummaryTile label="Borradores" value={counts.DRAFT} icon={<FileText className="w-5 h-5" />} tone="bg-slate-100 text-slate-600" delay={0.05} />
          <SummaryTile label="Archivados" value={counts.ARCHIVED} icon={<Archive className="w-5 h-5" />} tone="bg-amber-50 text-amber-700" delay={0.1} />
          <SummaryTile label="Lectura promedio (publicados)" value={averageReadRate} suffix="%" icon={<BarChart3 className="w-5 h-5" />} tone="bg-[#0d2346]/[0.07] text-[#0d2346]" delay={0.15} />
        </div>

        {/* Filtros */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CommunicationTabs<StatusTab>
              id="admin"
              value={statusTab}
              onChange={setStatusTab}
              options={[
                { value: 'ALL', label: 'Todos', count: totalAll },
                { value: 'PUBLISHED', label: 'Publicados', count: counts.PUBLISHED },
                { value: 'DRAFT', label: 'Borradores', count: counts.DRAFT },
                { value: 'ARCHIVED', label: 'Archivados', count: counts.ARCHIVED },
              ]}
            />
            <CommunicationSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar comunicados…"
              isSearching={isFetching && Boolean(debouncedSearch)}
            />
          </div>
          <div className="mt-2">
            <FetchingBar active={isFetching && !isLoading} />
          </div>
        </div>

        {/* Listado */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-slate-200/70 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-2 w-32 bg-slate-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-14 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No se pudo cargar el listado</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2 rounded-lg"
              >
                Reintentar
              </button>
            </div>
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#0d2346]/[0.06] text-[#0d2346] flex items-center justify-center mx-auto mb-3">
                {debouncedSearch ? <SearchX className="w-7 h-7" /> : <Megaphone className="w-7 h-7" />}
              </div>
              <p className="text-sm text-slate-600">{emptyText}</p>
              {!debouncedSearch && statusTab !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-4 bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Redactar comunicado
                </button>
              )}
            </motion.div>
          ) : (
            <ul className="divide-y divide-slate-100">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((comm, index) => {
                  const theme = PRIORITY_THEME[comm.priority];
                  const rate = Math.min(100, Math.max(0, comm.readRate ?? 0));
                  return (
                    <motion.li
                      key={comm.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.28, delay: Math.min(index, 10) * 0.03 }}
                      className="relative group px-5 py-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${theme.accent}`} aria-hidden="true" />
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                        {/* Asunto */}
                        <button type="button" onClick={() => setPreviewing(comm)} className="text-left min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <CommunicationStatusBadge status={comm.status} />
                            <CommunicationPriorityBadge priority={comm.priority} />
                            {comm.requiresAcknowledgment && (
                              <span className="text-[11px] font-medium text-slate-500">· Con acuse</span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-900 text-[15px] truncate group-hover:text-[#0d2346] transition-colors">
                            {comm.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {audienceSummary(comm.recipients)}
                            </span>
                            <span title={formatShortDate(comm.publishDate || comm.createdAt)}>
                              {comm.status === 'DRAFT' ? 'Creado ' : 'Publicado '}
                              {formatRelative(comm.publishDate || comm.createdAt)}
                            </span>
                            {comm.authorName && <span>por {comm.authorName}</span>}
                          </p>
                        </button>

                        {/* Lectura */}
                        <div className="w-full lg:w-48 shrink-0">
                          {comm.status === 'DRAFT' ? (
                            <p className="text-xs text-slate-400 italic">Sin publicar</p>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-700">
                                  {comm.totalReads ?? 0} de {comm.totalEstimatedAudience ?? 0} leyeron
                                </span>
                                <span className="text-slate-500 tabular-nums">{rate}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-[#0d2346] to-[#164687] rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${rate}%` }}
                                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 + Math.min(index, 10) * 0.03 }}
                                />
                              </div>
                              {comm.requiresAcknowledgment && (
                                <p className="text-[11px] text-slate-500 mt-1">
                                  {comm.totalAcknowledged ?? 0} acuses confirmados
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-0.5 shrink-0 lg:opacity-70 lg:group-hover:opacity-100 transition-opacity">
                          <IconAction label="Ver comunicado" onClick={() => setPreviewing(comm)} className="text-slate-500 hover:text-[#0d2346] hover:bg-slate-100">
                            <Eye className="w-4 h-4" />
                          </IconAction>
                          {comm.status !== 'DRAFT' && (
                            <IconAction label="Seguimiento de lectura" onClick={() => setStatsId(comm.id)} className="text-slate-500 hover:text-[#0d2346] hover:bg-slate-100">
                              <BarChart3 className="w-4 h-4" />
                            </IconAction>
                          )}
                          {comm.status === 'DRAFT' && sessionHasPermission('communications.publish') && (
                            <IconAction label="Publicar" onClick={() => setPendingAction({ kind: 'publish', communication: comm })} className="text-emerald-600 hover:bg-emerald-50">
                              <Send className="w-4 h-4" />
                            </IconAction>
                          )}
                          {comm.status === 'PUBLISHED' && (
                            <IconAction label="Archivar" onClick={() => setPendingAction({ kind: 'archive', communication: comm })} className="text-amber-600 hover:bg-amber-50">
                              <Archive className="w-4 h-4" />
                            </IconAction>
                          )}
                          {comm.status === 'ARCHIVED' && sessionHasPermission('communications.publish') && (
                            <IconAction label="Volver a publicar" onClick={() => setPendingAction({ kind: 'restore', communication: comm })} className="text-emerald-600 hover:bg-emerald-50">
                              <ArchiveRestore className="w-4 h-4" />
                            </IconAction>
                          )}
                          <IconAction label="Editar" onClick={() => openEdit(comm)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                            <Pencil className="w-4 h-4" />
                          </IconAction>
                          <IconAction label="Eliminar" onClick={() => setPendingAction({ kind: 'delete', communication: comm })} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                            <Trash2 className="w-4 h-4" />
                          </IconAction>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      <CommunicationEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        initialData={editing}
        isSaving={createMutation.isPending || updateMutation.isPending}
        authorName={authorName}
        serverError={editorError}
      />

      <CommunicationStatsModal communicationId={statsId} isOpen={Boolean(statsId)} onClose={() => setStatsId(null)} />

      <CommunicationDetailModal
        communication={previewing}
        isOpen={Boolean(previewing)}
        onClose={() => setPreviewing(null)}
        readOnly
      />

      <CommunicationConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={pendingAction ? ACTION_COPY[pendingAction.kind].title : ''}
        confirmLabel={pendingAction ? ACTION_COPY[pendingAction.kind].confirm : ''}
        tone={pendingAction ? ACTION_COPY[pendingAction.kind].tone : 'primary'}
        icon={
          pendingAction?.kind === 'delete' ? (
            <Trash2 className="w-5 h-5 text-rose-600" />
          ) : pendingAction?.kind === 'archive' ? (
            <Archive className="w-5 h-5 text-amber-600" />
          ) : (
            <Send className="w-5 h-5" />
          )
        }
        isSubmitting={actionPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={runPendingAction}
        message={
          pendingAction && (
            <>
              <p>
                {pendingAction.kind === 'delete'
                  ? 'Se eliminará de forma permanente, junto con su registro de lecturas y acuses:'
                  : pendingAction.kind === 'archive'
                    ? 'Dejará de mostrarse en el muro de avisos. Podrá volver a publicarlo más adelante:'
                    : 'Será visible de inmediato para sus destinatarios:'}
              </p>
              <p className="mt-2 font-semibold text-slate-900">«{pendingAction.communication.title}»</p>
              <p className="mt-1 text-xs text-slate-500">
                Destinatarios: {audienceSummary(pendingAction.communication.recipients)}
              </p>
            </>
          )
        }
      />
    </div>
  );
};
