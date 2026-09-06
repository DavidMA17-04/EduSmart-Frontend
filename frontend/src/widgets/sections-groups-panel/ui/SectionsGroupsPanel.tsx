import { Edit3, Layers, Plus, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ModalCrud,
  RowActionButton,
  RowActions,
  SegmentedTabs,
  Table,
} from '@/shared/ui';
import { SectionTableRow } from '@/entities/section';
import { GroupForm, GuideTeacherForm } from '@/features/manage-group';
import { SectionForm } from '@/features/manage-section';
import { useSectionsGroupsPanel } from '../model/useSectionsGroupsPanel';
import { GroupsTabView } from './GroupsTabView';
import { GuideTeacherTabView } from './GuideTeacherTabView';
import { SectionDetailPanel } from './SectionDetailPanel';
import { SectionGroupsAccordion } from './SectionGroupsAccordion';
import styles from './SectionsGroupsPanel.module.css';

export const SectionsGroupsPanel = () => {
  const model = useSectionsGroupsPanel();
  const sectionDialogTitle = model.sectionDialogMode === 'create' ? 'Nuevo nivel' : 'Editar nivel';
  const sectionSubmitLabel = model.sectionDialogMode === 'create' ? 'Crear nivel' : 'Guardar cambios';
  const groupDialogTitle = model.groupFormMode === 'create' ? 'Nueva sección' : 'Editar sección';
  const groupSubmitLabel = model.groupFormMode === 'create' ? 'Crear sección' : 'Guardar cambios';
  const teacherDialogTitle = model.teacherFormMode === 'create' ? 'Nuevo docente guía' : 'Editar docente guía';
  const teacherSubmitLabel = model.teacherFormMode === 'create' ? 'Crear docente' : 'Guardar cambios';

  const pending = model.pendingConfirm;
  const confirmBusy =
    model.isSectionSubmitting || model.isGroupSubmitting || model.isTeacherSubmitting;

  let confirmTitle = '';
  let confirmMessage = '';
  let confirmSecondary: string | undefined;
  let confirmLabel = 'Confirmar';
  if (pending?.type === 'deactivate-section') {
    confirmTitle = 'Inactivar nivel';
    confirmMessage = `¿Inactivar el nivel ${pending.section.name}?`;
    confirmSecondary = 'El nivel dejará de estar disponible para nuevas asignaciones.';
    confirmLabel = 'Inactivar';
  } else if (pending?.type === 'remove-group') {
    confirmTitle = 'Eliminar sección';
    confirmMessage = `¿Eliminar la sección ${pending.group.name}?`;
    confirmLabel = 'Eliminar';
  } else if (pending?.type === 'remove-teacher') {
    confirmTitle = 'Eliminar docente guía';
    confirmMessage = `¿Eliminar al docente ${pending.teacher.name}?`;
    confirmSecondary = 'Se inactivará y se quitará de las secciones asignadas.';
    confirmLabel = 'Eliminar';
  }

  return (
    <section className={styles.panelRoot}>
      <SegmentedTabs
        aria-label="Secciones del panel"
        items={[
          { id: 'niveles', label: 'Niveles' },
          { id: 'grupos', label: 'Secciones' },
          { id: 'docentes', label: 'Docentes guía' },
        ]}
        onChange={model.setActiveTab}
        value={model.activeTab}
      />

      {model.loadError && <Alert>{model.loadError}</Alert>}
      {model.guideTeachersError && <Alert>{model.guideTeachersError}</Alert>}
      {model.sectionMutationError && <Alert>{model.sectionMutationError}</Alert>}

      {model.activeTab === 'niveles' && (
        <div className={styles.mainColumn}>
          <Card className={styles.heading}>
            <div>
              <h2>Niveles académicos</h2>
              <p>Administre los niveles académicos de la institución.</p>
            </div>
            <Button onClick={model.openCreateSectionDialog} type="button">
              <Plus size={16} /> Nuevo nivel
            </Button>
          </Card>

          <Card className={styles.tableCard}>
            {model.isLoading ? (
              <p className={styles.muted}>Cargando niveles…</p>
            ) : model.sections.length === 0 ? (
              <EmptyState
                action={{
                  label: 'Nuevo nivel',
                  onClick: model.openCreateSectionDialog,
                  icon: Plus,
                }}
                description="Aún no hay niveles académicos registrados."
                icon={Layers}
                title="Sin niveles académicos"
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Nivel</th>
                    <th>Cantidad de secciones</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {model.sections.map((section) => (
                    <SectionTableRow
                      actions={
                        <RowActions>
                          <RowActionButton
                            aria-label={`Editar ${section.name}`}
                            onClick={() => model.openEditSectionDialog(section.id)}
                            title="Editar"
                            tone="primary"
                          >
                            <Edit3 size={16} />
                          </RowActionButton>
                          <RowActionButton
                            aria-label={`Inactivar ${section.name}`}
                            onClick={() => model.deactivateSelectedSection(section)}
                            title="Inactivar"
                            tone="danger"
                          >
                            <Trash2 size={16} />
                          </RowActionButton>
                        </RowActions>
                      }
                      isSelected={section.id === model.selectedSectionId}
                      key={section.id}
                      onSelect={model.selectSection}
                      section={section}
                    />
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <SectionGroupsAccordion model={model} />

          <SectionDetailPanel
            model={model}
            onGoToTeachersTab={() => model.setActiveTab('docentes')}
          />
        </div>
      )}

      {model.activeTab === 'grupos' && <GroupsTabView model={model} />}
      {model.activeTab === 'docentes' && <GuideTeacherTabView model={model} />}

      <ModalCrud
        isOpen={model.sectionDialogMode !== null}
        onClose={model.closeSectionDialog}
        title={sectionDialogTitle}
      >
        {model.sectionMutationError && <Alert>{model.sectionMutationError}</Alert>}
        <SectionForm
          academicPeriods={model.academicPeriods}
          isSubmitting={model.isSectionSubmitting}
          onCancel={model.closeSectionDialog}
          onChange={model.sectionForm.setField}
          onSubmit={model.sectionForm.submit}
          submitLabel={sectionSubmitLabel}
          values={model.sectionForm.values}
        />
      </ModalCrud>

      <ModalCrud
        isOpen={model.groupFormMode !== null}
        onClose={model.closeGroupDialog}
        title={groupDialogTitle}
      >
        {model.groupMutationError && <Alert>{model.groupMutationError}</Alert>}
        <GroupForm
          guideTeachers={model.guideTeachers}
          isSubmitting={model.isGroupSubmitting}
          onCancel={model.closeGroupDialog}
          onChange={model.groupForm.setField}
          onSubmit={model.groupForm.submit}
          sections={model.sections}
          specialties={model.specialties}
          submitLabel={groupSubmitLabel}
          values={model.groupForm.values}
        />
      </ModalCrud>

      <ModalCrud
        isOpen={model.teacherFormMode !== null}
        onClose={model.closeTeacherDialog}
        title={teacherDialogTitle}
      >
        {model.teacherMutationError && <Alert>{model.teacherMutationError}</Alert>}
        <GuideTeacherForm
          errors={model.teacherForm.errors}
          isSubmitting={model.isTeacherSubmitting}
          onCancel={model.closeTeacherDialog}
          onChange={model.teacherForm.setField}
          onSubmit={model.teacherForm.submit}
          submitLabel={teacherSubmitLabel}
          values={model.teacherForm.values}
        />
      </ModalCrud>

      <ConfirmDialog
        confirmLabel={confirmLabel}
        icon={Trash2}
        isOpen={pending !== null}
        isSubmitting={confirmBusy}
        message={confirmMessage}
        onCancel={model.cancelPendingConfirm}
        onConfirm={() => void model.confirmPendingAction()}
        secondary={confirmSecondary}
        title={confirmTitle}
        tone="danger"
      />
    </section>
  );
};
