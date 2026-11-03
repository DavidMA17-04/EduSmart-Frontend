/**
 * Páginas de la aplicación, cada una en su propio archivo descargado bajo demanda.
 * Importar páginas siempre desde aquí en los enrutadores: un import directo las
 * vuelve a meter en el paquete inicial.
 */
import { lazyPage } from './lazyPage';

export const ForgotPasswordPage = lazyPage(() => import('@/pages/forgot-password/ui/ForgotPasswordPage'), 'ForgotPasswordPage');
export const LoginPage = lazyPage(() => import('@/pages/login/ui/LoginPage'), 'LoginPage');
export const VerifyAccountPage = lazyPage(() => import('@/pages/verify-account/ui/VerifyAccountPage'), 'VerifyAccountPage');
export const ResetPasswordPage = lazyPage(() => import('@/pages/reset-password/ui/ResetPasswordPage'), 'ResetPasswordPage');
export const AdminHomePage = lazyPage(() => import('@/pages/admin-home/ui/AdminHomePage'), 'AdminHomePage');
export const StaffRoleHomePage = lazyPage(() => import('@/pages/role-home/ui/StaffRoleHomePage'), 'StaffRoleHomePage');
export const StudentHomePage = lazyPage(() => import('@/pages/student-home/ui/StudentHomePage'), 'StudentHomePage');
export const GuardianHomePage = lazyPage(() => import('@/pages/guardian-home/ui/GuardianHomePage'), 'GuardianHomePage');
export const ProfileSettingsPage = lazyPage(() => import('@/pages/profile-settings/ui/ProfileSettingsPage'), 'ProfileSettingsPage');
export const MySchedulePage = lazyPage(() => import('@/pages/my-schedule/ui/MySchedulePage'), 'MySchedulePage');
export const SchedulePage = lazyPage(() => import('@/pages/schedule/ui/SchedulePage'), 'SchedulePage');
export const UserMethodSelectionPage = lazyPage(() => import('@/pages/Admin/Users/UserMethodSelectionPage/UserMethodSelectionPage'), 'UserMethodSelectionPage');
export const UserBulkImportPage = lazyPage(() => import('@/pages/Admin/Users/UserBulkImportPage/UserBulkImportPage'), 'UserBulkImportPage');
export const UserImportPreviewPage = lazyPage(() => import('@/pages/Admin/Users/UserImportPreviewPage/UserImportPreviewPage'), 'UserImportPreviewPage');
export const UserCreatePage = lazyPage(() => import('@/pages/user-create/ui/UserCreatePage'), 'UserCreatePage');
export const UserDetailPage = lazyPage(() => import('@/pages/user-detail/ui/UserDetailPage'), 'UserDetailPage');
export const UsersDirectoryPage = lazyPage(() => import('@/pages/users-directory/ui/UsersDirectoryPage'), 'UsersDirectoryPage');
export const ImportResultPage = lazyPage(() => import('@/pages/import-result/ui/ImportResultPage'), 'ImportResultPage');
export const AdministrativeReportsPage = lazyPage(() => import('@/pages/administrative-reports/ui/AdministrativeReportsPage'), 'AdministrativeReportsPage');
export const RolesPermissionsPage = lazyPage(() => import('@/pages/roles-permissions/ui/RolesPermissionsPage'), 'RolesPermissionsPage');
export const SpecialtiesPage = lazyPage(() => import('@/pages/specialties/ui/SpecialtiesPage'), 'SpecialtiesPage');
export const SpecialtyKindPage = lazyPage(() => import('@/pages/specialty-kind/ui/SpecialtyKindPage'), 'SpecialtyKindPage');
export const AcademicPeriodsPage = lazyPage(() => import('@/pages/academic-periods/ui/AcademicPeriodsPage'), 'AcademicPeriodsPage');
export const AcademicStructureWizardPage = lazyPage(() => import('@/pages/academic-structure-wizard/ui/AcademicStructureWizardPage'), 'AcademicStructureWizardPage');
export const SectionsGroupsPage = lazyPage(() => import('@/pages/sections-groups/ui/SectionsGroupsPage'), 'SectionsGroupsPage');
export const SubjectsPage = lazyPage(() => import('@/pages/subjects/ui/SubjectsPage'), 'SubjectsPage');
export const TeachingAssignmentsPage = lazyPage(() => import('@/pages/teaching-assignments/ui/TeachingAssignmentsPage'), 'TeachingAssignmentsPage');
export const AttendanceHomePage = lazyPage(() => import('@/pages/attendance/ui/AttendanceHomePage'), 'AttendanceHomePage');
export const AttendanceNewPage = lazyPage(() => import('@/pages/attendance/ui/AttendanceNewPage'), 'AttendanceNewPage');
export const AttendanceSessionPage = lazyPage(() => import('@/pages/attendance/ui/AttendanceSessionPage'), 'AttendanceSessionPage');
export const AttendanceHistoryPage = lazyPage(() => import('@/pages/attendance/ui/AttendanceHistoryPage'), 'AttendanceHistoryPage');
export const AttendanceJustificationsPage = lazyPage(() => import('@/pages/attendance/ui/AttendanceJustificationsPage'), 'AttendanceJustificationsPage');
export const AttendanceRedeemPage = lazyPage(() => import('@/pages/attendance/ui/AttendanceRedeemPage'), 'AttendanceRedeemPage');
export const AttendanceExceptionsPage = lazyPage(() => import('@/pages/attendance/ui/AttendanceExceptionsPage'), 'AttendanceExceptionsPage');
export const AttendanceReportsPage = lazyPage(() => import('@/pages/attendance/ui/AttendanceReportsPage'), 'AttendanceReportsPage');
export const AbsenteeismAlertsPage = lazyPage(() => import('@/pages/attendance/ui/AbsenteeismAlertsPage'), 'AbsenteeismAlertsPage');
export const DisciplineDashboardPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineDashboardPage'), 'DisciplineDashboardPage');
export const DisciplineHistoryPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineHistoryPage'), 'DisciplineHistoryPage');
export const DisciplineNotificationsPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineNotificationsPage'), 'DisciplineNotificationsPage');
export const DisciplineCasesPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineCasesPage'), 'DisciplineCasesPage');
export const DisciplineCasePage = lazyPage(() => import('@/pages/discipline/ui/DisciplineCasePage'), 'DisciplineCasePage');
export const DisciplineCatalogPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineCatalogPage'), 'DisciplineCatalogPage');
export const DisciplineCalendarPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineCalendarPage'), 'DisciplineCalendarPage');
export const DisciplineProcessPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineProcessPage'), 'DisciplineProcessPage');
export const DisciplineRegisterPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineRegisterPage'), 'DisciplineRegisterPage');
export const DisciplineAppealsPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineAppealsPage'), 'DisciplineAppealsPage');
export const DisciplineAppealNewPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineAppealNewPage'), 'DisciplineAppealNewPage');
export const DisciplineAppealTrackingPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineAppealTrackingPage'), 'DisciplineAppealTrackingPage');
export const DisciplineAppealsReviewPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineAppealsReviewPage'), 'DisciplineAppealsReviewPage');
export const DisciplineAppealReviewPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineAppealReviewPage'), 'DisciplineAppealReviewPage');
export const DisciplineAppealsReportsPage = lazyPage(() => import('@/pages/discipline/ui/DisciplineAppealsReportsPage'), 'DisciplineAppealsReportsPage');
export const CommunicationsFeedPage = lazyPage(() => import('@/pages/communications/CommunicationsFeedPage'), 'CommunicationsFeedPage');
export const CommunicationsAdminPage = lazyPage(() => import('@/pages/communications/CommunicationsAdminPage'), 'CommunicationsAdminPage');
export const SecurityDashboardPage = lazyPage(() => import('@/pages/security/SecurityDashboardPage'), 'SecurityDashboardPage');
export const SecurityCheckOutPage = lazyPage(() => import('@/pages/security/SecurityCheckOutPage'), 'SecurityCheckOutPage');
export const SecurityPermitsPage = lazyPage(() => import('@/pages/security/SecurityPermitsPage'), 'SecurityPermitsPage');
export const SecurityHistoryPage = lazyPage(() => import('@/pages/security/SecurityHistoryPage'), 'SecurityHistoryPage');
