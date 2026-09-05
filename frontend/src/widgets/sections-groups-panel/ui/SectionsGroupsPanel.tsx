import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Modal, Table, Tabs } from '@/shared/ui';
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

  return (
    <section className={styles.panelRoot}>
      <Tabs
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
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Nivel</th>
                    <th>Especialidad</th>
                    <th>Cantidad de secciones</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {model.sections.map((section) => (
                    <SectionTableRow
                      actions={
                        <span className={styles.rowActions}>
                          <Button
                            aria-label={`Editar ${section.name}`}
                            onClick={() => model.openEditSectionDialog(section.id)}
                            size="icon"
                            type="button"
                            variant="secondary"
                          >
                            <Edit3 />
                          </Button>
                          <Button
                            aria-label={`Inactivar ${section.name}`}
                            onClick={() => void model.deactivateSelectedSection(section)}
                            size="icon"
                            type="button"
                            variant="danger"
                          >
                            <Trash2 />
                          </Button>
                        </span>
                      }
                      isSelected={section.id === model.selectedSectionId}
                      key={section.id}
                      onSelect={model.selectSection}
                      section={section}
                    />
                  ))}
                  {model.sections.length === 0 && (
                    <tr>
                      <td className={styles.empty} colSpan={6}>
                        No se encontraron niveles académicos.
                      </td>
                    </tr>
                  )}
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

      <Modal
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
          specialties={model.specialties}
          submitLabel={sectionSubmitLabel}
          values={model.sectionForm.values}
        />
      </Modal>

      <Modal
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
          submitLabel={groupSubmitLabel}
          values={model.groupForm.values}
        />
      </Modal>

      <Modal
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
      </Modal>
    </section>
  );
};
