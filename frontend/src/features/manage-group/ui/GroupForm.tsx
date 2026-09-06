import type { FormEventHandler } from 'react';
import type { GuideTeacher } from '@/entities/group';
import type { Section } from '@/entities/section';
import type { Specialty } from '@/entities/specialty';
import { parseNumberField } from '@/shared/lib/number-input';
import { FormActions, Input, Select } from '@/shared/ui';
import type { GroupFormValues } from '../model/useGroupForm';
import styles from './GroupForm.module.css';

interface GroupFormProps {
  values: GroupFormValues;
  sections: Section[];
  specialties: Specialty[];
  guideTeachers: GuideTeacher[];
  isSubmitting?: boolean;
  submitLabel?: string;
  onChange: <K extends keyof GroupFormValues>(field: K, value: GroupFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const GroupForm = ({
  values,
  sections,
  specialties,
  guideTeachers,
  isSubmitting = false,
  submitLabel = 'Guardar cambios',
  onChange,
  onSubmit,
  onCancel,
}: GroupFormProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label>
      Nombre de la sección
      <Input
        maxLength={50}
        onChange={(event) => onChange('name', event.target.value)}
        placeholder="9-1"
        required
        value={values.name}
      />
    </label>
    <label>
      Nivel
      <Select onChange={(event) => onChange('sectionId', event.target.value)} required value={values.sectionId}>
        <option disabled value="">
          Seleccione un nivel
        </option>
        {sections.map((section) => (
          <option key={section.id} value={section.id}>
            {section.gradeLevel} - {section.name}
          </option>
        ))}
      </Select>
    </label>
    <label>
      Especialidad
      <Select onChange={(event) => onChange('specialtyId', event.target.value)} value={values.specialtyId}>
        <option value="">Sin especialidad</option>
        {specialties.map((specialty) => (
          <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
        ))}
      </Select>
      <span className={styles.hint}>Indique si esta sección tiene especialidad. Puede quedar vacía.</span>
    </label>
    <label>
      Cantidad de estudiantes
      <Input
        max={100}
        min={0}
        onChange={(event) => onChange('studentCount', parseNumberField(event.target.value))}
        placeholder="0"
        required
        type="number"
        value={values.studentCount}
      />
    </label>
    <label>
      Docente guía
      <Select onChange={(event) => onChange('guideTeacherId', event.target.value)} value={values.guideTeacherId}>
        <option value="">Sin asignar</option>
        {guideTeachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </option>
        ))}
      </Select>
      <span className={styles.hint}>Los docentes se crean y editan en la pestaña Docentes guía.</span>
    </label>
    <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={submitLabel} />
  </form>
);
