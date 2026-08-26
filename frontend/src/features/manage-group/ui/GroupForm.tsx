import type { FormEventHandler } from 'react';
import type { GuideTeacher } from '@/entities/group';
import type { Section } from '@/entities/section';
import { FormActions, Input, Select } from '@/shared/ui';
import type { GroupFormValues } from '../model/useGroupForm';
import styles from './GroupForm.module.css';

interface GroupFormProps {
  title: string;
  values: GroupFormValues;
  sections: Section[];
  guideTeachers: GuideTeacher[];
  isSubmitting?: boolean;
  onChange: <K extends keyof GroupFormValues>(field: K, value: GroupFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const GroupForm = ({ title, values, sections, guideTeachers, isSubmitting = false, onChange, onSubmit, onCancel }: GroupFormProps) => (
  <aside className={styles.panel}>
    <h2>{title}</h2>
    <form onSubmit={onSubmit}>
      <label>Nombre de la sección<Input maxLength={50} onChange={(event) => onChange('name', event.target.value)} placeholder="9-1" required value={values.name} /></label>
      <label>
        Nivel
        <Select onChange={(event) => onChange('sectionId', event.target.value)} required value={values.sectionId}>
          <option disabled value="">Seleccione un nivel</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>{section.gradeLevel} - {section.name}</option>
          ))}
        </Select>
      </label>
      <label>Cantidad de estudiantes<Input max={100} min={0} onChange={(event) => onChange('studentCount', Number(event.target.value))} required type="number" value={values.studentCount} /></label>
      <label>
        Docente guía
        <Select onChange={(event) => onChange('guideTeacherId', event.target.value)} value={values.guideTeacherId}>
          <option value="">Sin asignar</option>
          {guideTeachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
          ))}
        </Select>
        <span className={styles.hint}>Los docentes se crean y editan en la pestaña Docentes guía.</span>
      </label>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel="Guardar cambios" />
    </form>
  </aside>
);
