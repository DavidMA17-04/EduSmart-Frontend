import { Navigate, Route, Routes } from 'react-router-dom';
import { UserOnboardingPage } from '@/pages/user-onboarding';
import { AdminHomePage } from '@/pages/admin-home';
import { RolesPermissionsPage } from '@/pages/roles-permissions';
import { SpecialtiesPage } from '@/pages/specialties';
import { SectionsGroupsPage } from '@/pages/sections-groups';
import { AdminShell } from '@/widgets/app-shell';

export const AppRouter = () => (
  <Routes>
    <Route path="/onboarding" element={<UserOnboardingPage />} />
    <Route path="/administrative" element={<AdminShell />}>
      <Route index element={<AdminHomePage />} />
      <Route path="roles-permissions" element={<RolesPermissionsPage />} />
      <Route path="specialties" element={<SpecialtiesPage />} />
      <Route path="sections-groups" element={<SectionsGroupsPage />} />
      <Route path="*" element={<AdminHomePage />} />
    </Route>
    <Route path="/" element={<Navigate to="/onboarding" replace />} />
    <Route path="*" element={<Navigate to="/onboarding" replace />} />
  </Routes>
);