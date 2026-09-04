import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Layers, Wrench } from 'lucide-react';
import type { SpecialtyHubCover, SpecialtyKind } from '@/entities/specialty';
import { resolveUploadUrl, specialtyApi } from '@/features/manage-specialty/api/specialtyApi';
import { Alert, Button, Modal } from '@/shared/ui';
import styles from './AcademicOfferHub.module.css';

const CARDS: Array<{
  kind: SpecialtyKind;
  title: string;
  subtitle: string;
  to: string;
  icon: typeof Layers;
}> = [
  {
    kind: 'EXPLORATORY_WORKSHOP',
    title: 'Talleres exploratorios',
    subtitle: 'Oferta para séptimo a noveno',
    to: '/admin/specialties/workshops',
    icon: Layers,
  },
  {
    kind: 'TECHNICAL_SPECIALTY',
    title: 'Especialidades técnicas',
    subtitle: 'Oferta para décimo a duodécimo',
    to: '/admin/specialties/technical',
    icon: Wrench,
  },
];

export const AcademicOfferHub = () => {
  const navigate = useNavigate();
  const [covers, setCovers] = useState<SpecialtyHubCover[]>([]);
  const [counts, setCounts] = useState<Partial<Record<SpecialtyKind, number>>>({});
  const [error, setError] = useState<string | null>(null);
  const [configKind, setConfigKind] = useState<SpecialtyKind | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [hubCovers, workshops, technical] = await Promise.all([
        specialtyApi.listHubCovers(),
        specialtyApi.list('EXPLORATORY_WORKSHOP'),
        specialtyApi.list('TECHNICAL_SPECIALTY'),
      ]);
      setCovers(hubCovers);
      setCounts({
        EXPLORATORY_WORKSHOP: workshops.length,
        TECHNICAL_SPECIALTY: technical.length,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar la oferta académica.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewFile]);

  const coverByKind = useMemo(() => {
    const map = new Map<SpecialtyKind, string | null>();
    for (const cover of covers) {
      map.set(cover.kind, resolveUploadUrl(cover.imageUrl));
    }
    return map;
  }, [covers]);

  const openConfig = (kind: SpecialtyKind) => {
    setConfigKind(kind);
    setPreviewFile(null);
  };

  const closeConfig = () => {
    if (isSaving) return;
    setConfigKind(null);
    setPreviewFile(null);
  };

  const saveCover = async () => {
    if (!configKind || !previewFile) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await specialtyApi.uploadHubCover(configKind, previewFile);
      setCovers((current) => {
        const next = current.filter((item) => item.kind !== configKind);
        return [...next, updated];
      });
      setConfigKind(null);
      setPreviewFile(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar la imagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearCover = async () => {
    if (!configKind) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await specialtyApi.clearHubCover(configKind);
      setCovers((current) => {
        const next = current.filter((item) => item.kind !== configKind);
        return [...next, updated];
      });
      setPreviewFile(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo quitar la imagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const configTitle =
    configKind === 'EXPLORATORY_WORKSHOP'
      ? 'Configurar tarjeta de talleres'
      : 'Configurar tarjeta de especialidades';

  const modalPreview =
    previewUrl ?? (configKind ? coverByKind.get(configKind) ?? null : null);

  const hasStoredCover = Boolean(configKind && coverByKind.get(configKind));

  return (
    <div className={styles.hub}>
      {error ? <Alert>{error}</Alert> : null}
      <div className={styles.grid}>
        {CARDS.map((card) => {
          const Icon = card.icon;
          const imageUrl = coverByKind.get(card.kind) ?? null;
          const count = counts[card.kind] ?? 0;
          return (
            <article className={styles.card} key={card.kind}>
              {imageUrl ? (
                <img alt="" className={styles.cardImage} src={imageUrl} />
              ) : null}
              <div className={styles.overlay} />
              <div className={styles.cardBody}>
                <span className={styles.cardIcon}>
                  <Icon size={22} />
                </span>
                <h2>{card.title}</h2>
                <p>{card.subtitle}</p>
                <small>
                  {count} {count === 1 ? 'registro' : 'registros'}
                </small>
                <div className={styles.cardActions}>
                  <Button onClick={() => navigate(card.to)} type="button">
                    Ver
                  </Button>
                  <Button
                    onClick={() => openConfig(card.kind)}
                    type="button"
                    variant="secondary"
                  >
                    <ImagePlus size={16} />
                    Configurar
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal isOpen={configKind !== null} onClose={closeConfig} title={configTitle}>
        <div className={styles.configBody}>
          <div className={styles.configPreview}>
            {modalPreview ? (
              <img alt="" className={styles.cardImage} src={modalPreview} />
            ) : null}
            <div className={styles.overlay} />
            <span>Vista previa</span>
          </div>
          <label className={styles.fileLabel}>
            Elegir imagen (JPEG, PNG o WebP, máx. 3 MB)
            <input
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setPreviewFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <div className={styles.configActions}>
            <Button disabled={isSaving || !previewFile} onClick={() => void saveCover()} type="button">
              {isSaving ? 'Guardando…' : 'Guardar imagen'}
            </Button>
            <Button
              disabled={isSaving || !hasStoredCover}
              onClick={() => void clearCover()}
              type="button"
              variant="danger"
            >
              Quitar imagen
            </Button>
            <Button disabled={isSaving} onClick={closeConfig} type="button" variant="secondary">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
