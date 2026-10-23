import { useCallback, useEffect, useMemo, useState } from 'react';
import { HttpError } from '@/shared/api';
import { sessionHasPermission } from '@/shared/auth';
import { disciplineApi } from '../api/disciplineApi';
import { DISCIPLINE_PERMISSIONS } from './disciplineRouting';
import type {
  InfractionSeverity,
  InfractionSeverityRule,
  InfractionType,
} from './types';

type ActiveFilter = 'active' | 'inactive' | 'all';

export type InfractionForm = {
  name: string;
  description: string;
  severity: InfractionSeverity;
  legalReference: string;
};

const EMPTY_FORM: InfractionForm = {
  name: '',
  description: '',
  severity: 'MINOR',
  legalReference: '',
};

type Result = { ok: boolean; message: string };

function errorMessage(reason: unknown, fallback: string): string {
  if (reason instanceof HttpError && reason.message) return reason.message;
  if (reason instanceof Error && reason.message) return reason.message;
  return fallback;
}

export function useInfractionCatalog() {
  const canConfigure = sessionHasPermission(DISCIPLINE_PERMISSIONS.configure);
  const canExport = sessionHasPermission(DISCIPLINE_PERMISSIONS.export);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [rules, setRules] = useState<InfractionSeverityRule[]>([]);
  const [rows, setRows] = useState<InfractionType[]>([]);
  const [severityFilter, setSeverityFilter] = useState<InfractionSeverity | ''>('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InfractionType | null>(null);
  const [form, setForm] = useState<InfractionForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextRules, nextRows] = await Promise.all([
        disciplineApi.listSeverityRules(),
        disciplineApi.listInfractionTypes({
          severity: severityFilter || undefined,
          active: activeFilter === 'all' ? undefined : activeFilter === 'active',
        }),
      ]);
      setRules(nextRules);
      setRows(nextRows);
    } catch (reason) {
      setRows([]);
      setError(errorMessage(reason, 'No se pudo cargar el catálogo de faltas.'));
    } finally {
      setLoading(false);
    }
  }, [severityFilter, activeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.name} ${row.description ?? ''} ${row.legalReference ?? ''}`
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search]);

  const countsBySeverity = useMemo(() => {
    const counts: Partial<Record<InfractionSeverity, number>> = {};
    for (const row of rows) {
      if (!row.isActive) continue;
      counts[row.severity] = (counts[row.severity] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row: InfractionType) => {
    setEditing(row);
    setForm({
      name: row.name,
      description: row.description ?? '',
      severity: row.severity,
      legalReference: row.legalReference ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const submit = async (): Promise<Result> => {
    const name = form.name.trim();
    if (name.length < 3) {
      return { ok: false, message: 'El nombre debe tener al menos 3 caracteres.' };
    }
    const payload = {
      name,
      description: form.description.trim(),
      severity: form.severity,
      legalReference: form.legalReference.trim(),
    };
    setSaving(true);
    try {
      if (editing) {
        await disciplineApi.updateInfractionType(editing.id, payload);
      } else {
        await disciplineApi.createInfractionType(payload);
      }
      setModalOpen(false);
      setEditing(null);
      await load();
      return { ok: true, message: editing ? 'Tipo de falta actualizado.' : 'Tipo de falta creado.' };
    } catch (reason) {
      return { ok: false, message: errorMessage(reason, 'No se pudo guardar el tipo de falta.') };
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: InfractionType): Promise<Result> => {
    setSaving(true);
    try {
      if (row.isActive) {
        await disciplineApi.deactivateInfractionType(row.id);
      } else {
        await disciplineApi.updateInfractionType(row.id, { isActive: true });
      }
      await load();
      return {
        ok: true,
        message: row.isActive ? 'Tipo de falta desactivado.' : 'Tipo de falta reactivado.',
      };
    } catch (reason) {
      return { ok: false, message: errorMessage(reason, 'No se pudo cambiar el estado.') };
    } finally {
      setSaving(false);
    }
  };

  const exportCatalog = async (format: 'pdf' | 'excel'): Promise<Result> => {
    setExporting(format);
    try {
      await disciplineApi.exportInfractionTypes(format, {
        severity: severityFilter || undefined,
        active: activeFilter === 'all' ? undefined : activeFilter === 'active',
      });
      return { ok: true, message: format === 'pdf' ? 'PDF generado.' : 'Excel generado.' };
    } catch (reason) {
      return { ok: false, message: errorMessage(reason, 'No se pudo exportar el catálogo.') };
    } finally {
      setExporting(null);
    }
  };

  return {
    canConfigure,
    canExport,
    exporting,
    exportCatalog,
    rules,
    rows: visibleRows,
    countsBySeverity,
    severityFilter,
    setSeverityFilter,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    loading,
    error,
    saving,
    modalOpen,
    editing,
    form,
    setForm,
    openCreate,
    openEdit,
    closeModal,
    submit,
    toggleActive,
  };
}
