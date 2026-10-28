import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Communication,
  CommunicationPriority,
  CommunicationRecipient,
  CommunicationStatus,
  CreateCommunicationPayload,
} from '@/types/communications';

export type AudienceMode = 'ALL' | 'ROLE' | 'GROUP';

export const TITLE_MAX = 255;
export const CONTENT_MAX = 8000;

export interface CommunicationFormValues {
  title: string;
  content: string;
  priority: CommunicationPriority;
  requiresAck: boolean;
  /** yyyy-mm-dd (vigencia hasta el final de ese día, hora de Costa Rica). */
  expirationDate: string;
  audienceMode: AudienceMode;
  selectedRoles: string[];
  selectedGroups: string[];
}

export type CommunicationFormErrors = Partial<Record<'title' | 'content' | 'audience' | 'expirationDate', string>>;

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  // Fecha local (Costa Rica) para el input type="date".
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function todayInput(): string {
  return toDateInput(new Date().toISOString());
}

function valuesFrom(initial?: Communication | null): CommunicationFormValues {
  const recipients = initial?.recipients ?? [];
  const roles = recipients.filter((r) => r.recipientType === 'ROLE' && r.targetId).map((r) => String(r.targetId));
  const groups = recipients.filter((r) => r.recipientType === 'GROUP' && r.targetId).map((r) => String(r.targetId));
  const audienceMode: AudienceMode = groups.length > 0 ? 'GROUP' : roles.length > 0 ? 'ROLE' : 'ALL';

  return {
    title: initial?.title ?? '',
    content: initial?.content ?? '',
    priority: initial?.priority ?? 'NORMAL',
    requiresAck: initial?.requiresAcknowledgment ?? false,
    expirationDate: toDateInput(initial?.expirationDate),
    audienceMode,
    selectedRoles: roles,
    selectedGroups: groups,
  };
}

function validate(values: CommunicationFormValues): CommunicationFormErrors {
  const errors: CommunicationFormErrors = {};
  const title = values.title.trim();
  const content = values.content.trim();

  if (title.length < 3) errors.title = 'El título debe tener al menos 3 caracteres.';
  else if (title.length > TITLE_MAX) errors.title = `El título admite un máximo de ${TITLE_MAX} caracteres.`;

  if (content.length < 5) errors.content = 'El contenido debe tener al menos 5 caracteres.';
  else if (content.length > CONTENT_MAX) errors.content = `El contenido admite un máximo de ${CONTENT_MAX} caracteres.`;

  if (values.audienceMode === 'ROLE' && values.selectedRoles.length === 0) {
    errors.audience = 'Seleccione al menos un rol destinatario.';
  }
  if (values.audienceMode === 'GROUP' && values.selectedGroups.length === 0) {
    errors.audience = 'Seleccione al menos una sección destinataria.';
  }

  if (values.expirationDate && values.expirationDate < todayInput()) {
    errors.expirationDate = 'La vigencia no puede ser una fecha pasada.';
  }

  return errors;
}

/**
 * Estado y validación del formulario de redacción. Se reinicia cada vez que
 * se abre el editor o cambia el comunicado a editar.
 */
export function useCommunicationForm(initialData: Communication | null | undefined, isOpen: boolean) {
  const [values, setValues] = useState<CommunicationFormValues>(() => valuesFrom(initialData));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(valuesFrom(initialData));
      setTouched(false);
    }
  }, [initialData, isOpen]);

  const setField = useCallback(
    <K extends keyof CommunicationFormValues>(key: K, value: CommunicationFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleRole = useCallback((role: string) => {
    setValues((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter((r) => r !== role)
        : [...prev.selectedRoles, role],
    }));
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setValues((prev) => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter((g) => g !== groupId)
        : [...prev.selectedGroups, groupId],
    }));
  }, []);

  const recipients = useMemo<CommunicationRecipient[]>(() => {
    if (values.audienceMode === 'ROLE') {
      return values.selectedRoles.map((targetId) => ({ recipientType: 'ROLE', targetId }));
    }
    if (values.audienceMode === 'GROUP') {
      return values.selectedGroups.map((targetId) => ({ recipientType: 'GROUP', targetId }));
    }
    return [{ recipientType: 'ALL' }];
  }, [values.audienceMode, values.selectedRoles, values.selectedGroups]);

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(valuesFrom(initialData)),
    [values, initialData],
  );

  /** Marca el formulario como intentado y devuelve el payload si es válido. */
  const buildPayload = useCallback(
    (status: CommunicationStatus): CreateCommunicationPayload | null => {
      setTouched(true);
      if (!isValid) return null;
      return {
        title: values.title.trim(),
        content: values.content.trim(),
        priority: values.priority,
        status,
        requiresAcknowledgment: values.requiresAck,
        expirationDate: values.expirationDate
          ? `${values.expirationDate}T23:59:59-06:00`
          : null,
        recipients,
      };
    },
    [isValid, recipients, values],
  );

  return {
    values,
    setField,
    toggleRole,
    toggleGroup,
    recipients,
    errors: touched ? errors : {},
    isValid,
    isDirty,
    buildPayload,
  };
}
