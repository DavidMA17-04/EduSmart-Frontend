import { roleModuleRoutes } from './RoleModuleRoutes';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { LoginPage } from '@/pages/login';
import { VerifyAccountPage } from '@/pages/verify-account';
import {
  AttendanceHistoryPage,
  AttendanceJustificationsPage,
  AttendanceRedeemPage,
} from '@/pages/attendance';
import { ATTENDANCE_PERMISSIONS } from '@/features/manage-attendance';
import {
  DisciplineHistoryPage,
  DisciplineNotificationsPage,
} from '@/pages/discipline';
import { DISCIPLINE_PERMISSIONS } from '@/features/manage-discipline';
import { SCHEDULE_PERMISSIONS } from '@/features/manage-schedule';
import { MySchedulePage } from '@/pages/my-schedule';
import { ProfileSettingsPage } from '@/pages/profile-settings';
import { ResetPasswordPage } from '@/pages/reset-password';
import { GuardianHomePage } from '@/pages/guardian-home';
import { StudentHomePage } from '@/pages/student-home';
import { RoleShell } from '@/widgets/app-shell';
import { HouseHomeRedirect } from './HouseHomeRedirect';
import { RequireAuth } from './RequireAuth';
import { RequirePermission } from './RequirePermission';
import { RootRedirect } from './RootRedirect';
import { staffHouseRoutes } from './StaffHouseRoutes';
import { TerritoryGuard } from './TerritoryGuard';

export const AppRouter = () => (
  <Routes>
    <Route element={<LoginPage />} path="/login" />
    <Route element={<ForgotPasswordPage />} path="/forgot-password" />
    <Route element={<VerifyAccountPage />} path="/verify-account" />
    <Route element={<ResetPasswordPage />} path="/reset-password" />

    <Route element={<RequireAuth />}>
      <Route element={<TerritoryGuard />}>
        <Route element={<RoleShell />} path="/admin">
          {staffHouseRoutes}
        </Route>
        <Route element={<RoleShell />} path="/teacher">
          {staffHouseRoutes}
        </Route>
        <Route element={<RoleShell />} path="/counselor">
          {staffHouseRoutes}
        </Route>
        <Route element={<RoleShell />} path="/director">
          {staffHouseRoutes}
        </Route>

        <Route element={<RoleShell />} path="/student">
          <Route element={<StudentHomePage />} index />
          <Route
            element={
              <RequirePermission
                anyOf={[SCHEDULE_PERMISSIONS.view, SCHEDULE_PERMISSIONS.viewOwn]}
              />
            }
          >
            <Route element={<MySchedulePage />} path="schedule" />
          </Route>
          <Route
            element={
              <RequirePermission
                anyOf={[
                  ATTENDANCE_PERMISSIONS.view,
                  ATTENDANCE_PERMISSIONS.viewOwn,
                ]}
              />
            }
          >
            <Route element={<AttendanceHistoryPage />} path="attendance" />
          </Route>
          <Route
            element={
              <RequirePermission
                anyOf={[
                  ATTENDANCE_PERMISSIONS.view,
                  ATTENDANCE_PERMISSIONS.viewOwn,
                  ATTENDANCE_PERMISSIONS.justify,
                ]}
              />
            }
          >
            <Route
              element={<AttendanceJustificationsPage />}
              path="attendance/justifications"
            />
          </Route>
          <Route element={<AttendanceRedeemPage />} path="attendance/redeem" />
          <Route
            element={
              <RequirePermission
                anyOf={[DISCIPLINE_PERMISSIONS.view, DISCIPLINE_PERMISSIONS.viewOwn]}
              />
            }
          >
            <Route element={<DisciplineHistoryPage />} path="discipline" />
          </Route>
          <Route element={<ProfileSettingsPage />} path="settings" />
          <Route element={<ProfileSettingsPage />} path="profile" />
          {roleModuleRoutes()}
          <Route element={<HouseHomeRedirect />} path="*" />
        </Route>

        <Route element={<RoleShell />} path="/guardian">
          <Route element={<GuardianHomePage />} index />
          <Route
            element={<DisciplineNotificationsPage />}
            path="discipline/notifications"
          />
          <Route
            element={
              <RequirePermission
                anyOf={[DISCIPLINE_PERMISSIONS.view, DISCIPLINE_PERMISSIONS.viewOwn]}
              />
            }
          >
            <Route element={<DisciplineHistoryPage />} path="discipline" />
          </Route>
          <Route
            element={
              <RequirePermission permission={ATTENDANCE_PERMISSIONS.viewOwn} />
            }
          >
            <Route element={<AttendanceHistoryPage />} path="attendance" />
          </Route>
          <Route element={<ProfileSettingsPage />} path="settings" />
          <Route element={<ProfileSettingsPage />} path="profile" />
          {roleModuleRoutes()}
          <Route element={<HouseHomeRedirect />} path="*" />
        </Route>
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
