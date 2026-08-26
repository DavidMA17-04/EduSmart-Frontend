import { Navigate, Route, Routes } from 'react-router-dom';
import { UserOnboardingPage } from '@/pages/user-onboarding';
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
    <Route path="/onboarding" element={<UserOnboardingPage />} />
    <Route path="/administrative" element={<AdminShell />}>
      <Route index element={<AdminHomePage />} />
      <Route path="roles-permissions" element={<RolesPermissionsPage />} />
      <Route path="specialties" element={<SpecialtiesPage />} />
      <Route path="sections-groups" element={<SectionsGroupsPage />} />
      <Route path="users/new" element={<UserCreatePage />} />
      <Route path="users/import-result/:jobId" element={<ImportResultPage />} />
      <Route path="users/:userId" element={<UserDetailPage />} />
      <Route path="*" element={<AdminHomePage />} />
    </Route>
    <Route path="/" element={<Navigate to="/onboarding" replace />} />
    <Route path="*" element={<Navigate to="/onboarding" replace />} />
  </Routes>
);