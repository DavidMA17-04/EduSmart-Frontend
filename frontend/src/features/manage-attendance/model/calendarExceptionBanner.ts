import type { AttendanceCalendarException } from '@/entities/attendance';

export function formatCalendarExceptionBanner(
  exception: AttendanceCalendarException | null | undefined,
): string | null {
  if (!exception) return null;
  const range = `${exception.startDate} – ${exception.endDate}`;
  if (exception.exceptionType === 'SUSPENDED') {
    return `Semana de exámenes: «${exception.title}» (${range}). Las lecciones ordinarias están suspendidas; las ausencias no penalizan el porcentaje de asistencia.`;
  }
  return `Período especial: «${exception.title}» (${range}). Las inasistencias se justifican automáticamente de forma institucional.`;
}
