import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Eye,
  Info,
  Layers,
  Loader2,
  PenLine,
  Save,
  Send,
  ShieldCheck,
  Siren,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Communication,
  CommunicationPriority,
  CommunicationStatus,
  CreateCommunicationPayload,
} from '@/types/communications';
import { useAudienceEstimate, useTargetOptions } from '@/hooks/useCommunications';
import {
  AudienceMode,
  CONTENT_MAX,
  TITLE_MAX,
  useCommunicationForm,
} from '@/hooks/useCommunicationForm';
import { AnimatedModal } from './AnimatedModal';
import { CommunicationDocument } from './CommunicationDocument';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateCommunicationPayload) => void;
  initialData?: Communication | null;
  isSaving?: boolean;
  authorName?: string;
  serverError?: string | null;
}

const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide';
const inputClass =
  'w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d2346]/20 focus:border-[#0d2346] transition-colors';

const PRIORITY_OPTIONS: {
  value: CommunicationPriority;
  label: string;
  hint: string;
  icon: typeof Info;
  active: string;
}[] = [
  { value: 'NORMAL', label: 'Informativo', hint: 'Aviso general', icon: Info, active: 'border-[#0d2346] bg-[#0d2346]/[0.04] text-[#0d2346]' },
  { value: 'IMPORTANT', label: 'Importante', hint: 'Requiere atención', icon: AlertTriangle, active: 'border-amber-500 bg-amber-50 text-amber-800' },
  { value: 'URGENT', label: 'Urgente', hint: 'Se muestra primero', icon: Siren, active: 'border-rose-500 bg-rose-50 text-rose-800' },
];

const AUDIENCE_OPTIONS: { value: AudienceMode; label: string; icon: typeof Users }[] = [
  { value: 'ALL', label: 'Toda la institución', icon: Building2 },
  { value: 'ROLE', label: 'Por rol', icon: UserCheck },
  { value: 'GROUP', label: 'Por sección', icon: Layers },
];

const FieldError: React.FC<{ message?: string }> = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1 overflow-hidden"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

