import { Alert, Button, ConfirmDialog, Input, Select } from '@/shared/ui';
import { useAcademicStructureWizard } from '../model/useAcademicStructureWizard';
import styles from './AcademicStructureWizard.module.css';

export function AcademicStructureWizard() {
  const model = useAcademicStructureWizard();

  return (
    <section className={styles.layout}>
      <nav aria-label="Pasos del asistente" className={styles.stepper}>
        {model.steps.map((step, index) => {
          const isActive = model.currentStep === step.id;
          const isDone = model.currentIndex > index;
          const locked = !model.canEnterStep(step.id);
          return (
            <div key={step.id} style={{ display: 'contents' }}>
              {index > 0 ? <span className={styles.stepSep}>—</span> : null}
              <button
                className={`${styles.stepItem} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}
                disabled={locked && !isActive}
                onClick={() => model.goToStep(step.id)}
                type="button"
              >
                <span className={styles.stepNumber}>{step.number}</span>
                <span>{step.label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      {model.error ? <Alert>{model.error}</Alert> : null}
      {model.pendingRequirement ? (
        <p className={styles.requirement} role="status">
          {model.pendingRequirement}
        </p>
      ) : null}

      <div className={styles.summary} aria-live="polite">
        <span>
          Año: <strong>{model.created.year?.name ?? 'pendiente'}</strong>
        </span>
        <span>
          Cursos: <strong>{model.created.courses.length}</strong> · Niveles:{' '}
          <strong>{model.created.levels.length}</strong> · Secciones:{' '}
          <strong>{model.created.sections.length}</strong>
        </span>
      </div>

      {model.currentStep === 'year' ? (
        <div className={styles.panel}>
          <h2>1. Año lectivo</h2>
          <p className={styles.hint}>
            Defina el año lectivo institucional. Los cursos lectivos quedarán asociados a este año.
          </p>
          {model.created.year ? (
            <Alert>
              Año lectivo «{model.created.year.name}» creado. Puede continuar al siguiente paso.
            </Alert>
          ) : (
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Nombre</span>
                <Input
                  maxLength={150}
                  onChange={(e) => model.setYearDraft({ ...model.yearDraft, name: e.target.value })}
                  placeholder="2026"
                  required
                  value={model.yearDraft.name}
                />
              </label>
              <label className={styles.field}>
                <span>Fecha de inicio</span>
                <Input
                  onChange={(e) =>
                    model.setYearDraft({ ...model.yearDraft, startDate: e.target.value })
                  }
                  required
                  type="date"
                  value={model.yearDraft.startDate}
                />
              </label>
              <label className={styles.field}>
                <span>Fecha de fin</span>
                <Input
                  min={model.yearDraft.startDate || undefined}
                  onChange={(e) =>
                    model.setYearDraft({ ...model.yearDraft, endDate: e.target.value })
                  }
                  required
                  type="date"
                  value={model.yearDraft.endDate}
                />
              </label>
            </div>
          )}
          <div className={styles.actions}>
            {!model.created.year ? (
              <Button disabled={model.isSaving} onClick={() => void model.saveYear()} type="button">
                {model.isSaving ? 'Guardando…' : 'Guardar año lectivo'}
              </Button>
            ) : (
              <Button onClick={model.goNext} type="button">
                Continuar
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {model.currentStep === 'courses' ? (
        <div className={styles.panel}>
          <h2>2. Cursos lectivos</h2>
          <p className={styles.hint}>
            Cree uno o más cursos lectivos dentro del año «{model.created.year?.name}».
          </p>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Nombre</span>
              <Input
                maxLength={150}
                onChange={(e) =>
                  model.setCourseDraft({ ...model.courseDraft, name: e.target.value })
                }
                placeholder="I semestre 2026"
                value={model.courseDraft.name}
              />
            </label>
            <label className={styles.field}>
              <span>Inicio</span>
              <Input
                onChange={(e) =>
                  model.setCourseDraft({ ...model.courseDraft, startDate: e.target.value })
                }
                type="date"
                value={model.courseDraft.startDate}
              />
            </label>
            <label className={styles.field}>
              <span>Fin</span>
              <Input
                min={model.courseDraft.startDate || undefined}
                onChange={(e) =>
                  model.setCourseDraft({ ...model.courseDraft, endDate: e.target.value })
                }
                type="date"
                value={model.courseDraft.endDate}
              />
            </label>
          </div>
          <div className={styles.actions}>
            <Button onClick={model.addPendingCourse} type="button" variant="secondary">
              Añadir a la lista
            </Button>
          </div>
          {model.pendingCourses.length > 0 ? (
            <ul className={styles.list}>
              {model.pendingCourses.map((c, i) => (
                <li className={styles.listItem} key={`${c.name}-${i}`}>
                  <span>
                    {c.name} ({c.startDate} → {c.endDate})
                  </span>
                  <Button
                    onClick={() => model.removePendingCourse(i)}
                    type="button"
                    variant="secondary"
                  >
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          {model.created.courses.length > 0 ? (
            <p className={styles.hint}>
              Ya creados: {model.created.courses.map((c) => c.name).join(', ')}
            </p>
          ) : null}
          <div className={styles.actions}>
            <Button onClick={model.goBack} type="button" variant="secondary">
              Atrás
            </Button>
            <Button disabled={model.isSaving} onClick={() => void model.saveCourses()} type="button">
              {model.isSaving ? 'Guardando…' : 'Guardar cursos y continuar'}
            </Button>
          </div>
        </div>
      ) : null}

      {model.currentStep === 'levels' ? (
        <div className={styles.panel}>
          <h2>3. Niveles</h2>
          <p className={styles.hint}>Asocie niveles (grados) a un curso lectivo creado.</p>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Curso lectivo</span>
              <Select
                onChange={(e) =>
                  model.setLevelDraft({ ...model.levelDraft, academicPeriodId: e.target.value })
                }
                value={model.levelDraft.academicPeriodId}
              >
                <option value="">Seleccione…</option>
                {model.created.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className={styles.field}>
              <span>Nombre del nivel</span>
              <Input
                onChange={(e) => model.setLevelDraft({ ...model.levelDraft, name: e.target.value })}
                placeholder="Séptimo"
                value={model.levelDraft.name}
              />
            </label>
            <label className={styles.field}>
              <span>Grado</span>
              <Input
                max={12}
                min={1}
                onChange={(e) =>
                  model.setLevelDraft({ ...model.levelDraft, gradeLevel: e.target.value })
                }
                type="number"
                value={model.levelDraft.gradeLevel}
              />
            </label>
            <label className={styles.field}>
              <span>Descripción</span>
              <Input
                onChange={(e) =>
                  model.setLevelDraft({ ...model.levelDraft, description: e.target.value })
                }
                value={model.levelDraft.description}
              />
            </label>
          </div>
          <div className={styles.actions}>
            <Button onClick={model.addPendingLevel} type="button" variant="secondary">
              Añadir a la lista
            </Button>
          </div>
          {model.pendingLevels.length > 0 ? (
            <ul className={styles.list}>
              {model.pendingLevels.map((l, i) => (
                <li className={styles.listItem} key={`${l.name}-${i}`}>
                  <span>
                    {l.gradeLevel} · {l.name}
                  </span>
                  <Button
                    onClick={() => model.removePendingLevel(i)}
                    type="button"
                    variant="secondary"
                  >
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          {model.created.levels.length > 0 ? (
            <p className={styles.hint}>
              Ya creados: {model.created.levels.map((l) => l.name).join(', ')}
            </p>
          ) : null}
          <div className={styles.actions}>
            <Button onClick={model.goBack} type="button" variant="secondary">
              Atrás
            </Button>
            <Button disabled={model.isSaving} onClick={() => void model.saveLevels()} type="button">
              {model.isSaving ? 'Guardando…' : 'Guardar niveles y continuar'}
            </Button>
          </div>
        </div>
      ) : null}

      {model.currentStep === 'sections' ? (
        <div className={styles.panel}>
          <h2>4. Secciones</h2>
          <p className={styles.hint}>
            Cree secciones (cascarón vacío) con cupo máximo obligatorio. Se pedirá confirmación antes
            de guardar.
          </p>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Nivel</span>
              <Select
                onChange={(e) =>
                  model.setSectionDraft({ ...model.sectionDraft, sectionId: e.target.value })
                }
                value={model.sectionDraft.sectionId}
              >
                <option value="">Seleccione…</option>
                {model.created.levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.gradeLevel} · {l.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className={styles.field}>
              <span>Nombre de la sección</span>
              <Input
                onChange={(e) =>
                  model.setSectionDraft({ ...model.sectionDraft, name: e.target.value })
                }
                placeholder="7-1"
                value={model.sectionDraft.name}
              />
            </label>
            <label className={styles.field}>
              <span>Cupo máximo</span>
              <Input
                min={1}
                onChange={(e) =>
                  model.setSectionDraft({ ...model.sectionDraft, maxCapacity: e.target.value })
                }
                type="number"
                value={model.sectionDraft.maxCapacity}
              />
            </label>
            <label className={styles.field}>
              <span>Especialidad (opcional)</span>
              <Select
                onChange={(e) =>
                  model.setSectionDraft({ ...model.sectionDraft, specialtyId: e.target.value })
                }
                value={model.sectionDraft.specialtyId}
              >
                <option value="">Sin especialidad</option>
                {model.specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className={styles.actions}>
            <Button onClick={model.addPendingSection} type="button" variant="secondary">
              Añadir a la lista
            </Button>
          </div>
          {model.pendingSections.length > 0 ? (
            <ul className={styles.list}>
              {model.pendingSections.map((s, i) => (
                <li className={styles.listItem} key={`${s.name}-${i}`}>
                  <span>
                    {s.name} · cupo {s.maxCapacity}
                  </span>
                  <Button
                    onClick={() => model.removePendingSection(i)}
                    type="button"
                    variant="secondary"
                  >
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          {model.created.sections.length > 0 ? (
            <p className={styles.hint}>
              Ya creadas: {model.created.sections.map((s) => s.name).join(', ')}
            </p>
          ) : null}
          <div className={styles.actions}>
            <Button onClick={model.goBack} type="button" variant="secondary">
              Atrás
            </Button>
            <Button
              disabled={model.isSaving}
              onClick={model.requestSaveSections}
              type="button"
            >
              Guardar secciones
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        confirmLabel="Confirmar y crear"
        isOpen={model.confirmSectionsOpen}
        isSubmitting={model.isSaving}
        message={`Se crearán ${
          model.pendingSections.length || (model.sectionDraft.name.trim() ? 1 : 0)
        } sección(es) vacías con el cupo indicado.`}
        onCancel={() => model.setConfirmSectionsOpen(false)}
        onConfirm={() => void model.saveSections()}
        secondary="Las secciones inician sin estudiantes matriculados (cascarón)."
        title="Confirmar creación de secciones"
        tone="primary"
      />
    </section>
  );
}
