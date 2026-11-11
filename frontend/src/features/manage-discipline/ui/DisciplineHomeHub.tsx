import {
  ClipboardPen,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Scale,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import {
  DISCIPLINE_APPEALS_PATH,
  DISCIPLINE_CASES_PATH,
  DISCIPLINE_DASHBOARD_PATH,
  DISCIPLINE_HISTORY_PATH,
  DISCIPLINE_PERMISSIONS,
  DISCIPLINE_REGISTER_PATH,
  DISCIPLINE_SETTINGS_PATH,
} from '../model/disciplineRouting';
import styles from './DisciplineHomeHub.module.css';

type HubCard = {
  key: string;
  title: string;
  hint: string;
  to: string;
  icon: typeof ShieldAlert;
  primary?: boolean;
  visible: boolean;
};

export function DisciplineHomeHub() {
  const navigate = useNavigate();
  const canCreate = sessionHasPermission(DISCIPLINE_PERMISSIONS.create);
  const canCases = sessionHasPermission(DISCIPLINE_PERMISSIONS.view) ||
    sessionHasPermission(DISCIPLINE_PERMISSIONS.viewOwn);
  const canSettings =
    sessionHasPermission(DISCIPLINE_PERMISSIONS.view) ||
    sessionHasPermission(DISCIPLINE_PERMISSIONS.configure);

  const cards: HubCard[] = [
    {
      key: 'register',
      title: 'Registrar una falta',
      hint: 'Amonestación directa o debido proceso, según el catálogo.',
      to: DISCIPLINE_REGISTER_PATH,
      icon: ClipboardPen,
      primary: true,
      visible: canCreate,
    },
    {
      key: 'cases',
      title: 'Ver expedientes',
      hint: 'Cada caso le dice qué toca ahora (investigar, comunicar, resolver…).',
      to: DISCIPLINE_CASES_PATH,
      icon: Inbox,
      visible: canCases,
    },
    {
      key: 'history',
      title: 'Historial de conducta',
      hint: 'Rebajos y trayectoria de un estudiante.',
      to: DISCIPLINE_HISTORY_PATH,
      icon: GraduationCap,
      visible: canCases,
    },
    {
      key: 'appeals',
      title: 'Apelaciones y recursos',
      hint: 'Presentar, revisar o reportar recursos de conducta.',
      to: DISCIPLINE_APPEALS_PATH,
      icon: Scale,
      visible: canCases,
    },
    {
      key: 'settings',
      title: 'Configurar reglas',
      hint: 'Catálogo, calendario, umbrales y flujo REAC.',
      to: DISCIPLINE_SETTINGS_PATH,
      icon: Settings,
      visible: canSettings,
    },
    {
      key: 'dashboard',
      title: 'Ver indicadores',
      hint: 'Totales, plazos y alertas de las secciones a su alcance.',
      to: DISCIPLINE_DASHBOARD_PATH,
      icon: LayoutDashboard,
      visible: canCases,
    },
  ];

  const visibleCards = cards.filter((card) => card.visible);

  return (
    <div className={styles.layout}>
      <article className={styles.intro}>
        <div aria-hidden="true" className={styles.introIcon}>
          <ShieldAlert size={28} />
        </div>
        <div className={styles.introBody}>
          <h2 className={styles.introTitle}>¿Qué necesita hacer hoy?</h2>
          <p className={styles.introText}>
            Empiece por registrar una falta o abra un expediente: ahí el sistema
            le indica el paso del debido proceso y la acción principal, sin buscar
            entre pestañas.
          </p>
        </div>
      </article>

      <div className={styles.grid}>
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              className={`${styles.card}${card.primary ? ` ${styles.cardPrimary}` : ''}`}
              key={card.key}
              onClick={() => navigate(staffPathForSession(card.to))}
              type="button"
            >
              <span aria-hidden="true" className={styles.cardIcon}>
                <Icon size={20} />
              </span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardHint}>{card.hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
