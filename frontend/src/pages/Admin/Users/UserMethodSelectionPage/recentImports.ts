export type RecentImportItem = {
  id: string;
  name: string;
  date: string;
  status: string;
};

export const CEDULA_IMPORT_HINT =
  'Las cédulas deben tener entre 9 y 30 dígitos (los guiones se ignoran).';

export function readRecentImports(storage: Pick<Storage, 'getItem'> | null | undefined): RecentImportItem[] {
  try {
    const stored = storage?.getItem('edusmart_recent_imports');
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed.filter(
      (item): item is RecentImportItem =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as RecentImportItem).id === 'string' &&
        typeof (item as RecentImportItem).name === 'string',
    );
  } catch {
    return [];
  }
}
