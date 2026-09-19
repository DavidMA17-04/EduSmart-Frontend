import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Subject, SubjectStatus } from '@/entities/subject';
import { HttpError } from '@/shared/api';
import { useToast } from '@/shared/ui';
import { subjectApi } from '../api/subjectApi';

export type SubjectFormValues = {
  name: string;
  code: string;
  status: SubjectStatus;
};

type DialogMode = 'create' | 'edit' | null;
type StatusFilter = 'ALL' | SubjectStatus;

const emptyForm = (): SubjectFormValues => ({
  name: '',
  code: '',
  status: 'ACTIVE',
});

export function useSubjectsPanel() {
  const toast = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<SubjectFormValues>(emptyForm);
  const [pendingDeactivate, setPendingDeactivate] = useState<Subject | null>(
    null,
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await subjectApi.list();
      setRows(items);
      setError(null);
    } catch (reason) {
      setError(
        reason instanceof HttpError
          ? reason.message
          : 'No se pudieron cargar las materias.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        (row.code ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const setField = <K extends keyof SubjectFormValues>(
    field: K,
    value: SubjectFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreate = () => {
    setMutationError(null);
    setSelectedId(null);
    setForm(emptyForm());
    setDialogMode('create');
    window.requestAnimationFrame(() => nameInputRef.current?.focus());
  };

  const openEdit = (subject: Subject) => {
    setMutationError(null);
    setSelectedId(subject.id);
    setForm({
      name: subject.name,
      code: subject.code ?? '',
      status: subject.status,
    });
    setDialogMode('edit');
    window.requestAnimationFrame(() => nameInputRef.current?.focus());
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialogMode(null);
    setMutationError(null);
    setForm(emptyForm());
  };

  const mapError = (reason: unknown, fallback: string) => {
    if (reason instanceof HttpError && reason.status === 409) {
      return 'Ya existe una materia con ese nombre.';
    }
    if (
      reason instanceof Error &&
      /already exists|ya existe|duplicate|Conflict/i.test(reason.message)
    ) {
      return 'Ya existe una materia con ese nombre.';
    }
    if (reason instanceof HttpError && reason.message) return reason.message;
    if (reason instanceof Error && reason.message) return reason.message;
    return fallback;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) {
      setMutationError('El nombre de la materia es obligatorio (mín. 2 caracteres).');
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);
    try {
      if (dialogMode === 'create') {
        await subjectApi.create({
          name,
          code: form.code.trim() || null,
          status: form.status,
        });
        toast.push('Materia creada.');
      } else if (dialogMode === 'edit' && selectedId != null) {
        await subjectApi.update(selectedId, {
          name,
          code: form.code.trim() || null,
          status: form.status,
        });
        toast.push('Cambios guardados.');
      }
      setDialogMode(null);
      setForm(emptyForm());
      await load();
    } catch (reason) {
      const message = mapError(reason, 'No se pudo guardar la materia.');
      setMutationError(message);
      toast.push(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!pendingDeactivate) return;
    setIsSubmitting(true);
    try {
      await subjectApi.deactivate(pendingDeactivate.id);
      setPendingDeactivate(null);
      toast.push('Materia inactivada.');
      await load();
    } catch (reason) {
      toast.push(mapError(reason, 'No se pudo inactivar la materia.'), 'error');
      setPendingDeactivate(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    rows: pageRows,
    total: filtered.length,
    isLoading,
    error,
    mutationError,
    isSubmitting,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page: currentPage,
    setPage,
    totalPages,
    dialogMode,
    form,
    setField,
    nameInputRef,
    openCreate,
    openEdit,
    closeDialog,
    submit,
    pendingDeactivate,
    requestDeactivate: setPendingDeactivate,
    cancelDeactivate: () => setPendingDeactivate(null),
    confirmDeactivate,
    reload: load,
  };
}
