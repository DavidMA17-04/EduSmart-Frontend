import {
  AbsenteeismAlertsPage,
  AcademicPeriodsPage,
  AcademicStructureWizardPage,
  AdministrativeReportsPage,
  AttendanceExceptionsPage,
  AttendanceHistoryPage,
  AttendanceHomePage,
  AttendanceJustificationsPage,
  AttendanceNewPage,
  AttendanceReportsPage,
  AttendanceSessionPage,
  DisciplineCalendarPage,
  DisciplineCasePage,
  DisciplineCasesPage,
  DisciplineCatalogPage,
  DisciplineDashboardPage,
  DisciplineHistoryPage,
  DisciplineNotificationsPage,
  DisciplineProcessPage,
  DisciplineRegisterPage,
  ImportResultPage,
  MySchedulePage,
  ProfileSettingsPage,
  RolesPermissionsPage,
  SchedulePage,
  SectionsGroupsPage,
  SecurityCheckOutPage,
  SecurityDashboardPage,
  SecurityHistoryPage,
  SecurityPermitsPage,
  SpecialtiesPage,
  SpecialtyKindPage,
  SubjectsPage,
  TeachingAssignmentsPage,
  UserBulkImportPage,
  UserCreatePage,
  UserDetailPage,
  UserImportPreviewPage,
  UserMethodSelectionPage,
  UsersDirectoryPage,
} from './pages';
import { roleModuleRoutes } from './RoleModuleRoutes';
import { Route } from 'react-router-dom';
import { ATTENDANCE_PERMISSIONS } from '@/features/manage-attendance/model/attendanceRouting';
import { DISCIPLINE_PERMISSIONS } from '@/features/manage-discipline/model/disciplineRouting';
import { StaffOnly } from '@/widgets/app-shell';
import { SCHEDULE_PERMISSIONS } from '@/features/manage-schedule/model/schedulePermissions';
import {
  ACADEMIC_PERIODS_MANAGE,
  ACADEMIC_SECTIONS_MANAGE,
  ACADEMIC_SPECIALTIES_MANAGE,
  ACADEMIC_SUBJECTS_MANAGE,
} from '@/widgets/app-shell/model/academicCatalogAccess';
import { DEPARTURE_PERMISSIONS } from '@/features/student-departures/model/permissions';
import { NotFoundPage } from '@/pages/errors';
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

    <Route
      element={
        <RequirePermission
          anyOf={[DEPARTURE_PERMISSIONS.validate, DEPARTURE_PERMISSIONS.viewHistory]}
        />
      }
    >
      <Route element={<SecurityDashboardPage />} path="security/dashboard" />
    </Route>
    <Route element={<RequirePermission permission={DEPARTURE_PERMISSIONS.validate} />}>
      <Route element={<SecurityCheckOutPage />} path="security/check-out" />
    </Route>
    <Route element={<RequirePermission permission={DEPARTURE_PERMISSIONS.viewHistory} />}>
      <Route element={<SecurityPermitsPage />} path="security/permits" />
      <Route element={<SecurityHistoryPage />} path="security/history" />
    </Route>

    {roleModuleRoutes(true)}
    <Route element={<ProfileSettingsPage />} path="settings" />
    <Route element={<ProfileSettingsPage />} path="profile" />
    <Route element={<NotFoundPage />} path="*" />
  </>
);
