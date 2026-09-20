import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
  onCreateSubject?: () => void;
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
  onCreateSubject,
}: TeachingAssignmentFormProps) {
  const isEdit = dialogMode === 'edit';
  const offeringLabel =
    form.offeringKind === 'SUBJECT'
      ? 'Materia'
      : form.offeringKind === 'EXPLORATORY_WORKSHOP'
        ? 'Taller exploratorio'
        : form.offeringKind === 'TECHNICAL_SPECIALTY'
          ? 'Carrera Técnica'
          : 'Oferta';

  const selectedGroupIds = isEdit
    ? form.groupId
      ? [form.groupId]
      : []
    : form.groupIds;
  const hasGroupsSelected = selectedGroupIds.length > 0;

  const toggleGroupId = (id: string) => {
    const next = form.groupIds.includes(id)
      ? form.groupIds.filter((g) => g !== id)
      : [...form.groupIds, id];
    onChange({ groupIds: next });
  };

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

      {isEdit ? (
        <label className={styles.field}>
          <span>Grupo</span>
          <Select
            aria-label="Grupo"
            disabled
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
      ) : (
        <fieldset className={styles.field} disabled={isSaving}>
          <legend>Grupos / secciones</legend>
          <p className={styles.hint}>Seleccione una o más secciones para asignar al docente.</p>
          <div className={styles.groupChecklist} role="group" aria-label="Grupos">
            {groups.map((g) => {
              const id = String(g.id);
              const checked = form.groupIds.includes(id);
              return (
                <label key={g.id} className={styles.checkItem}>
                  <input
                    checked={checked}
                    onChange={() => toggleGroupId(id)}
                    type="checkbox"
                  />
                  <span>
                    {g.name}
                    {g.section?.gradeLevel != null ? ` (grado ${g.section.gradeLevel})` : ''}
                  </span>
                </label>
              );
            })}
          </div>
          {groups.length === 0 ? (
            <p className={styles.hint}>No hay grupos disponibles.</p>
          ) : null}
        </fieldset>
      )}

      {hasGroupsSelected ? (
        <p className={styles.hint} role="status">
          Grado del grupo:{' '}
          <strong>{gradeLevel != null ? gradeLevel : 'no disponible'}</strong>
          {gradeLevel != null && allowedKinds.length > 0
            ? ` · Tipos permitidos: ${allowedKinds.map(offeringKindLabel).join(', ')}`
            : null}
        </p>
      ) : null}

      <label className={styles.field}>
        <span>Curso lectivo</span>
        <Select
          aria-label="Curso lectivo"
          disabled={isSaving}
          onChange={(e) => onChange({ academicPeriodId: e.target.value })}
          required
          value={form.academicPeriodId}
        >
          <option value="">Seleccione un curso lectivo…</option>
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
          disabled={isSaving || (!isEdit && !hasGroupsSelected)}
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
        <div className={styles.subjectBlock}>
          <label className={styles.field}>
            <span>Nombre de la materia</span>
            <Select
              aria-label={offeringLabel}
              disabled={isSaving || offeringOptions.length === 0}
              onChange={(e) =>
                onChange({ subjectId: e.target.value, specialtyId: '' })
              }
              required
              value={form.subjectId}
            >
              <option value="">
                {offeringOptions.length === 0
                  ? 'No hay materias cargadas…'
                  : 'Seleccione una materia…'}
              </option>
              {offeringOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </label>
          {offeringOptions.length === 0 ? (
            <p className={styles.hint}>
              Primero crea la materia con su nombre. Puedes hacerlo aquí o en el
              módulo{' '}
              <Link className={styles.inlineLink} to="/admin/subjects">
                Materias
              </Link>
              .
            </p>
          ) : null}
          {onCreateSubject ? (
            <Button
              disabled={isSaving}
              onClick={onCreateSubject}
              type="button"
              variant="secondary"
            >
              <Plus size={16} />
              Nueva materia
            </Button>
          ) : null}
        </div>
      ) : null}

      {form.offeringKind === 'EXPLORATORY_WORKSHOP' ||
      form.offeringKind === 'TECHNICAL_SPECIALTY' ? (
        <label className={styles.field}>
          <span>{offeringLabel}</span>
          <Select
            aria-label={offeringLabel}
            disabled={isSaving}
            onChange={(e) =>
              onChange({ specialtyId: e.target.value, subjectId: '' })
            }
            required
            value={form.specialtyId}
          >
            <option value="">
              {form.offeringKind === 'EXPLORATORY_WORKSHOP'
                ? 'Seleccione un taller…'
                : 'Seleccione una carrera técnica…'}
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
        <Button
          disabled={isSaving}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          Cancelar
        </Button>
        <Button disabled={isSaving} type="submit">
          {isSaving
            ? 'Guardando…'
            : isEdit
              ? 'Guardar cambios'
              : form.groupIds.length > 1
                ? `Crear ${form.groupIds.length} asignaciones`
                : 'Crear asignación'}
        </Button>
      </div>
    </form>
  );
}
