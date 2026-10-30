export type HistoryEmptyKind = 'no-links' | 'no-records' | 'forbidden';

export const HISTORY_EMPTY_COPY: Record<
  HistoryEmptyKind,
  { title: string; description: string }
> = {
  'no-links': {
    title: 'Aún no tienes estudiantes vinculados',
    description:
      'Cuando la institución vincule a tus representados con tu cuenta, su asistencia aparecerá aquí. Consulta con la administración si crees que es un error.',
  },
  'no-records': {
    title: 'Sin registros de asistencia',
    description:
      'No hay asistencias registradas en este rango. Prueba ajustando el rango de fechas, el curso o el tipo de registro.',
  },
  forbidden: {
    title: 'No tienes acceso a este historial',
    description:
      'Tu rol no tiene permiso para ver este historial. Si lo necesitas, solicita acceso a la administración.',
  },
};

type ResolveInput = {
  isGuardianView: boolean;
  /** `undefined` mientras no haya respuesta del Encargado. */
  represented: readonly unknown[] | undefined;
  /** Código HTTP del error de carga, si lo hubo. */
  errorStatus: number | null;
};

/** Causa por la que el historial no tiene filas que mostrar. */
export function resolveHistoryEmptyKind({
  isGuardianView,
  represented,
  errorStatus,
}: ResolveInput): HistoryEmptyKind {
  if (errorStatus === 403) return 'forbidden';
  if (isGuardianView && represented && represented.length === 0) return 'no-links';
  return 'no-records';
}
