import { useCallback, useEffect, useState } from 'react';
import type { Permission } from '@/entities/permission';
import { permissionApi } from '../api/permissionApi';
import { syncPermissionCatalog } from './syncPermissionCatalog';

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const catalog = await syncPermissionCatalog(await permissionApi.list());
      setPermissions(catalog);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los permisos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { permissions, isLoading, error, reload: load };
}