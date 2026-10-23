import {
  FileSpreadsheet,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Power,
  ShieldAlert,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Input,
  ModalCrud,
  Select,
  Textarea,
  useToast,
} from '@/shared/ui';
import { SEVERITY_LABELS, SEVERITY_ORDER, SEVERITY_TONES, TRACK_LABELS } from '../model/severity';
import type { InfractionSeverity } from '../model/types';
import { useInfractionCatalog } from '../model/useInfractionCatalog';
import { ConductSimulator } from './ConductSimulator';
import styles from './InfractionCatalogPanel.module.css';

const SEVERITY_TILE_CLASS: Record<InfractionSeverity, string> = {
  VERY_MINOR: styles.tileVeryMinor,
  MINOR: styles.tileMinor,
  SERIOUS: styles.tileSerious,
  VERY_SERIOUS: styles.tileVerySerious,
  EXTREMELY_SERIOUS: styles.tileExtremelySerious,
};

export const InfractionCatalogPanel = () => {
  const toast = useToast();
  const model = useInfractionCatalog();

  const onSubmit = async () => {
    const result = await model.submit();
    toast.push(result.message, result.ok ? 'success' : 'error');
  };

  const onExport = async (format: 'pdf' | 'excel') => {
    const result = await model.exportCatalog(format);
    toast.push(result.message, result.ok ? 'success' : 'error');
  };

  const onToggle = async (id: number) => {
    const row = model.rows.find((r) => r.id === id);
    if (!row) return;
    if (
      row.isActive &&
      !window.confirm(
        `¿Desactivar «${row.name}»? No aparecerá en registros nuevos; los expedientes existentes lo conservan.`,
      )
    ) {
      return;
    }
    const result = await model.toggleActive(row);
    toast.push(result.message, result.ok ? 'success' : 'error');
  };

  return (
    <div className={styles.panel}>
      <section aria-labelledby="severity-scale-title" className={styles.scale}>
        <header className={styles.scaleHeader}>
          <h2 id="severity-scale-title">Escala de gravedad · REAC 2026</h2>
          <p>
            Rebajo fijo de la nota de conducta (Art. 143). Se aplica solo cuando el acto queda
            firme.
          </p>
        </header>
        <div className={styles.tiles}>
          {model.rules.map((rule) => (
            <article
              className={`${styles.tile} ${SEVERITY_TILE_CLASS[rule.severity]}`}
              key={rule.severity}
            >
              <span className={styles.tileLabel}>{rule.label}</span>
              <strong className={styles.tileDeduction}>−{rule.deduction}</strong>
              <span className={styles.tileUnit}>puntos</span>
              <span className={styles.tileTrack}>{TRACK_LABELS[rule.track]}</span>
              <span className={styles.tileCount}>
                {model.countsBySeverity[rule.severity] ?? 0} tipo(s) activos
              </span>
            </article>
          ))}
        </div>
      </section>

      <ConductSimulator rules={model.rules} />

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <label className={styles.field} htmlFor="infraction-search">
            <span className={styles.fieldLabel}>Buscar</span>
            <Input
              id="infraction-search"
              onChange={(event) => model.setSearch(event.target.value)}
              placeholder="Nombre, descripción o artículo"
              value={model.search}
            />
          </label>
          <label className={styles.field} htmlFor="infraction-severity">
            <span className={styles.fieldLabel}>Gravedad</span>
            <Select
              id="infraction-severity"
              onChange={(event) =>
                model.setSeverityFilter(event.target.value as InfractionSeverity | '')
              }
              value={model.severityFilter}
            >
              <option value="">Todas</option>
              {SEVERITY_ORDER.map((severity) => (
                <option key={severity} value={severity}>
                  {SEVERITY_LABELS[severity]}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles.field} htmlFor="infraction-active">
            <span className={styles.fieldLabel}>Estado</span>
            <Select
              id="infraction-active"
              onChange={(event) =>
                model.setActiveFilter(event.target.value as 'active' | 'inactive' | 'all')
              }
              value={model.activeFilter}
            >
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="all">Todos</option>
            </Select>
          </label>
        </div>
        <div className={styles.toolbarActions}>
          {model.canExport ? (
            <>
              <Button
                disabled={model.exporting !== null}
                onClick={() => void onExport('pdf')}
                type="button"
                variant="secondary"
              >
                <FileText aria-hidden="true" size={16} />
                {model.exporting === 'pdf' ? 'Generando…' : 'PDF'}
              </Button>
              <Button
                disabled={model.exporting !== null}
                onClick={() => void onExport('excel')}
                type="button"
                variant="secondary"
              >
                <FileSpreadsheet aria-hidden="true" size={16} />
                {model.exporting === 'excel' ? 'Generando…' : 'Excel'}
              </Button>
            </>
          ) : null}
          {model.canConfigure ? (
            <Button disabled={model.saving} onClick={model.openCreate} type="button">
              <Plus aria-hidden="true" size={16} />
              Nuevo tipo de falta
            </Button>
          ) : null}
        </div>
      </div>

      {model.error ? <Alert>{model.error}</Alert> : null}

      {model.loading ? (
        <div aria-busy="true" className={styles.loadingRow}>
          <Loader2 aria-hidden="true" className={styles.spinner} size={18} />
          <span>Cargando catálogo…</span>
        </div>
      ) : model.rows.length === 0 ? (
        <EmptyState
          description="Registra las conductas tipificadas en el REAC (Arts. 153–157) para usarlas al registrar amonestaciones."
          icon={ShieldAlert}
          title="Sin tipos de falta"
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tipo de falta</th>
                <th>Gravedad</th>
                <th>Rebajo</th>
                <th>Vía</th>
                <th>Referencia</th>
                <th>Estado</th>
                {model.canConfigure ? <th aria-label="Acciones" /> : null}
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr className={row.isActive ? undefined : styles.inactiveRow} key={row.id}>
                  <td>
                    <div className={styles.titleCell}>
                      <strong>{row.name}</strong>
                      {row.description ? (
                        <span className={styles.muted}>{row.description}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <Badge tone={SEVERITY_TONES[row.severity]}>{row.severityLabel}</Badge>
                  </td>
                  <td className={styles.deduction}>−{row.deduction}</td>
                  <td>{TRACK_LABELS[row.track]}</td>
                  <td>{row.legalReference ?? '—'}</td>
                  <td>
                    <Badge tone={row.isActive ? 'success' : 'neutral'}>
                      {row.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  {model.canConfigure ? (
                    <td className={styles.actions}>
                      <Button
                        aria-label={`Editar ${row.name}`}
                        disabled={model.saving}
                        onClick={() => model.openEdit(row)}
                        type="button"
                        variant="secondary"
                      >
                        <Pencil aria-hidden="true" size={14} />
                      </Button>
                      <Button
                        aria-label={`${row.isActive ? 'Desactivar' : 'Reactivar'} ${row.name}`}
                        disabled={model.saving}
                        onClick={() => void onToggle(row.id)}
                        type="button"
                        variant="secondary"
                      >
                        <Power aria-hidden="true" size={14} />
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalCrud
        isOpen={model.modalOpen}
        onClose={model.closeModal}
        title={model.editing ? 'Editar tipo de falta' : 'Nuevo tipo de falta'}
      >
        <div className={styles.form}>
          <label className={styles.field} htmlFor="infraction-name">
            <span className={styles.fieldLabel}>Nombre</span>
            <Input
              id="infraction-name"
              maxLength={150}
              onChange={(event) => model.setForm({ ...model.form, name: event.target.value })}
              value={model.form.name}
            />
          </label>
          <label className={styles.field} htmlFor="infraction-form-severity">
            <span className={styles.fieldLabel}>Gravedad</span>
            <Select
              id="infraction-form-severity"
              onChange={(event) =>
                model.setForm({
                  ...model.form,
                  severity: event.target.value as InfractionSeverity,
                })
              }
              value={model.form.severity}
            >
              {model.rules.map((rule) => (
                <option key={rule.severity} value={rule.severity}>
                  {rule.label} · −{rule.deduction} puntos
                </option>
              ))}
            </Select>
          </label>
          <label className={styles.field} htmlFor="infraction-reference">
            <span className={styles.fieldLabel}>Referencia normativa (opcional)</span>
            <Input
              id="infraction-reference"
              maxLength={100}
              onChange={(event) =>
                model.setForm({ ...model.form, legalReference: event.target.value })
              }
              placeholder="Ej. REAC Art. 154, inciso c"
              value={model.form.legalReference}
            />
          </label>
          <label className={styles.field} htmlFor="infraction-description">
            <span className={styles.fieldLabel}>Descripción (opcional)</span>
            <Textarea
              id="infraction-description"
              maxLength={2000}
              onChange={(event) =>
                model.setForm({ ...model.form, description: event.target.value })
              }
              rows={3}
              value={model.form.description}
            />
          </label>
          <div className={styles.formActions}>
            <Button
              disabled={model.saving}
              onClick={model.closeModal}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button disabled={model.saving} onClick={() => void onSubmit()} type="button">
              {model.saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </ModalCrud>
    </div>
  );
};
