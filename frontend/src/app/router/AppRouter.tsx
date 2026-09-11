import { Navigate, Route, Routes } from 'react-router-dom';
import { UserMethodSelectionPage } from '@/pages/Admin/Users/UserMethodSelectionPage/UserMethodSelectionPage';
import { UserBulkImportPage } from '@/pages/Admin/Users/UserBulkImportPage/UserBulkImportPage';
import { UserImportPreviewPage } from '@/pages/Admin/Users/UserImportPreviewPage/UserImportPreviewPage';
import { AdminHomePage } from '@/pages/admin-home';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { LoginPage } from '@/pages/login';
import { VerifyAccountPage } from '@/pages/verify-account';
import { RolesPermissionsPage } from '@/pages/roles-permissions';
import { SpecialtiesPage } from '@/pages/specialties';
import { SpecialtyKindPage } from '@/pages/specialty-kind';
import { AcademicPeriodsPage } from '@/pages/academic-periods';
import {
  AttendanceHomePage,
  AttendanceNewPage,
  AttendanceSessionPage,
} from '@/pages/attendance';
import { ATTENDANCE_PERMISSIONS } from '@/features/manage-attendance';
import { SectionsGroupsPage } from '@/pages/sections-groups';
import { TeachingAssignmentsPage } from '@/pages/teaching-assignments';
import { SchedulePage } from '@/pages/schedule';
import { MySchedulePage } from '@/pages/my-schedule';
import { UserCreatePage } from '@/pages/user-create';
import { UserDetailPage } from '@/pages/user-detail';
import { UsersDirectoryPage } from '@/pages/users-directory';
import { AdministrativeReportsPage } from '@/pages/administrative-reports';
import { ProfileSettingsPage } from '@/pages/profile-settings';
import { ResetPasswordPage } from '@/pages/reset-password';
import { ImportResultPage } from '@/pages/import-result';
import { AdminShell } from '@/widgets/app-shell';
import { SCHEDULE_PERMISSIONS } from '@/features/manage-schedule';
import { RequireAuth } from './RequireAuth';
import { RequirePermission } from './RequirePermission';
import { RootRedirect } from './RootRedirect';

export const AppRouter = () => (
  <Routes>
    <Route element={<LoginPage />} path="/login" />
    <Route element={<ForgotPasswordPage />} path="/forgot-password" />
    <Route element={<VerifyAccountPage />} path="/verify-account" />
    <Route element={<ResetPasswordPage />} path="/reset-password" />

    <Route element={<RequireAuth />}>
      <Route element={<AdminShell />} path="/admin">
        <Route element={<AdminHomePage />} index />
        <Route element={<AdminHomePage />} path="dashboard" />

        <Route element={<RequirePermission permission="administrator.view" />}>
          <Route element={<UserMethodSelectionPage />} path="users" />
          <Route element={<UserBulkImportPage />} path="users/import/bulk" />
          <Route element={<UserImportPreviewPage />} path="users/import/preview" />
          <Route element={<UsersDirectoryPage />} path="users/directory" />
          <Route element={<UserCreatePage />} path="users/new" />
          <Route element={<ImportResultPage />} path="users/import-result/:jobId" />
          <Route element={<UserDetailPage />} path="users/:userId" />
          <Route element={<AdministrativeReportsPage />} path="reports" />
        </Route>

        <Route element={<RequirePermission permission="roles_permissions.view" />}>
          <Route element={<RolesPermissionsPage />} path="roles-permissions" />
        </Route>

        <Route element={<RequirePermission permission="specialties.view" />}>
          <Route element={<SpecialtiesPage />} path="specialties" />
          <Route
            element={<SpecialtyKindPage kind="EXPLORATORY_WORKSHOP" />}
            path="specialties/workshops"
          />
          <Route
            element={<SpecialtyKindPage kind="TECHNICAL_SPECIALTY" />}
            path="specialties/technical"
          />
        </Route>

        <Route element={<RequirePermission permission="periods.view" />}>
          <Route element={<AcademicPeriodsPage />} path="academic-periods" />
        </Route>

        <Route element={<RequirePermission permission="sections.view" />}>
          <Route element={<SectionsGroupsPage />} path="sections-groups" />
        </Route>

        <Route element={<RequirePermission permission="academic_structure.view" />}>
          <Route element={<TeachingAssignmentsPage />} path="teaching-assignments" />
        </Route>

        <Route
          element={
            <RequirePermission permission={SCHEDULE_PERMISSIONS.view} />
          }
        >
          <Route element={<SchedulePage />} path="schedule" />
        </Route>

        <Route
          element={
            <RequirePermission
              permission={SCHEDULE_PERMISSIONS.viewOwn}
              withoutPermission={SCHEDULE_PERMISSIONS.view}
            />
          }
        >
          <Route element={<MySchedulePage />} path="my-schedule" />
        </Route>

        <Route
          element={
            <RequirePermission permission={ATTENDANCE_PERMISSIONS.view} />
          }
        >
          <Route element={<AttendanceHomePage />} path="attendance" />
          <Route
            element={<AttendanceSessionPage />}
            path="attendance/sessions/:sessionId"
          />
        </Route>

        <Route
          element={
            <RequirePermission permission={ATTENDANCE_PERMISSIONS.create} />
          }
        >
          <Route element={<AttendanceNewPage />} path="attendance/new" />
        </Route>

        <Route element={<ProfileSettingsPage />} path="settings" />
        <Route element={<ProfileSettingsPage />} path="profile" />
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
    <Route element={<Navigate replace to="/admin/reports" />} path="/administrative/reports" />
    <Route element={<Navigate replace to="/admin" />} path="/administrative/*" />

    <Route element={<Navigate replace to="/admin/users" />} path="/onboarding" />
    <Route element={<RootRedirect />} path="/" />
    <Route element={<RootRedirect />} path="*" />
  </Routes>
);

export default AppRouter;