export const CommunicationEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving = false,
  authorName,
  serverError,
}) => {
  const { data: targetOptions, isLoading: loadingTargets } = useTargetOptions(isOpen);
  const form = useCommunicationForm(initialData, isOpen);
  const { values, setField, errors } = form;
  const { data: audience, isFetching: estimating } = useAudienceEstimate(form.recipients, isOpen);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMobileTab('form');
      setConfirmDiscard(false);
    }
  }, [isOpen]);

  const isEditing = Boolean(initialData);
  const currentStatus = initialData?.status ?? 'DRAFT';

  const requestClose = () => {
    if (isSaving) return;
    if (form.isDirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const submit = (status: CommunicationStatus) => {
    const payload = form.buildPayload(status);
    if (payload) {
      onSave(payload);
    } else {
      setMobileTab('form');
    }
  };

  const roles = targetOptions?.roles ?? [];
  const groups = targetOptions?.groups ?? [];

  const previewData = {
    id: initialData?.id ?? 'nuevo-comunicado',
    title: values.title,
    content: values.content,
    priority: values.priority,
    requiresAcknowledgment: values.requiresAck,
    publishDate: initialData?.publishDate ?? null,
    createdAt: initialData?.createdAt ?? new Date().toISOString(),
    expirationDate: values.expirationDate ? `${values.expirationDate}T23:59:59-06:00` : null,
    authorName: initialData?.authorName || authorName,
    recipients:
      values.audienceMode === 'ROLE'
        ? values.selectedRoles.map((r) => ({
            recipientType: 'ROLE' as const,
            targetId: r,
            label: roles.find((o) => o.value === r)?.label ?? r,
          }))
        : values.audienceMode === 'GROUP'
          ? values.selectedGroups.map((g) => ({
              recipientType: 'GROUP' as const,
              targetId: g,
              label: groups.find((o) => o.id === g)?.name ?? `Sección ${g}`,
            }))
          : [{ recipientType: 'ALL' as const, targetId: null, label: 'Toda la institución' }],
  };

  const footer = (
    <AnimatePresence mode="wait" initial={false}>
      {confirmDiscard ? (
        <motion.div
          key="discard"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-sm text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Hay cambios sin guardar. ¿Desea descartarlos?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Descartar cambios
            </button>
            <button
              type="button"
              onClick={() => setConfirmDiscard(false)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors"
            >
              Seguir editando
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="actions"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            {isEditing && currentStatus !== 'DRAFT' ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => submit(currentStatus)}
                disabled={isSaving}
                className="bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Guardando…' : 'Guardar cambios'}
              </motion.button>
            ) : (
              <>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => submit('PUBLISHED')}
                  disabled={isSaving}
                  className="bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSaving ? 'Guardando…' : 'Publicar comunicado'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => submit('DRAFT')}
                  disabled={isSaving}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  Guardar borrador
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={isSaving}
            className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={requestClose}
      locked={isSaving}
      size="2xl"
      icon={<PenLine className="w-5 h-5" />}
      title={isEditing ? 'Editar comunicado' : 'Redactar comunicado'}
      subtitle="Emita un aviso oficial para la comunidad del CTP de Hojancha. La vista previa se actualiza mientras escribe."
      footer={footer}
    >
      {/* Pestañas en móvil */}
      <div className="lg:hidden px-5 pt-4">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          {(['form', 'preview'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`relative text-xs font-semibold py-2 rounded-md transition-colors ${
                mobileTab === tab ? 'text-white' : 'text-slate-600'
              }`}
            >
              {mobileTab === tab && (
                <motion.span layoutId="editor-mobile-tab" className="absolute inset-0 bg-[#0d2346] rounded-md" />
              )}
              <span className="relative flex items-center justify-center gap-1.5">
                {tab === 'form' ? <PenLine className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {tab === 'form' ? 'Redacción' : 'Vista previa'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Formulario */}
        <div className={`p-5 sm:p-6 space-y-5 ${mobileTab === 'form' ? 'block' : 'hidden'} lg:block`}>
          <AnimatePresence initial={false}>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Título */}
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="comm-title" className={labelClass}>
                Asunto del comunicado *
              </label>
              <span className={`text-[11px] mb-1.5 ${values.title.length > TITLE_MAX ? 'text-rose-600' : 'text-slate-400'}`}>
                {values.title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="comm-title"
              type="text"
              value={values.title}
              maxLength={TITLE_MAX + 20}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Ej. Convocatoria a entrega de notas del II período"
              className={`${inputClass} ${errors.title ? 'border-rose-400' : ''}`}
            />
            <FieldError message={errors.title} />
          </div>

          {/* Prioridad */}
          <div>
            <span className={labelClass}>Nivel de prioridad</span>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((option) => {
                const selected = values.priority === option.value;
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setField('priority', option.value)}
                    aria-pressed={selected}
                    className={`text-left px-3 py-2.5 rounded-xl border-2 transition-colors ${
                      selected ? option.active : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </span>
                    <span className="block text-[11px] opacity-75 mt-0.5">{option.hint}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Audiencia */}
          <div>
            <div className="flex items-end justify-between">
              <span className={labelClass}>Destinatarios</span>
              <span className="text-[11px] mb-1.5 text-slate-500 flex items-center gap-1">
                {estimating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
                {audience ? (
                  <motion.span key={audience.total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    Alcance estimado: <strong className="text-slate-700">{audience.total}</strong>{' '}
                    {audience.total === 1 ? 'usuario' : 'usuarios'}
                  </motion.span>
                ) : (
                  'Calculando alcance…'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
              {AUDIENCE_OPTIONS.map((option) => {
                const selected = values.audienceMode === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField('audienceMode', option.value)}
                    aria-pressed={selected}
                    className={`relative text-xs font-semibold py-2 px-2 rounded-lg transition-colors ${
                      selected ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="audience-pill"
                        className="absolute inset-0 bg-[#0d2346] rounded-lg shadow-sm"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {values.audienceMode !== 'ALL' && (
                <motion.div
                  key={values.audienceMode}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto flex flex-wrap gap-2">
                    {loadingTargets ? (
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando opciones…
                      </span>
                    ) : values.audienceMode === 'ROLE' ? (
                      roles.map((role) => {
                        const selected = values.selectedRoles.includes(role.value);
                        return (
                          <motion.button
                            key={role.value}
                            type="button"
                            layout
                            whileTap={{ scale: 0.95 }}
                            onClick={() => form.toggleRole(role.value)}
                            aria-pressed={selected}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                              selected
                                ? 'bg-[#0d2346] text-white border-[#0d2346]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {role.label}
                          </motion.button>
                        );
                      })
                    ) : groups.length === 0 ? (
                      <span className="text-xs text-slate-400">No hay secciones activas registradas.</span>
                    ) : (
                      groups.map((group) => {
                        const selected = values.selectedGroups.includes(group.id);
                        return (
                          <motion.button
                            key={group.id}
                            type="button"
                            layout
                            whileTap={{ scale: 0.95 }}
                            onClick={() => form.toggleGroup(group.id)}
                            aria-pressed={selected}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                              selected
                                ? 'bg-[#0d2346] text-white border-[#0d2346]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {group.name}
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <FieldError message={errors.audience} />
          </div>

          {/* Cuerpo */}
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="comm-content" className={labelClass}>
                Cuerpo del comunicado *
              </label>
              <span className={`text-[11px] mb-1.5 ${values.content.length > CONTENT_MAX ? 'text-rose-600' : 'text-slate-400'}`}>
                {values.content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              id="comm-content"
              rows={8}
              value={values.content}
              onChange={(e) => setField('content', e.target.value)}
              placeholder={'Estimada comunidad educativa:\n\nSe les informa que…\n\n- Primer punto\n- Segundo punto'}
              className={`${inputClass} leading-relaxed resize-y min-h-[160px] ${errors.content ? 'border-rose-400' : ''}`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Separe párrafos con una línea en blanco. Inicie una línea con «-» para crear una lista.
            </p>
            <FieldError message={errors.content} />
          </div>

          {/* Vigencia y acuse */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comm-expiration" className={labelClass}>
                Vigente hasta (opcional)
              </label>
              <input
                id="comm-expiration"
                type="date"
                value={values.expirationDate}
                onChange={(e) => setField('expirationDate', e.target.value)}
                className={`${inputClass} ${errors.expirationDate ? 'border-rose-400' : ''}`}
              />
              <FieldError message={errors.expirationDate} />
            </div>

            <div>
              <span className={labelClass}>Confirmación de lectura</span>
              <button
                type="button"
                role="switch"
                aria-checked={values.requiresAck}
                onClick={() => setField('requiresAck', !values.requiresAck)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-colors ${
                  values.requiresAck ? 'border-[#0d2346]/40 bg-[#0d2346]/[0.04]' : 'border-slate-300 bg-white'
                }`}
              >
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <ShieldCheck className={`w-4 h-4 ${values.requiresAck ? 'text-[#0d2346]' : 'text-slate-400'}`} />
                  Exigir acuse de recibo
                </span>
                <span
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    values.requiresAck ? 'bg-[#0d2346]' : 'bg-slate-300'
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 600, damping: 32 }}
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${
                      values.requiresAck ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Vista previa en vivo */}
        <div
          className={`bg-slate-100/70 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 sm:p-6 ${
            mobileTab === 'preview' ? 'block' : 'hidden'
          } lg:block`}
        >
          <div className="lg:sticky lg:top-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Vista previa para los destinatarios
            </p>
            <CommunicationDocument communication={previewData} variant="preview" />
          </div>
        </div>
      </div>
    </AnimatedModal>
  );
};
