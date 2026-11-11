import { CalendarOff, Gavel, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import {
  DISCIPLINE_CALENDAR_PATH,
  DISCIPLINE_CATALOG_PATH,
  DISCIPLINE_PERMISSIONS,
  DISCIPLINE_PROCESS_PATH,
} from '../model/disciplineRouting';
import styles from './DisciplineSettingsHub.module.css';

type SettingsCard = {
  key: string;
  title: string;
  hint: string;
  to: string;
  icon: typeof ShieldAlert;
  visible: boolean;
};

export function DisciplineSettingsHub() {
  const navigate = useNavigate();
  const canView = sessionHasPermission(DISCIPLINE_PERMISSIONS.view);
  const canConfigure = sessionHasPermission(DISCIPLINE_PERMISSIONS.configure);

  const cards: SettingsCard[] = [
    {
      key: 'catalog',
      title: 'Catálogo de faltas',
      hint: 'Tipos de falta, severidad y simulador de conducta.',
      to: DISCIPLINE_CATALOG_PATH,
      icon: ShieldAlert,
      visible: canView,
    },
    {
      key: 'calendar',
      title: 'Calendario y umbrales',
      hint: 'Días no hábiles y umbrales de reincidencia.',
      to: DISCIPLINE_CALENDAR_PATH,
      icon: CalendarOff,
      visible: canConfigure,
    },
    {
      key: 'process',
      title: 'Flujo del debido proceso',
      hint: 'Pasos, plazos y garantías según REAC 2026.',
      to: DISCIPLINE_PROCESS_PATH,
      icon: Gavel,
      visible: canView,
    },
  ];

  const visibleCards = cards.filter((card) => card.visible);

  return (
    <div className={styles.layout}>
      <article className={styles.intro}>
        <h2>Configuración de Disciplina</h2>
        <p>
          Ajuste las reglas del módulo. El trabajo diario (registrar, expedientes,
          apelaciones) está en el menú principal.
        </p>
      </article>

      {visibleCards.length === 0 ? (
        <p className={styles.empty}>No tiene permisos de configuración en este módulo.</p>
      ) : (
        <div className={styles.grid}>
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                className={styles.card}
                key={card.key}
                onClick={() => navigate(staffPathForSession(card.to))}
                type="button"
              >
                <span aria-hidden="true" className={styles.cardIcon}>
                  <Icon size={20} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.hint}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
