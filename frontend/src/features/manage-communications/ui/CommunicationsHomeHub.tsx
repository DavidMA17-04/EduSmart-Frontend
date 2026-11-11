import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileEdit,
  Inbox,
  Megaphone,
  PenSquare,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRIORITY_THEME } from '@/components/communications/communicationFormat';
import { sessionHasPermission } from '@/shared/auth';
import { Button } from '@/shared/ui';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import { communicationApi } from '@/services/communicationApi';
import {
  COMMUNICATIONS_FEED_PATH,
  COMMUNICATIONS_MANAGE_PATH,
  COMMUNICATIONS_PERMISSIONS,
} from '../model/communicationsRouting';
import type { CommunicationsDashboard } from '../model/types';
import styles from './CommunicationsHomeHub.module.css';

export function CommunicationsHomeHub() {
  const navigate = useNavigate();
  const canManage = sessionHasPermission(COMMUNICATIONS_PERMISSIONS.create);
  const [data, setData] = useState<CommunicationsDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(canManage);

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    communicationApi
      .getDashboard()
      .then((payload) => {
        if (alive) {
          setData(payload);
          setError(null);
        }
      })
      .catch(() => {
        if (alive) setError('No se pudo cargar la cola de acuses.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [canManage]);

  const path = (to: string) => staffPathForSession(to);
  const goManage = () => navigate(path(COMMUNICATIONS_MANAGE_PATH));
  const goCompose = () => navigate(path(`${COMMUNICATIONS_MANAGE_PATH}?compose=1`));
  const goFeed = () => navigate(path(COMMUNICATIONS_FEED_PATH));

  const pendingItems = useMemo(
    () => [...(data?.pendingAckItems ?? [])].sort((a, b) => b.pendingCount - a.pendingCount),
    [data],
  );

  const focus = pendingItems[0] ?? null;
  const drafts = data?.countsByStatus.DRAFT ?? 0;
  const published = data?.countsByStatus.PUBLISHED ?? 0;
  const pendingTotal = data?.pendingAckTotal ?? 0;
  const withAck = data?.publishedRequiringAck ?? 0;
  const avgAck = Math.round(data?.avgAckRate ?? 0);
  const today = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const kpis = [
    {
      key: 'pending',
      value: pendingTotal,
      label: 'Sin acusar',
      sub: 'Personas pendientes',
      tone: styles.kpiWarn,
      icon: Users,
      onClick: goManage,
    },
    {
      key: 'must',
      value: withAck,
      label: 'Con acuse',
      sub: 'Avisos con acuse',
      tone: styles.kpiDanger,
      icon: Megaphone,
      onClick: goManage,
    },
    {
      key: 'ack',
      value: loading ? '—' : `${avgAck}%`,
      label: 'Acuse medio',
      sub: 'Sobre avisos con acuse',
      tone: styles.kpiOk,
      icon: CheckCircle2,
      onClick: goManage,
    },
    {
      key: 'pub',
      value: published,
      label: 'Publicados',
      sub: `${drafts} borrador${drafts === 1 ? '' : 'es'}`,
      tone: styles.kpiMuted,
      icon: FileEdit,
      onClick: goManage,
    },
  ];

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Comunicación · CTP Hojancha</p>
          <h1>
            Avisos <span className={styles.nameHighlight}>y acuses</span>
          </h1>
          <p className={styles.subtitle}>
            {canManage
              ? loading
                ? 'Cargando cola…'
                : `${pendingTotal.toLocaleString('es-CR')} personas sin acusar · ${withAck} avisos con acuse activos`
              : 'Avisos publicados para su audiencia.'}
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.time} aria-hidden="true">
            {today}
          </span>
          <div className={styles.headerActions}>
            <button className={styles.ghostBtn} onClick={goFeed} type="button">
              <Inbox aria-hidden size={16} />
              Muro
            </button>
            {canManage ? (
              <button className={styles.solidBtn} onClick={goCompose} type="button">
                <PenSquare aria-hidden size={16} />
                Redactar
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {!canManage ? (
        <article className={styles.readerCard}>
          <p>Su rol solo consulta el muro. La gestión de acuses requiere otro permiso.</p>
          <Button onClick={goFeed} type="button">
            Abrir el muro
          </Button>
        </article>
      ) : (
        <>
          <div
            aria-busy={loading}
            aria-label="Indicadores de comunicados"
            aria-live="polite"
            className={styles.kpiGrid}
          >
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <button
                  className={`${styles.kpi} ${kpi.tone}`}
                  key={kpi.key}
                  onClick={kpi.onClick}
                  style={{ animationDelay: `${index * 50}ms` }}
                  type="button"
                >
                  <span aria-hidden="true" className={styles.kpiIcon}>
                    <Icon size={18} />
                  </span>
                  <span className={styles.kpiBody}>
                    {loading ? (
                      <span aria-hidden="true" className={styles.skeletonValue} />
                    ) : (
                      <span className={styles.kpiValue}>{kpi.value}</span>
                    )}
                    <span className={styles.kpiLabel}>{kpi.label}</span>
                    <span className={styles.kpiSub}>{kpi.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.workspace}>
            <article className={styles.stage} aria-busy={loading}>
              {loading ? (
                <div className={styles.stageSkeleton} aria-hidden="true">
                  <div className={styles.skelLine} />
                  <div className={styles.skelHuge} />
                  <div className={styles.skelBlock} />
                </div>
              ) : focus ? (
                <>
                  <div className={styles.stageTop}>
                    <span className={styles.stageTag}>Prioridad de seguimiento</span>
                    <span className={styles.priority}>
                      {PRIORITY_THEME[focus.priority]?.label ?? 'Informativo'}
                    </span>
                  </div>

                  <h2 className={styles.stageTitle}>{focus.title}</h2>

                  <div className={styles.stageBody}>
                    <div className={styles.heroPanel}>
                      <p className={styles.heroNumber}>{focus.pendingCount.toLocaleString('es-CR')}</p>
                      <strong>sin acusar de recibo</strong>
                      <span>
                        {focus.totalAcknowledged.toLocaleString('es-CR')} de{' '}
                        {focus.totalEstimatedAudience.toLocaleString('es-CR')} ya confirmaron
                      </span>
                    </div>

                    <div className={styles.progressPanel}>
                      <div className={styles.progressHead}>
                        <span>Avance de acuse</span>
                        <strong>{Math.round(focus.ackRate)}%</strong>
                      </div>
                      <div
                        aria-label={`${Math.round(focus.ackRate)} por ciento de acuse`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={Math.round(focus.ackRate)}
                        className={styles.splitTrack}
                        role="meter"
                      >
                        <span
                          className={styles.splitFill}
                          style={{ width: `${Math.min(100, Math.round(focus.ackRate))}%` }}
                        />
                      </div>
                      <div className={styles.splitMeta}>
                        <span>
                          <i className={styles.dotOk} /> Confirmados {Math.round(focus.ackRate)}%
                        </span>
                        <span>
                          <i className={styles.dotWarn} /> Pendientes{' '}
                          {Math.max(0, 100 - Math.round(focus.ackRate))}%
                        </span>
                      </div>
                      <dl className={styles.factGrid}>
                        <div>
                          <dt>Audiencia</dt>
                          <dd>{focus.totalEstimatedAudience.toLocaleString('es-CR')}</dd>
                        </div>
                        <div>
                          <dt>Confirmados</dt>
                          <dd>{focus.totalAcknowledged.toLocaleString('es-CR')}</dd>
                        </div>
                        <div>
                          <dt>Pendientes</dt>
                          <dd>{focus.pendingCount.toLocaleString('es-CR')}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className={styles.stageFooter}>
                    <button className={styles.primaryCta} onClick={goManage} type="button">
                      Abrir en el gestor
                      <ArrowRight aria-hidden size={16} />
                    </button>
                    <p className={styles.stageHint}>
                      Ahí puede ver quién falta y enviar el seguimiento.
                    </p>
                  </div>
                </>
              ) : (
                <div className={styles.clearState}>
                  <div className={styles.clearIcon} aria-hidden="true">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2>Cola de acuses al día</h2>
                  <p>No hay avisos con acuse con personas pendientes de confirmar.</p>
                  <div className={styles.clearActions}>
                    <button className={styles.primaryCta} onClick={goCompose} type="button">
                      <PenSquare aria-hidden size={16} />
                      Redactar aviso
                    </button>
                    <button className={styles.secondaryCta} onClick={goManage} type="button">
                      Abrir gestor
                    </button>
                  </div>
                </div>
              )}
            </article>

            <aside className={styles.rail}>
              <div className={styles.railBlock}>
                <div className={styles.railHead}>
                  <Inbox size={16} />
                  <h3>Cola pendiente</h3>
                </div>
                {loading ? (
                  <div className={styles.railSkeleton} aria-hidden="true" />
                ) : pendingItems.length === 0 ? (
                  <p className={styles.railEmpty}>Sin avisos en seguimiento.</p>
                ) : (
                  <ul className={styles.queue}>
                    {pendingItems.map((item, index) => (
                      <li key={item.id}>
                        <button className={styles.queueRow} onClick={goManage} type="button">
                          <span className={styles.queueRank} aria-hidden="true">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className={styles.queueCopy}>
                            <strong>{item.title}</strong>
                            <em>
                              {item.pendingCount.toLocaleString('es-CR')} pendientes ·{' '}
                              {Math.round(item.ackRate)}%
                            </em>
                            <span className={styles.miniTrack} aria-hidden="true">
                              <span
                                className={styles.miniFill}
                                style={{ width: `${Math.min(100, Math.round(item.ackRate))}%` }}
                              />
                            </span>
                          </span>
                          <ArrowRight aria-hidden size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {pendingItems.length === 1 ? (
                  <p className={styles.railNote}>Este es el único aviso con acuse con gente pendiente.</p>
                ) : null}
              </div>
            </aside>

            <div className={styles.destStrip}>
              <button className={styles.destCard} onClick={goManage} type="button">
                <span className={styles.destIcon}>
                  <FileEdit size={18} />
                </span>
                <span>
                  <strong>Gestor</strong>
                  <em>
                    {loading
                      ? '…'
                      : `${drafts} borrador${drafts === 1 ? '' : 'es'} · ${published} publicado${published === 1 ? '' : 's'}`}
                  </em>
                </span>
              </button>
              <button className={styles.destCard} onClick={goFeed} type="button">
                <span className={styles.destIcon}>
                  <Inbox size={18} />
                </span>
                <span>
                  <strong>Muro</strong>
                  <em>Avisos ya publicados</em>
                </span>
              </button>
              <button
                className={`${styles.destCard} ${styles.destPrimary}`}
                onClick={goCompose}
                type="button"
              >
                <span className={styles.destIcon}>
                  <PenSquare size={18} />
                </span>
                <span>
                  <strong>Redactar</strong>
                  <em>Nuevo comunicado</em>
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
