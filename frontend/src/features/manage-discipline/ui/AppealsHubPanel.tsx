import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useNavigate } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import { Button } from '@/shared/ui';
import { APPEAL_CENTER_COPY } from '../model/appealCenter';
import { APPEAL_REVIEW_COPY } from '../model/appealReview';
import { APPEAL_REPORTS_COPY } from '../model/appealReports';
import { DISCIPLINE_APPEALS_NEW_PATH, DISCIPLINE_APPEALS_REPORTS_PATH, DISCIPLINE_APPEALS_REVIEW_PATH, DISCIPLINE_PERMISSIONS } from '../model/disciplineRouting';
import { AppealsListPanel } from './AppealsListPanel';
import styles from './AppealsCenter.module.css';

export const AppealsHubPanel = () => {
  const navigate = useNavigate();
  const canReview =
    sessionHasPermission(DISCIPLINE_PERMISSIONS.resolve) || sessionHasPermission(DISCIPLINE_PERMISSIONS.appeal);
  const canReport = sessionHasPermission(DISCIPLINE_PERMISSIONS.view);
  return (
    <section className={styles.panel}>
      <div className={styles.intro}>
        <h2>Recursos de conducta</h2>
        <p>{APPEAL_CENTER_COPY.process}</p>
      </div>
      <div className={styles.actions}>
        <Button type="button" onClick={() => navigate(portalPathForSession(DISCIPLINE_APPEALS_NEW_PATH))}>
          {APPEAL_CENTER_COPY.newAppeal}
        </Button>
        {canReview ? (
          <Button type="button" onClick={() => navigate(portalPathForSession(DISCIPLINE_APPEALS_REVIEW_PATH))}>
            {APPEAL_REVIEW_COPY.title}
          </Button>
        ) : null}
        {canReport ? (
          <Button type="button" variant="secondary" onClick={() => navigate(portalPathForSession(DISCIPLINE_APPEALS_REPORTS_PATH))}>
            {APPEAL_REPORTS_COPY.title}
          </Button>
        ) : null}
      </div>
      <AppealsListPanel />
    </section>
  );
};
