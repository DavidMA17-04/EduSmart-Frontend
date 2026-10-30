import { roleModuleRoutes } from './RoleModuleRoutes';
import { Route } from 'react-router-dom';
import { UserMethodSelectionPage } from '@/pages/Admin/Users/UserMethodSelectionPage/UserMethodSelectionPage';
import { UserBulkImportPage } from '@/pages/Admin/Users/UserBulkImportPage/UserBulkImportPage';
import { UserImportPreviewPage } from '@/pages/Admin/Users/UserImportPreviewPage/UserImportPreviewPage';
import { RolesPermissionsPage } from '@/pages/roles-permissions';
import { SpecialtiesPage } from '@/pages/specialties';
import { SpecialtyKindPage } from '@/pages/specialty-kind';
import { AcademicPeriodsPage } from '@/pages/academic-periods';
import { AcademicStructureWizardPage } from '@/pages/academic-structure-wizard';
import {
  AbsenteeismAlertsPage,
  AttendanceHistoryPage,
  AttendanceHomePage,
  AttendanceExceptionsPage,
  AttendanceJustificationsPage,
  AttendanceNewPage,
  AttendanceReportsPage,
  AttendanceSessionPage,
} from '@/pages/attendance';
import { ATTENDANCE_PERMISSIONS } from '@/features/manage-attendance';
import {
  DisciplineCalendarPage,
  DisciplineCasePage,
  DisciplineCasesPage,
  DisciplineCatalogPage,
  DisciplineDashboardPage,
  DisciplineHistoryPage,
  DisciplineNotificationsPage,
  DisciplineProcessPage,
  DisciplineRegisterPage,
} from '@/pages/discipline';
import { DISCIPLINE_PERMISSIONS } from '@/features/manage-discipline';
import { SectionsGroupsPage } from '@/pages/sections-groups';
import { SubjectsPage } from '@/pages/subjects';
import { TeachingAssignmentsPage } from '@/pages/teaching-assignments';
import { SchedulePage } from '@/pages/schedule';
import { MySchedulePage } from '@/pages/my-schedule';
import { UserCreatePage } from '@/pages/user-create';
import { UserDetailPage } from '@/pages/user-detail';
import { UsersDirectoryPage } from '@/pages/users-directory';
import { AdministrativeReportsPage } from '@/pages/administrative-reports';
import { ProfileSettingsPage } from '@/pages/profile-settings';
import { ImportResultPage } from '@/pages/import-result';
import { StaffOnly } from '@/widgets/app-shell';
import { SCHEDULE_PERMISSIONS } from '@/features/manage-schedule';
import {
  ACADEMIC_PERIODS_MANAGE,
  ACADEMIC_SECTIONS_MANAGE,
  ACADEMIC_SPECIALTIES_MANAGE,
  ACADEMIC_SUBJECTS_MANAGE,
} from '@/widgets/app-shell/model/academicCatalogAccess';
import { HouseHomeRedirect } from './HouseHomeRedirect';
import { RequirePermission } from './RequirePermission';
import { RoleHome } from './RoleHome';

