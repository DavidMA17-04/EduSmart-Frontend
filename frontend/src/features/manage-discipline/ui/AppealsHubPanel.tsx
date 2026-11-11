import { ClipboardList, FileBarChart, Plus, Scale } from 'lucide-react';
import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useNavigate } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import { APPEAL_CENTER_COPY } from '../model/appealCenter';
import { APPEAL_REVIEW_COPY } from '../model/appealReview';
import { APPEAL_REPORTS_COPY } from '../model/appealReports';
import {
  DISCIPLINE_APPEALS_NEW_PATH,
  DISCIPLINE_APPEALS_REPORTS_PATH,
  DISCIPLINE_APPEALS_REVIEW_PATH,
  DISCIPLINE_PERMISSIONS,
} from '../model/disciplineRouting';
import { AppealsListPanel } from './AppealsListPanel';
import styles from './AppealsCenter.module.css';

type AppealDestination = {
  key: string;
  title: string;
  hint: string;
  to: string;
  icon: typeof Scale;
  primary?: boolean;
  visible: boolean;
};

export const AppealsHubPanel = () => {
  const navigate = useNavigate();
  const canReview =
    sessionHasPermission(DISCIPLINE_PERMISSIONS.resolve) ||
    sessionHasPermission(DISCIPLINE_PERMISSIONS.appeal);
  const canReport = sessionHasPermission(DISCIPLINE_PERMISSIONS.view);

  const destinations: AppealDestination[] = [
    {
      key: 'new',
      title: APPEAL_CENTER_COPY.newAppeal,
      hint: 'Inicie un recurso o revocatoria paso a paso.',
      to: DISCIPLINE_APPEALS_NEW_PATH,
      icon: Plus,
      primary: true,
      visible: true,
    },
    {
      key: 'review',
      title: APPEAL_REVIEW_COPY.title,
      hint: 'Bandeja de recursos pendientes de resolución.',
      to: DISCIPLINE_APPEALS_REVIEW_PATH,
      icon: ClipboardList,
      visible: canReview,
    },
    {
      key: 'reports',
      title: APPEAL_REPORTS_COPY.title,
      hint: 'Indicadores y exportación de recursos.',
      to: DISCIPLINE_APPEALS_REPORTS_PATH,
      icon: FileBarChart,
      visible: canReport,
    },
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.intro}>
        <div className={styles.introHeading}>
          <span aria-hidden="true" className={styles.introIcon}>
            <Scale size={22} />
          </span>
          <div>
            <h2>Apelaciones y recursos</h2>
            <p>{APPEAL_CENTER_COPY.process}</p>
          </div>
        </div>
      </div>

      <div className={styles.destinationGrid}>
        {destinations
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`${styles.destinationCard}${item.primary ? ` ${styles.destinationPrimary}` : ''}`}
                key={item.key}
                onClick={() => navigate(portalPathForSession(item.to))}
                type="button"
              >
                <span aria-hidden="true" className={styles.destinationIcon}>
                  <Icon size={18} />
                </span>
                <strong>{item.title}</strong>
                <span>{item.hint}</span>
              </button>
            );
          })}
      </div>

      <AppealsListPanel />
    </section>
  );
};
