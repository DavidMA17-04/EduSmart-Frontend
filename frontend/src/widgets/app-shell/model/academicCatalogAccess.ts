/** Mutación de oferta / estructura. Ver no abre estas pantallas (el docente consulta vía horario y asistencia). */
export const ACADEMIC_SPECIALTIES_MANAGE = [
  'specialties.create',
  'specialties.edit',
  'academic_structure.configure',
] as const;

export const ACADEMIC_SUBJECTS_MANAGE = [
  'academic_structure.create',
  'academic_structure.edit',
  'academic_structure.configure',
] as const;

export const ACADEMIC_PERIODS_MANAGE = [
  'periods.create',
  'periods.edit',
  'academic_structure.configure',
] as const;

export const ACADEMIC_SECTIONS_MANAGE = [
  'sections.create',
  'sections.edit',
  'academic_structure.configure',
] as const;
