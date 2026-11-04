import { FormEvent, useEffect, useState } from 'react';
import { CalendarOff } from 'lucide-react';
import { Alert, Button, EmptyState, Input, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import { validateDisciplinarySettings, validateNonWorkingDay } from '../model/calendarSettings';
import type { DisciplinarySettings, NonWorkingDay } from '../model/types';
import styles from './DisciplineCalendarPanel.module.css';

export const DisciplineCalendarPanel = () => {
  const [days, setDays] = useState<NonWorkingDay[]>([]);
  const [settings, setSettings] = useState<DisciplinarySettings>({ recidivismThreshold: 3, conductAlertThreshold: 80 });
  const [day, setDay] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    void Promise.all([disciplineApi.listNonWorkingDays(), disciplineApi.getDisciplinarySettings()])
      .then(([nextDays, nextSettings]) => {
        setDays(nextDays);
        setSettings(nextSettings);
        setError(null);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar el calendario.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addDay = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateNonWorkingDay(day, reason);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await disciplineApi.createNonWorkingDay({ day, reason: reason.trim() });
      setDay('');
      setReason('');
      setNotice('Día no hábil registrado. Los plazos abiertos se recalculan en la siguiente consulta.');
      load();
    } catch (caught) {
      setError(caught instanceof DisciplineApiError ? caught.message : 'No se pudo registrar el día.');
    } finally {
      setSaving(false);
    }
  };

  const removeDay = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await disciplineApi.deleteNonWorkingDay(id);
      setNotice('Día no hábil eliminado. Los plazos abiertos se recalculan en la siguiente consulta.');
      load();
    } catch (caught) {
      setError(caught instanceof DisciplineApiError ? caught.message : 'No se pudo eliminar el día.');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateDisciplinarySettings(settings);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await disciplineApi.updateDisciplinarySettings(settings);
      setSettings(saved);
      setNotice('Umbrales actualizados.');
    } catch (caught) {
      setError(caught instanceof DisciplineApiError ? caught.message : 'No se pudieron guardar los umbrales.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.layout}>
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <p className={styles.notice}>{notice}</p> : null}
      <section className={styles.card}>
        <h2>Días no hábiles</h2>
        <p>Feriados, vacaciones o suspensiones de lecciones. No se cuentan en los plazos del expediente.</p>
        <form className={styles.form} onSubmit={addDay}>
          <label>
            Fecha
            <Input type="date" value={day} onChange={(event) => setDay(event.target.value)} />
          </label>
          <label>
            Motivo
            <Textarea rows={2} value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
          <Button type="submit" disabled={saving}>
            Agregar día
          </Button>
        </form>
        {loading ? <p className={styles.muted}>Cargando calendario…</p> : null}
        {!loading && days.length === 0 ? (
          <EmptyState description="Agregue los feriados y las suspensiones del curso lectivo." icon={CalendarOff} title="Sin días no hábiles" />
        ) : null}
        <ul className={styles.list}>
          {days.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{formatShortDate(item.day)}</strong>
                <span>{item.reason}</span>
              </div>
              <Button type="button" variant="secondary" disabled={saving} onClick={() => void removeDay(item.id)}>
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Umbrales de alerta</h2>
        <form className={styles.form} onSubmit={saveSettings}>
          <label>
            Reincidencia (expedientes en el período)
            <Input
              type="number"
              min={1}
              max={50}
              value={settings.recidivismThreshold}
              onChange={(event) =>
                setSettings((current) => ({ ...current, recidivismThreshold: Number(event.target.value) }))
              }
            />
          </label>
          <label>
            Nota de conducta baja
            <Input
              type="number"
              min={0}
              max={100}
              value={settings.conductAlertThreshold}
              onChange={(event) =>
                setSettings((current) => ({ ...current, conductAlertThreshold: Number(event.target.value) }))
              }
            />
          </label>
          <Button type="submit" disabled={saving}>
            Guardar umbrales
          </Button>
        </form>
      </section>
    </div>
  );
};
