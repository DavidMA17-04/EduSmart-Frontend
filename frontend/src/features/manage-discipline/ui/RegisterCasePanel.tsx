import { portalPathForSession } from '@/shared/auth/portalPaths';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Input, Select, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { isLateReport, validateCaseForm } from '../model/caseForm';
import { disciplineCasePath } from '../model/disciplineRouting';
import { SEVERITY_LABELS, TRACK_LABELS } from '../model/severity';
import type { CreatedDisciplinaryCase, DisciplinaryStudentHit, InfractionType } from '../model/types';
import styles from './RegisterCasePanel.module.css';

const EMPTY_ERRORS: Record<string, string> = {};

export const RegisterCasePanel = () => {
  const [types, setTypes] = useState<InfractionType[]>([]);
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([]);
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<DisciplinaryStudentHit[]>([]);
  const [student, setStudent] = useState<DisciplinaryStudentHit | null>(null);
  const [infractionTypeId, setInfractionTypeId] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [lateReportReason, setLateReportReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>(EMPTY_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<CreatedDisciplinaryCase | null>(null);
  const [fileWarning, setFileWarning] = useState<string | null>(null);

  useEffect(() => {
    void disciplineApi.listInfractionOptions().then(setTypes).catch(() => setFormError('No se pudo cargar el catálogo de faltas.'));
    void disciplineApi.listSubjects().then((rows) => {
      setSubjects(rows.filter((row) => row.status === 'ACTIVE').map((row) => ({ id: row.id, name: row.name })));
    }).catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setStudents([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void disciplineApi.searchStudents(term).then(setStudents).catch(() => setStudents([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const selectedType = useMemo(
    () => types.find((type) => String(type.id) === infractionTypeId) ?? null,
    [types, infractionTypeId],
  );
  const late = isLateReport(occurredAt, selectedType?.track ?? null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCaseForm(
      {
        studentUserId: student?.id ?? null,
        infractionTypeId: selectedType?.id ?? null,
        occurredAt,
        place,
        description,
        witnesses,
        lateReportReason,
        subjectId,
        files: files.map((file) => ({ name: file.name, size: file.size })),
      },
      selectedType?.track ?? null,
    );
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length || !student || !selectedType) return;

    setSaving(true);
    try {
      const saved = await disciplineApi.createCase({
        studentUserId: student.id,
        infractionTypeId: selectedType.id,
        occurredAt: new Date(occurredAt).toISOString(),
        place: place.trim(),
        description: description.trim(),
        witnesses: witnesses.trim() || undefined,
        subjectId: subjectId ? Number(subjectId) : undefined,
        lateReportReason: late ? lateReportReason.trim() : undefined,
      });
      setCreated(saved);
      const failed: string[] = [];
      for (const file of files) {
        try {
          await disciplineApi.uploadEvidence(saved.id, file);
        } catch (error) {
          failed.push(error instanceof Error ? `${file.name}: ${error.message}` : file.name);
        }
      }
      setFileWarning(failed.length ? failed.join(' ') : null);
    } catch (error) {
      if (error instanceof DisciplineApiError && error.field) {
        setErrors({ [error.field]: error.message });
      }
      setFormError(error instanceof Error ? error.message : 'No se pudo registrar la amonestación.');
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    return (
      <section className={styles.confirmation}>
        <p className={styles.kicker}>Expediente abierto</p>
        <h2>{created.caseNumber}</h2>
        <p>
          {created.severityLabel} · rebajo propuesto de {created.deduction} puntos · {TRACK_LABELS[created.track]}
        </p>
        {created.missingGuideTeacher ? (
          <Alert>La sección no tiene docente guía. Dirección puede conducir el expediente.</Alert>
        ) : null}
        {created.isLateReport ? <Alert>El reporte quedó marcado como extemporáneo.</Alert> : null}
        {fileWarning ? <Alert>{`El expediente se guardó, pero alguna evidencia no se adjuntó. ${fileWarning}`}</Alert> : null}
        <div className={styles.actions}>
          <Link className={styles.openCase} to={portalPathForSession(disciplineCasePath(created.id))}>
            Abrir el expediente
          </Link>
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            Registrar otra
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {formError ? <Alert>{formError}</Alert> : null}
      <fieldset className={styles.section}>
        <legend>1. A quién se amonesta</legend>
      <label className={styles.field}>
        <span>Estudiante</span>
        <Input
          value={query}
          placeholder="Nombre, apellido o cédula"
          onChange={(event) => {
            setQuery(event.target.value);
            setStudent(null);
          }}
        />
        {student ? (
          <strong>
            {student.fullName} · {student.sectionLabel ?? 'Sin sección'} · {student.nationalId}
          </strong>
        ) : null}
        {errors.studentUserId ? <small>{errors.studentUserId}</small> : null}
        {students.length > 0 && !student ? (
          <ul className={styles.results}>
            {students.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  onClick={() => {
                    setStudent(hit);
                    setQuery(hit.fullName);
                    setStudents([]);
                  }}
                >
                  {hit.fullName}
                  <span>{hit.sectionLabel ?? 'Sin sección'}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </label>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>2. Qué falta y qué sigue</legend>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Tipo de falta</span>
          <Select value={infractionTypeId} onChange={(event) => setInfractionTypeId(event.target.value)}>
            <option value="">Seleccione</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
          {errors.infractionTypeId ? <small>{errors.infractionTypeId}</small> : null}
        </label>
        <div className={styles.readonly}>
          <span>Gravedad y rebajo</span>
          <strong>
            {selectedType
              ? `${SEVERITY_LABELS[selectedType.severity]} · ${selectedType.deduction} puntos · ${TRACK_LABELS[selectedType.track]}`
              : 'Se calcula al elegir la falta'}
          </strong>
        </div>
      </div>
      {selectedType ? (
        <p className={styles.preview}>
          {selectedType.track === 'DIRECT'
            ? 'Esta falta no se investiga. Al registrarla se notifica al encargado y corre la revocatoria.'
            : 'Esta falta abre debido proceso. Primero queda reportada; el guía debe iniciar la investigación.'}
        </p>
      ) : null}
      </fieldset>

      <fieldset className={styles.section}>
        <legend>3. Los hechos</legend>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Fecha y hora del hecho</span>
          <Input type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
          {errors.occurredAt ? <small>{errors.occurredAt}</small> : null}
        </label>
        <label className={styles.field}>
          <span>Lugar</span>
          <Input value={place} onChange={(event) => setPlace(event.target.value)} />
          {errors.place ? <small>{errors.place}</small> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Descripción de los hechos</span>
        <Textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
        {errors.description ? <small>{errors.description}</small> : null}
      </label>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Testigos (opcional)</span>
          <Input value={witnesses} onChange={(event) => setWitnesses(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Asignatura (opcional)</span>
          <Select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
            <option value="">Sin asignatura</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {late ? (
        <label className={styles.field}>
          <span>Justificación del reporte extemporáneo</span>
          <Textarea rows={3} value={lateReportReason} onChange={(event) => setLateReportReason(event.target.value)} />
          {errors.lateReportReason ? <small>{errors.lateReportReason}</small> : null}
        </label>
      ) : null}

      <label className={styles.field}>
        <span>Evidencias (PDF, JPG o PNG, máximo 5 de 10 MB)</span>
        <Input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
        />
        {errors.files ? <small>{errors.files}</small> : null}
      </label>
      </fieldset>

      <div className={styles.actions}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando…' : 'Registrar amonestación'}
        </Button>
      </div>
    </form>
  );
};
