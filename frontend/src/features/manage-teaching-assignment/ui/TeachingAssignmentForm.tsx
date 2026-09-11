import type { AcademicPeriod } from '@/entities/academic-period';
import type { AcademicGroup, GuideTeacher } from '@/entities/group';
import type {
  AcademicOfferingKind,
} from '@/entities/teaching-assignment';
import { offeringKindLabel } from '@/entities/teaching-assignment';
import { Button, Select } from '@/shared/ui';
import type { TeachingAssignmentFormValues } from '../model/formUtils';
import styles from './TeachingAssignmentForm.module.css';

type OfferingOption = { id: number; name: string };

type TeachingAssignmentFormProps = {
  dialogMode: 'create' | 'edit';
  form: TeachingAssignmentFormValues;
  teachers: GuideTeacher[];
  groups: AcademicGroup[];
  periods: AcademicPeriod[];
  allowedKinds: AcademicOfferingKind[];
  gradeLevel: number | null;
  offeringOptions: OfferingOption[];
  isSaving: boolean;
  teacherDisplayName: (teacher: GuideTeacher) => string;
  onChange: (patch: Partial<TeachingAssignmentFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function TeachingAssignmentForm({
  dialogMode,
  form,
  teachers,
  groups,
  periods,
  allowedKinds,
  gradeLevel,
  offeringOptions,
  isSaving,
  teacherDisplayName,
  onChange,
  onSubmit,
  onCancel,
}: TeachingAssignmentFormProps) {
  const isEdit = dialogMode === 'edit';
  const offeringLabel =
    form.offeringKind === 'SUBJECT'
      ? 'Materia'
      : form.offeringKind === 'EXPLORATORY_WORKSHOP'
        ? 'Taller exploratorio'
        : form.offeringKind === 'TECHNICAL_SPECIALTY'
          ? 'Especialidad técnica'
          : 'Oferta';

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className={styles.field}>
        <span>Docente</span>
        <Select
          aria-label="Docente"
          disabled={isEdit || isSaving}
          onChange={(e) => onChange({ userId: e.target.value })}
          required={!isEdit}
          value={form.userId}
        >
          <option value="">Seleccione un docente…</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {teacherDisplayName(t)}
            </option>
          ))}
        </Select>
      </label>

      <label className={styles.field}>
        <span>Grupo</span>
        <Select
          aria-label="Grupo"
          disabled={isEdit || isSaving}
          onChange={(e) => onChange({ groupId: e.target.value })}
          required={!isEdit}
          value={form.groupId}
        >
          <option value="">Seleccione un grupo…</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
              {g.section?.gradeLevel != null ? ` (grado ${g.section.gradeLevel})` : ''}
            </option>
          ))}
        </Select>
      </label>

      {form.groupId ? (
        <p className={styles.hint} role="status">
          Grado del grupo:{' '}
          <strong>{gradeLevel != null ? gradeLevel : 'no disponible'}</strong>
          {gradeLevel != null && allowedKinds.length > 0
            ? ` · Tipos permitidos: ${allowedKinds.map(offeringKindLabel).join(', ')}`
            : null}
        </p>
      ) : null}

      <label className={styles.field}>
        <span>Período académico</span>
        <Select
          aria-label="Período académico"
          disabled={isSaving}
          onChange={(e) => onChange({ academicPeriodId: e.target.value })}
          required
          value={form.academicPeriodId}
        >
          <option value="">Seleccione un período…</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.status})
            </option>
          ))}
        </Select>
      </label>

      <label className={styles.field}>
        <span>Tipo de oferta</span>
        <Select
          aria-label="Tipo de oferta"
          disabled={isSaving || (!isEdit && !form.groupId)}
          onChange={(e) =>
            onChange({
              offeringKind: e.target.value as AcademicOfferingKind | '',
            })
          }
          required
          value={form.offeringKind}
        >
          <option value="">Seleccione el tipo…</option>
          {allowedKinds.map((kind) => (
            <option key={kind} value={kind}>
              {offeringKindLabel(kind)}
            </option>
          ))}
          {isEdit &&
          form.offeringKind &&
          !allowedKinds.includes(form.offeringKind) ? (
            <option value={form.offeringKind}>
              {offeringKindLabel(form.offeringKind)} (actual)
            </option>
          ) : null}
        </Select>
      </label>

      {form.offeringKind === 'SUBJECT' ? (
        <label className={styles.field}>
          <span>{offeringLabel}</span>
          <Select
            aria-label={offeringLabel}
            disabled={isSaving}
            onChange={(e) => onChange({ subjectId: e.target.value, specialtyId: '' })}
            required
            value={form.subjectId}
          >
            <option value="">Seleccione una materia…</option>
            {offeringOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </label>
      ) : null}

      {form.offeringKind === 'EXPLORATORY_WORKSHOP' ||
      form.offeringKind === 'TECHNICAL_SPECIALTY' ? (
        <label className={styles.field}>
          <span>{offeringLabel}</span>
          <Select
            aria-label={offeringLabel}
            disabled={isSaving}
            onChange={(e) => onChange({ specialtyId: e.target.value, subjectId: '' })}
            required
            value={form.specialtyId}
          >
            <option value="">
              {form.offeringKind === 'EXPLORATORY_WORKSHOP'
                ? 'Seleccione un taller…'
                : 'Seleccione una especialidad…'}
            </option>
            {offeringOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </label>
      ) : null}

      <div className={styles.actions}>
        <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear asignación'}
        </Button>
      </div>
    </form>
  );
}
