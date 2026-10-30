import { Route } from 'react-router-dom';
import {
  DisciplineAppealNewPage,
  DisciplineAppealReviewPage,
  DisciplineAppealTrackingPage,
  DisciplineAppealsPage,
  DisciplineAppealsReportsPage,
  DisciplineAppealsReviewPage,
  DisciplineCasePage,
} from '@/pages/discipline';
import { CommunicationsFeedPage } from '@/pages/communications/CommunicationsFeedPage';
import { CommunicationsAdminPage } from '@/pages/communications/CommunicationsAdminPage';
import { HouseHomeRedirect } from './HouseHomeRedirect';
import { RequirePermission } from './RequirePermission';

/** Route elements, composed inside each house; the API also enforces actor scope. */
export const roleModuleRoutes = (staff = false) => (
  <>
    <Route element={<RequirePermission permission="communications.view" />}>
      <Route element={<CommunicationsFeedPage />} path="communications" />
    </Route>
    <Route element={<RequirePermission anyOf={['disciplinary.view', 'disciplinary.view_own']} />}>
      <Route element={<DisciplineAppealsPage />} path="discipline/appeals" />
      <Route element={<DisciplineAppealNewPage />} path="discipline/appeals/new" />
      <Route element={<DisciplineAppealTrackingPage />} path="discipline/appeals/:appealId" />
      {!staff && <Route element={<DisciplineCasePage />} path="discipline/cases/:caseId" />}
    </Route>
    {!staff && (
      <>
        {/* Static staff-only paths must not fall through to :appealId. */}
        <Route element={<HouseHomeRedirect />} path="communications/manage" />
        <Route element={<HouseHomeRedirect />} path="discipline/appeals/review/*" />
        <Route element={<HouseHomeRedirect />} path="discipline/appeals/reports" />
      </>
    )}
    {staff && (
      <>
        <Route element={<RequirePermission permission="communications.create" />}>
          <Route element={<CommunicationsAdminPage />} path="communications/manage" />
        </Route>
        <Route element={<RequirePermission anyOf={['disciplinary.resolve', 'disciplinary.appeal']} />}>
          <Route element={<DisciplineAppealsReviewPage />} path="discipline/appeals/review" />
          <Route element={<DisciplineAppealReviewPage />} path="discipline/appeals/review/:appealId" />
        </Route>
        <Route element={<RequirePermission permission="disciplinary.view" />}>
          <Route element={<DisciplineAppealsReportsPage />} path="discipline/appeals/reports" />
        </Route>
      </>
    )}
  </>
);
