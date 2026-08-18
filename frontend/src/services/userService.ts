import { ImportedUserRow, User } from '@/types/user';

/**
 * Servicio para comunicación con el backend NestJS del CTP de Hojancha
 */
export const userService = {
  /**
   * Envía la lista de usuarios pre-validados para guardado masivo
   */
  bulkImportUsers: async (rows: ImportedUserRow[]): Promise<{ success: boolean; count: number }> => {
    const validRows = rows.filter((r) => r.isValid);

    // Simulación de llamada HTTP POST /api/v1/users/bulk
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      count: validRows.length,
    };
  },

  /**
   * Obtiene la lista de usuarios existentes (placeholder para integración futura)
   */
  getUsers: async (): Promise<User[]> => {
    return [];
  },
};
