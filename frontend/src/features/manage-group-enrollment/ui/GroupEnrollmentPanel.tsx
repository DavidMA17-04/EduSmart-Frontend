import { Plus } from 'lucide-react';
import { Alert, Button, Card } from '@/shared/ui';
import type { GroupEnrollmentPanelModel } from '../model/useGroupEnrollmentPanel';
import { BatchEnrollModal } from './BatchEnrollModal';
import { GroupEnrollmentList } from './GroupEnrollmentList';
import styles from './GroupEnrollmentPanel.module.css';

type Props = {
  model: GroupEnrollmentPanelModel;
};

export function GroupEnrollmentPanel({ model }: Props) {
  if (!model.groupId) {
    return (
      <Card className={styles.panel}>
        <p className={styles.muted}>
          Seleccione una sección en la tabla para ver y gestionar su matrícula.
        </p>
      </Card>
    );
  }

  if (!model.canView) {
    return null;
  }

  return (
    <>
      <Card className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h3>Estudiantes matriculados</h3>
            <p>
              {model.groupLabel
                ? `Sección ${model.groupLabel}`
                : `Grupo #${model.groupId}`}
            </p>
          </div>
          {model.canCreate && (
            <Button onClick={model.openModal} type="button">
              <Plus size={16} /> Matricular estudiantes
            </Button>
          )}
        </div>

        {model.loadError && <Alert>{model.loadError}</Alert>}

        <GroupEnrollmentList
          enrollments={model.enrollments}
          isLoading={model.isLoading}
        />
      </Card>

      <BatchEnrollModal model={model} />
    </>
  );
}
