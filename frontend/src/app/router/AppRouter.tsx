import { Navigate, Route, Routes } from 'react-router-dom';
import { UserMethodSelectionPage } from '@/pages/Admin/Users/UserMethodSelectionPage/UserMethodSelectionPage';
import { UserBulkImportPage } from '@/pages/Admin/Users/UserBulkImportPage/UserBulkImportPage';
import { UserImportPreviewPage } from '@/pages/Admin/Users/UserImportPreviewPage/UserImportPreviewPage';
import { AdminHomePage } from '@/pages/admin-home';
import { RolesPermissionsPage } from '@/pages/roles-permissions';
import { SpecialtiesPage } from '@/pages/specialties';
import { SectionsGroupsPage } from '@/pages/sections-groups';
import { UserCreatePage } from '@/pages/user-create';
import { UserDetailPage } from '@/pages/user-detail';
import { ImportResultPage } from '@/pages/import-result';
import { AdminShell } from '@/widgets/app-shell';

export const AppRouter = () => (
  <Routes>
    {/* Rutas Oficiales del Módulo Administrativo: /admin */}
    <Route path="/admin" element={<AdminShell />}>
      <Route index element={<AdminHomePage />} />
      <Route path="dashboard" element={<AdminHomePage />} />
      <Route path="users" element={<UserMethodSelectionPage />} />
      <Route path="users/import/bulk" element={<UserBulkImportPage />} />
      <Route path="users/import/preview" element={<UserImportPreviewPage />} />
      <Route path="users/new" element={<UserCreatePage />} />
      <Route path="users/import-result/:jobId" element={<ImportResultPage />} />
      <Route path="users/:userId" element={<UserDetailPage />} />
      <Route path="roles-permissions" element={<RolesPermissionsPage />} />
      <Route path="specialties" element={<SpecialtiesPage />} />
      <Route path="sections-groups" element={<SectionsGroupsPage />} />
      <Route path="*" element={<AdminHomePage />} />
    </Route>

    {/* Redirecciones de compatibilidad para enlaces antiguos /administrative */}
    <Route path="/administrative" element={<Navigate to="/admin" replace />} />
    <Route path="/administrative/users" element={<Navigate to="/admin/users" replace />} />
    <Route path="/administrative/users/import/bulk" element={<Navigate to="/admin/users/import/bulk" replace />} />
    <Route path="/administrative/users/import/preview" element={<Navigate to="/admin/users/import/preview" replace />} />
    <Route path="/administrative/roles-permissions" element={<Navigate to="/admin/roles-permissions" replace />} />
    <Route path="/administrative/specialties" element={<Navigate to="/admin/specialties" replace />} />
    <Route path="/administrative/sections-groups" element={<Navigate to="/admin/sections-groups" replace />} />
    <Route path="/administrative/*" element={<Navigate to="/admin" replace />} />

    {/* Redirecciones automáticas */}
    <Route path="/onboarding" element={<Navigate to="/admin/users" replace />} />
    <Route path="/" element={<Navigate to="/admin/users" replace />} />
    <Route path="*" element={<Navigate to="/admin/users" replace />} />
  </Routes>
);

export default AppRouter;