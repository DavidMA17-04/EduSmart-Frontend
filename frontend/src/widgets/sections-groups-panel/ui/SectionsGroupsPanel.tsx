import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Table, Tabs } from '@/shared/ui';
import { SectionTableRow } from '@/entities/section';
import { useSectionsGroupsPanel } from '../model/useSectionsGroupsPanel';
import { GroupsTabView } from './GroupsTabView';
import { GuideTeacherTabView } from './GuideTeacherTabView';
import { SectionDetailPanel } from './SectionDetailPanel';
import { SectionGroupsAccordion } from './SectionGroupsAccordion';
import styles from './SectionsGroupsPanel.module.css';

export const SectionsGroupsPanel = () => {
  const model = useSectionsGroupsPanel();

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
        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            <Card className={styles.heading}>
              <div>
                <h2>Niveles académicos</h2>
                <p>Administre los niveles académicos de la institución.</p>
              </div>
              <Button onClick={model.createSectionMode} type="button">
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
                              onClick={() => model.selectSection(section.id)}
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
          </div>

          <div className={styles.detailPanel}>
            <SectionDetailPanel
              model={model}
              onGoToTeachersTab={() => model.setActiveTab('docentes')}
            />
          </div>
        </div>
      )}

      {model.activeTab === 'grupos' && <GroupsTabView model={model} />}
      {model.activeTab === 'docentes' && <GuideTeacherTabView model={model} />}
    </section>
  );
};