/** Same staff screens under `/admin`, `/teacher`, `/counselor` and `/director`. */
export const staffHouseRoutes = (
  <>
    <Route element={<RoleHome />} index />
    <Route element={<RoleHome />} path="dashboard" />

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

    <Route element={<RequirePermission anyOf={ACADEMIC_SPECIALTIES_MANAGE} />}>
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

    <Route element={<RequirePermission anyOf={ACADEMIC_SUBJECTS_MANAGE} />}>
      <Route element={<SubjectsPage />} path="subjects" />
      <Route element={<TeachingAssignmentsPage />} path="teaching-assignments" />
    </Route>

    <Route element={<RequirePermission anyOf={ACADEMIC_PERIODS_MANAGE} />}>
      <Route element={<AcademicPeriodsPage />} path="academic-periods" />
    </Route>

    <Route element={<RequirePermission permission="academic_structure.configure" />}>
      <Route
        element={<AcademicStructureWizardPage />}
        path="academic-structure-wizard"
      />
    </Route>

    <Route element={<RequirePermission anyOf={ACADEMIC_SECTIONS_MANAGE} />}>
      <Route element={<SectionsGroupsPage />} path="sections-groups" />
    </Route>

    <Route element={<RequirePermission permission={SCHEDULE_PERMISSIONS.view} />}>
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
        <RequirePermission
          anyOf={[ATTENDANCE_PERMISSIONS.view, ATTENDANCE_PERMISSIONS.viewOwn]}
        />
      }
    >
      <Route element={<AttendanceHistoryPage />} path="attendance/history" />
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

    <Route element={<StaffOnly />}>
      <Route
        element={<RequirePermission permission={ATTENDANCE_PERMISSIONS.view} />}
      >
        <Route element={<AttendanceHomePage />} path="attendance" />
        <Route element={<AbsenteeismAlertsPage />} path="attendance/alerts" />
        <Route element={<AttendanceReportsPage />} path="attendance/reports" />
        <Route
          element={<AttendanceSessionPage />}
          path="attendance/sessions/:sessionId"
        />
      </Route>

      <Route
        element={<RequirePermission permission={ATTENDANCE_PERMISSIONS.edit} />}
      >
        <Route element={<AttendanceExceptionsPage />} path="attendance/exceptions" />
      </Route>

      <Route
        element={<RequirePermission permission={ATTENDANCE_PERMISSIONS.create} />}
      >
        <Route element={<AttendanceNewPage />} path="attendance/new" />
      </Route>
    </Route>

    <Route
      element={
        <RequirePermission
          anyOf={[DISCIPLINE_PERMISSIONS.view, DISCIPLINE_PERMISSIONS.viewOwn]}
        />
      }
    >
      <Route element={<DisciplineHistoryPage />} path="discipline/history" />
      <Route
        element={<DisciplineHistoryPage />}
        path="discipline/history/:studentId"
      />
    </Route>

    <Route element={<StaffOnly />}>
      <Route
        element={<RequirePermission permission={DISCIPLINE_PERMISSIONS.view} />}
      >
        <Route element={<DisciplineCatalogPage />} path="discipline/catalog" />
        <Route element={<DisciplineProcessPage />} path="discipline/process" />
      </Route>
      <Route
        element={<RequirePermission permission={DISCIPLINE_PERMISSIONS.configure} />}
      >
        <Route element={<DisciplineCalendarPage />} path="discipline/calendar" />
      </Route>
      <Route
        element={<RequirePermission permission={DISCIPLINE_PERMISSIONS.create} />}
      >
        <Route element={<DisciplineRegisterPage />} path="discipline/register" />
      </Route>
      <Route
        element={
          <RequirePermission
            anyOf={[DISCIPLINE_PERMISSIONS.view, DISCIPLINE_PERMISSIONS.viewOwn]}
          />
        }
      >
        <Route element={<DisciplineDashboardPage />} path="discipline" />
        <Route element={<DisciplineDashboardPage />} path="discipline/dashboard" />
      </Route>
      <Route
        element={
          <RequirePermission
            anyOf={[DISCIPLINE_PERMISSIONS.view, DISCIPLINE_PERMISSIONS.viewOwn]}
          />
        }
      >
        <Route element={<DisciplineCasesPage />} path="discipline/cases" />
        <Route element={<DisciplineCasePage />} path="discipline/cases/:caseId" />
      </Route>
      <Route
        element={<RequirePermission permission={DISCIPLINE_PERMISSIONS.respond} />}
      >
        <Route
          element={<DisciplineNotificationsPage />}
          path="discipline/notifications"
        />
      </Route>
    </Route>

    {roleModuleRoutes(true)}
    <Route element={<ProfileSettingsPage />} path="settings" />
    <Route element={<ProfileSettingsPage />} path="profile" />
    <Route element={<HouseHomeRedirect />} path="*" />
  </>
);
