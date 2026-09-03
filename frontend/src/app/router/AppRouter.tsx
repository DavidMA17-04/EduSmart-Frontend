import { Navigate, Route, Routes } from 'react-router-dom';
import { UserMethodSelectionPage } from '@/pages/Admin/Users/UserMethodSelectionPage/UserMethodSelectionPage';
import { UserBulkImportPage } from '@/pages/Admin/Users/UserBulkImportPage/UserBulkImportPage';
import { UserImportPreviewPage } from '@/pages/Admin/Users/UserImportPreviewPage/UserImportPreviewPage';
import { AdminHomePage } from '@/pages/admin-home';
import { LoginPage } from '@/pages/login';
import { RolesPermissionsPage } from '@/pages/roles-permissions';
import { SpecialtiesPage } from '@/pages/specialties';
import { AcademicPeriodsPage } from '@/pages/academic-periods';
import { SectionsGroupsPage } from '@/pages/sections-groups';
import { UserCreatePage } from '@/pages/user-create';
import { UserDetailPage } from '@/pages/user-detail';
import { UsersDirectoryPage } from '@/pages/users-directory';
import { ImportResultPage } from '@/pages/import-result';
import { AdminShell } from '@/widgets/app-shell';
import { RequireAuth } from './RequireAuth';
import { RootRedirect } from './RootRedirect';

export const AppRouter = () => (
  <Routes>
    <Route element={<LoginPage />} path="/login" />

    <Route element={<RequireAuth />}>
      <Route element={<AdminShell />} path="/admin">
        <Route element={<AdminHomePage />} index />
        <Route element={<AdminHomePage />} path="dashboard" />
        <Route element={<UserMethodSelectionPage />} path="users" />
        <Route element={<UserBulkImportPage />} path="users/import/bulk" />
        <Route element={<UserImportPreviewPage />} path="users/import/preview" />
        <Route element={<UsersDirectoryPage />} path="users/directory" />
        <Route element={<UserCreatePage />} path="users/new" />
        <Route element={<ImportResultPage />} path="users/import-result/:jobId" />
        <Route element={<UserDetailPage />} path="users/:userId" />
        <Route element={<RolesPermissionsPage />} path="roles-permissions" />
        <Route element={<SpecialtiesPage />} path="specialties" />
        <Route element={<AcademicPeriodsPage />} path="academic-periods" />
        <Route element={<SectionsGroupsPage />} path="sections-groups" />
        <Route element={<AdminHomePage />} path="*" />
      </Route>
    </Route>

    <Route element={<Navigate replace to="/admin" />} path="/administrative" />
    <Route element={<Navigate replace to="/admin/users" />} path="/administrative/users" />
    <Route element={<Navigate replace to="/admin/users/import/bulk" />} path="/administrative/users/import/bulk" />
    <Route element={<Navigate replace to="/admin/users/import/preview" />} path="/administrative/users/import/preview" />
    <Route element={<Navigate replace to="/admin/roles-permissions" />} path="/administrative/roles-permissions" />
    <Route element={<Navigate replace to="/admin/specialties" />} path="/administrative/specialties" />
    <Route element={<Navigate replace to="/admin/academic-periods" />} path="/administrative/academic-periods" />
    <Route element={<Navigate replace to="/admin/sections-groups" />} path="/administrative/sections-groups" />
    <Route element={<Navigate replace to="/admin" />} path="/administrative/*" />

    <Route element={<Navigate replace to="/admin/users" />} path="/onboarding" />
    <Route element={<RootRedirect />} path="/" />
    <Route element={<RootRedirect />} path="*" />
  </Routes>
);

export default AppRouter;
