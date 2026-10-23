import { CheckCircle2, Search, Trash2, XCircle } from 'lucide-react';
import { Alert, Button, Checkbox } from '@/shared/ui';
import type { GroupEnrollmentPanelModel } from '../model/useGroupEnrollmentPanel';
import styles from './BatchEnrollModal.module.css';

type Props = {
  model: GroupEnrollmentPanelModel;
};

export function BatchEnrollModal({ model }: Props) {
  if (!model.showModal) return null;

  const { eligibilitySummary: summary } = model;
  const canEnrollAll =
    model.verified && summary.allAptos && summary.total > 0 && !model.isSubmitting;

  return (
    <div
      aria-modal="true"
      className={styles.backdrop}
      role="dialog"
    >
      <section className={styles.modal}>
        <header className={styles.header}>
          <div>
            <h2>Matricular estudiantes</h2>
            <p>
              {model.groupLabel
                ? `Sección ${model.groupLabel}`
                : `Grupo #${model.groupId}`}
            </p>
          </div>
          <Button
            aria-label="Cerrar"
            onClick={model.closeModal}
            type="button"
            variant="secondary"
          >
            Cerrar
          </Button>
        </header>

        <div className={styles.body}>
          {model.modalError && <Alert>{model.modalError}</Alert>}

          <label className={styles.field}>
            Fecha de inicio de matrícula
            <input
              className={styles.dateInput}
              onChange={(e) => model.setStartsOn(e.target.value)}
              type="date"
              value={model.startsOn}
            />
          </label>

          <label className={styles.field}>
            Buscar estudiante
            <div className={styles.searchWrap}>
              <Search aria-hidden className={styles.searchIcon} size={16} />
              <input
                className={styles.searchInput}
                onChange={(e) => model.setSearch(e.target.value)}
                placeholder="Nombre, apellido, correo o cédula…"
                type="search"
                value={model.search}
              />
            </div>
          </label>

          <div className={styles.hits}>
            <div className={styles.hitsHead}>
              <strong>Resultados</strong>
              <span className={styles.muted}>
                {model.isSearching
                  ? 'Buscando…'
                  : `${model.visibleHits.length} coincidencia(s)`}
              </span>
            </div>
            {model.visibleHits.length === 0 ? (
              <p className={styles.muted}>
                {model.search.trim()
                  ? 'Sin coincidencias. Pruebe otro criterio.'
                  : 'Escriba para buscar, o revise el catálogo activo de estudiantes.'}
              </p>
            ) : (
              <ul className={styles.hitList}>
                {model.visibleHits.map((user) => {
                  const checked = model.stagedIds.has(user.id);
                  return (
                    <li key={user.id}>
                      <label className={styles.hitRow}>
                        <Checkbox
                          checked={checked}
                          onChange={() => model.toggleSearchHit(user)}
                        />
                        <span className={styles.hitMain}>
                          <strong>{model.displayStudentName(user)}</strong>
                          <span className={styles.muted}>
                            {[user.nationalId, user.email]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className={styles.staged}>
            <div className={styles.hitsHead}>
              <strong>Seleccionados para matrícula ({model.staged.length})</strong>
            </div>

            {model.verified && model.staged.length > 0 && (
              <div className={styles.meterBlock}>
                <div className={styles.meterLabels}>
                  <span className={styles.apto}>
                    Aptos {summary.aptos} ({summary.percentAptos}%)
                  </span>
                  <span className={styles.noApto}>
                    No aptos {summary.noAptos} ({100 - summary.percentAptos}%)
                  </span>
                </div>
                <div
                  aria-label={`Aptos ${summary.percentAptos} por ciento`}
                  className={styles.meter}
                  role="meter"
                >
                  <div
                    className={styles.meterFill}
                    style={{ width: `${summary.percentAptos}%` }}
                  />
                </div>
              </div>
            )}

            {model.staged.length === 0 ? (
              <p className={styles.muted}>
                Marque uno o más estudiantes en los resultados (p. ej. todos los
                “Alex” que necesite).
              </p>
            ) : (
              <ul className={styles.stagedList}>
                {model.staged.map((row) => {
                  const tone = row.eligibility?.tone;
                  return (
                    <li
                      className={`${styles.stagedRow} ${
                        tone === 'apto'
                          ? styles.rowApto
                          : tone === 'no_apto'
                            ? styles.rowNoApto
                            : ''
                      }`}
                      key={row.user.id}
                    >
                      <div className={styles.stagedMain}>
                        <strong>{model.displayStudentName(row.user)}</strong>
                        <span className={styles.muted}>
                          {[row.user.nationalId, row.user.email]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                        {row.eligibility && (
                          <span
                            className={
                              row.eligibility.tone === 'apto'
                                ? styles.badgeApto
                                : styles.badgeNoApto
                            }
                          >
                            {row.eligibility.tone === 'apto' ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            {row.eligibility.label}: {row.eligibility.detail}
                          </span>
                        )}
                      </div>
                      <Button
                        aria-label={`Quitar ${model.displayStudentName(row.user)}`}
                        onClick={() => model.removeStaged(row.user.id)}
                        size="icon"
                        title="Quitar de la lista"
                        type="button"
                        variant="secondary"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <Button
            disabled={model.staged.length === 0 || model.isSubmitting}
            onClick={model.runVerification}
            type="button"
            variant="secondary"
          >
            Verificación
          </Button>
          <div className={styles.footerRight}>
            <Button
              disabled={model.isSubmitting}
              onClick={model.closeModal}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            {canEnrollAll && (
              <Button
                disabled={model.isSubmitting}
                onClick={() => {
                  void model.submitBatch();
                }}
                type="button"
              >
                {model.isSubmitting
                  ? 'Matriculando…'
                  : `Matricular ${summary.total} estudiante(s)`}
              </Button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
