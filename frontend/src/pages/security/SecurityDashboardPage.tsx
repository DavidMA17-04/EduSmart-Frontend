import { useState } from 'react';
import { FileCheck, History, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import {
  DEPARTURE_PERMISSIONS,
  ScheduledPermitsList,
  SecurityKpiRow,
  SecurityLiveFeed,
  SecurityTerminalCard,
  TodayDeparturesTable,
  type TerminalPrefill,
} from '@/features/student-departures';
import '@/features/student-departures/ui/security.css';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import { todayLabel } from './SecurityPageHeader';
import styles from './SecurityDashboardPage.module.css';

/** /security/dashboard — control de salidas alineado al resto del admin. */
export function SecurityDashboardPage() {
  const navigate = useNavigate();
  const [prefill, setPrefill] = useState<TerminalPrefill | null>(null);
  const canValidate = sessionHasPermission(DEPARTURE_PERMISSIONS.validate);
  const canView = sessionHasPermission(DEPARTURE_PERMISSIONS.viewHistory);

  if (!canValidate && !canView) {
    return (
      <div className={`edu-security ${styles.page}`}>
        <p className={styles.denied}>
          Su cuenta no tiene permisos del módulo de salidas. Contacte a la administración.
        </p>
      </div>
    );
  }

  const actions = [
    {
      title: 'Terminal de salida',
      hint: 'Validar cédula y registrar salida.',
      to: '/admin/security/check-out',
      icon: ScanLine,
      primary: true,
      visible: canValidate,
    },
    {
      title: 'Permisos del día',
      hint: 'Autorizaciones programadas.',
      to: '/admin/security/permits',
      icon: FileCheck,
      primary: false,
      visible: canView,
    },
    {
      title: 'Bitácora',
      hint: 'Histórico auditado.',
      to: '/admin/security/history',
      icon: History,
      primary: false,
      visible: canView,
    },
  ];

  return (
    <div className={`edu-security ${styles.page}`}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Control de salidas · CTP Hojancha</p>
            <h1>
              Consola de <span className={styles.nameHighlight}>despacho</span>
            </h1>
            <p className={styles.subtitle}>
              {todayLabel()}. Valide identidades, autorice permisos y registre salidas del turno.
            </p>
          </div>
          <div className={styles.dateBlock} aria-hidden="true">
            <span className={styles.time}>{todayLabel()}</span>
          </div>
        </header>

        <div className={styles.controls}>
          {actions
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={`${styles.control}${item.primary ? ` ${styles.controlPrimary}` : ''}`}
                  key={item.to}
                  onClick={() => navigate(staffPathForSession(item.to))}
                  type="button"
                >
                  <span aria-hidden="true" className={styles.controlIcon}>
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <em>{item.hint}</em>
                  </span>
                </button>
              );
            })}
        </div>

        {canView ? <SecurityKpiRow /> : null}

        <div className={styles.workspace}>
          <div className={styles.mainLane}>
            {canValidate ? (
              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <ScanLine size={16} />
                  <h2>Terminal de caseta</h2>
                </div>
                <SecurityTerminalCard prefill={prefill} />
              </section>
            ) : null}

            {canView ? (
              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <History size={16} />
                  <h2>Salidas del día</h2>
                </div>
                <TodayDeparturesTable />
              </section>
            ) : null}
          </div>

          {canView ? (
            <aside className={styles.sideLane}>
              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <FileCheck size={16} />
                  <h2>Permisos programados</h2>
                </div>
                <ScheduledPermitsList
                  selectedId={prefill?.scheduledPermitId ?? null}
                  onSelect={
                    canValidate
                      ? (permit) =>
                          setPrefill({
                            studentIdentifier: permit.student.nationalId,
                            scheduledPermitId: permit.id,
                            nonce: Date.now(),
                          })
                      : undefined
                  }
                />
              </section>

              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <History size={16} />
                  <h2>Actividad reciente</h2>
                </div>
                <SecurityLiveFeed />
              </section>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
