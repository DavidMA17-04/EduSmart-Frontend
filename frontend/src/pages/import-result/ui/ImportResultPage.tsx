import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImportResultPanel } from '@/components/user-onboarding';
import { importResultApi } from '@/features/manage-user-import';
import type { ImportResult } from '@/entities/user-import';
import { Alert } from '@/shared/ui';
import { HttpError } from '@/shared/api';
import styles from '../../user-create/ui/UserPages.module.css';

export const ImportResultPage = () => {
  const { jobId = '' } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    importResultApi.getById(jobId)
      .then((payload) => { if (active) setResult(payload); })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof HttpError ? err.message : 'No se pudo cargar el resultado de importación.');
      });
    return () => { active = false; };
  }, [jobId]);

  return (
    <section className={styles.page}>
      <p className={styles.breadcrumb}>Administrativo <span>›</span> Usuarios <span>›</span> Resultado de importación</p>
      {error && <Alert>{error}</Alert>}
      {!error && !result && <Alert>Cargando resultado…</Alert>}
      {result && <ImportResultPanel result={result} onReset={() => navigate('/onboarding')} />}
      <Link className={styles.backLink} to="/onboarding">Volver a incorporación</Link>
    </section>
  );
};
